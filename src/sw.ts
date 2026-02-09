/// <reference lib="webworker" />
import { db, IngestionJob, PendingRepoData } from './utils/db';
import { transcribeAudio, generateSRT } from './services/whisperService';
import { analyzeAsset, generateRepoStructure } from './services/gemini/repo/index';

// Type declaration for workbox manifest
declare const self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// @ts-ignore
const manifest = self.__WB_MANIFEST;
if (manifest) {
    // Prevent tree-shaking
    console.log('SW Manifest injected', manifest);
}

// cleanup old caches
const CACHE_NAME = 'trem-ai-cache-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Job Queue Manager
class JobManager {
    private isProcessing = false;
    private processingJobs = new Set<string>();

    async addJob(job: IngestionJob) {
        // Persist to DB? 
        // Actually, the main thread likely persists the 'PendingRepoData'
        // effectively queueing it. 
        // But the SW needs to know what to work on.
        // Let's assume we receive a 'START_JOB' message with the ID.
        await this.processJob(job.repoId);
    }

    async processJob(repoId: string) {
        if (this.processingJobs.has(repoId)) {
            console.log(`[SW] Job ${repoId} already actively processing. Ignoring duplicate start request.`);
            return;
        }

        this.processingJobs.add(repoId);

        try {
            // 1. Get Repo Data
            const repo = await db.getPendingRepo(repoId);
            if (!repo || repo.jobStatus === 'completed' || repo.jobStatus === 'ready_to_commit') {
                this.processingJobs.delete(repoId);
                return;
            }

            console.log(`[SW] Starting ingestion for ${repo.name}`);

            // Notify Clients
            this.broadcast({ type: 'JOB_STARTED', repoId });

            // 2. Iterate Assets
            for (let i = 0; i < repo.assets.length; i++) {
                const asset = repo.assets[i];

                // Skip if already done
                if (asset.status === 'ready') continue;

                // Update status
                asset.status = 'processing';
                repo.assets[i] = asset;
                await db.updatePendingRepo(repoId, { assets: repo.assets });
                this.broadcast({ type: 'ASSET_UPDATE', repoId, asset });

                try {
                    // Real Processing in Background
                    console.log(`[SW] Processing asset ${asset.name} (${asset.type})`);
                    await this.log(repoId, `Processing ${asset.name} (${asset.type})...`);

                    // 1. Transcribe (Dual Mode: Whisper + WhisperX)

                    // 1. Transcribe (Dual Mode: Whisper + WhisperX)
                    // Prefer optimized audio if available (created by main thread)
                    // @ts-ignore
                    const audioBlob = (asset.meta?.optimizedAudio as Blob) || asset.blob;

                    if (audioBlob && (asset.type === 'video' || asset.type === 'audio')) {
                        console.log(`[SW] Transcribing ${asset.name} (Standard Whisper)...`);
                        await this.log(repoId, `🎤 Transcribing ${asset.name}...`);
                        // @ts-ignore
                        const standard = await transcribeAudio(audioBlob);

                        const transcriptPreview = (standard.text || '').slice(0, 50);
                        await this.log(repoId, `✅ Transcription complete: "${transcriptPreview}..."`);

                        asset.meta = {
                            ...asset.meta,
                            transcription: standard,
                            srt: standard.srt
                        };
                    }

                    // 2. Analyze Content (Gemini)
                    if (asset.blob) {
                        console.log(`[SW] Analyzing ${asset.name}...`);
                        await this.log(repoId, `🔍 Analyzing ${asset.name} with AI...`);
                        // @ts-ignore - TS might complain about types if not perfectly aligned but logic holds
                        const analysis = await analyzeAsset({
                            id: asset.id,
                            name: asset.name,
                            blob: asset.blob,
                            // Use pre-extracted frames from main thread
                            // @ts-ignore
                            images: asset.meta?.frames
                        });

                        const tagsPreview = (analysis.tags || []).slice(0, 3).join(', ');
                        await this.log(repoId, `✅ Analysis complete. Tags: [${tagsPreview}]`);

                        asset.meta = { ...asset.meta, analysis };
                        asset.tags = analysis.tags;
                        // Description could go into meta or a separate field if AssetData had one
                    }

                    asset.status = 'ready';
                    asset.progress = 100;
                    repo.assets[i] = asset;

                    await this.log(repoId, `✨ ${asset.name} completed!`);

                    // Incremental save
                    await db.updatePendingRepo(repoId, { assets: repo.assets });
                    this.broadcast({ type: 'ASSET_UPDATE', repoId, asset });

                } catch (e) {
                    console.error(`[SW] Asset failed`, e);
                    await this.log(repoId, `❌ ${asset.name} failed: ${String(e)}`);
                    asset.status = 'error';
                    asset.meta = { ...asset.meta, error: String(e) };
                    repo.assets[i] = asset;
                    await db.updatePendingRepo(repoId, { assets: repo.assets });
                    this.broadcast({ type: 'ASSET_UPDATE', repoId, asset });
                }
            }

            // 3. Final Repo Generation (Big Brain Analysis)
            await this.log(repoId, `📝 Generating semantic repository structure...`);

            // Consolidate context for Repo Generation
            const analyzedData: string[] = repo.assets.map(a =>
                `Asset: ${a.name}\nDescription: ${a.meta?.analysis?.description}\nTags: ${a.tags?.join(', ')}\nTranscript: ${a.meta?.transcription?.text}`
            );

            const fullTranscript = repo.assets
                .map(a => a.meta?.srt || "")
                .filter(t => t.length > 0)
                .join("\n\n");

            // Collect frames for global analysis (limit to 2 per asset to stay in context limits)
            const globalFrames = repo.assets.flatMap(a => (a.meta?.frames || []).slice(0, 2));

            try {
                const generatedData = await generateRepoStructure({
                    duration: "Auto-detected", // SW doesn't easy access to duration text here
                    transcript: fullTranscript || "No dialogue detected.",
                    sceneBoundaries: "auto-detected",
                    assetContext: analyzedData.join('\n\n'),
                    images: globalFrames
                });

                // Update job to ready state
                await db.updatePendingRepo(repoId, {
                    jobStatus: 'ready_to_commit',
                    generatedData
                });

                this.broadcast({
                    type: 'JOB_READY_TO_COMMIT',
                    repoId,
                    generatedData
                });

                await this.log(repoId, `✅ Pipeline analysis complete. Ready for review!`);

            } catch (genErr) {
                console.error("[SW] Repo Generation Failed", genErr);
                await this.log(repoId, `⚠️ AI Structure Generation failed, but assets are ready.`);

                await db.updatePendingRepo(repoId, {
                    jobStatus: 'ready_to_commit',
                    generatedData: { error: "Generation failed" }
                });

                this.broadcast({ type: 'JOB_READY_TO_COMMIT', repoId });
            }
        } catch (e) {
            console.error(`[SW] Error processing job ${repoId}`, e);
            // Optionally update job status to failed in DB and broadcast
            this.broadcast({ type: 'JOB_FAILED', repoId, error: String(e) });
            await this.log(repoId, `CRITICAL ERROR: ${String(e)}`);
        } finally {
            this.processingJobs.delete(repoId);
        }
    }

    private async log(repoId: string, message: string) {
        const repo = await db.getPendingRepo(repoId);
        if (repo) {
            const logs = repo.logs || [];
            const timestampedLog = `[${new Date().toLocaleTimeString()}] ${message}`;
            logs.push(timestampedLog);
            await db.updatePendingRepo(repoId, { logs });
            this.broadcast({ type: 'JOB_LOG', repoId, message, timestampedLog });
        } else {
            this.broadcast({ type: 'JOB_LOG', repoId, message });
        }
    }

    private broadcast(message: any) {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage(message));
        });
    }
}

const jobManager = new JobManager();

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'START_INGESTION') {
        const repoId = event.data.repoId;
        jobManager.processJob(repoId);
    }
});
