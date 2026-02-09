/// <reference lib="webworker" />
import { db, IngestionJob, PendingRepoData } from './utils/db';
import { transcribeAudio, transcribeAudioWithWhisperX, generateSRT } from './services/whisperService';
import { analyzeAsset } from './services/gemini/repo/index';

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
            if (!repo || repo.jobStatus === 'completed') {
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

                    // 1. Transcribe (Dual Mode: Whisper + WhisperX)
                    // Prefer optimized audio if available (created by main thread)
                    // @ts-ignore
                    const audioBlob = (asset.meta?.optimizedAudio as Blob) || asset.blob;

                    if (audioBlob && (asset.type === 'video' || asset.type === 'audio')) {
                        console.log(`[SW] Transcribing ${asset.name} (Standard Whisper)...`);
                        // @ts-ignore
                        const standard = await transcribeAudio(audioBlob);

                        console.log(`[SW] Transcribing ${asset.name} (WhisperX)...`);
                        // @ts-ignore
                        const whisperx = await transcribeAudioWithWhisperX(audioBlob);

                        asset.meta = {
                            ...asset.meta,
                            transcription: standard,
                            whisperx: whisperx,
                            srt: standard.srt
                        };
                    }

                    // 2. Analyze Content (Gemini)
                    if (asset.blob) {
                        console.log(`[SW] Analyzing ${asset.name}...`);
                        // @ts-ignore - TS might complain about types if not perfectly aligned but logic holds
                        const analysis = await analyzeAsset({
                            id: asset.id,
                            name: asset.name,
                            blob: asset.blob
                        });

                        asset.meta = { ...asset.meta, analysis };
                        asset.tags = analysis.tags;
                        // Description could go into meta or a separate field if AssetData had one
                    }

                    asset.status = 'ready';
                    asset.progress = 100;
                    repo.assets[i] = asset;

                    // Incremental save
                    await db.updatePendingRepo(repoId, { assets: repo.assets });
                    this.broadcast({ type: 'ASSET_UPDATE', repoId, asset });

                } catch (e) {
                    console.error(`[SW] Asset failed`, e);
                    asset.status = 'error';
                    asset.meta = { ...asset.meta, error: String(e) };
                    repo.assets[i] = asset;
                    await db.updatePendingRepo(repoId, { assets: repo.assets });
                    this.broadcast({ type: 'ASSET_UPDATE', repoId, asset });
                }
            }

            // 3. Complete Job & Promote to Real Repo
            console.log(`[SW] Job ${repoId} completed. Promoting to Repo...`);

            // Construct final repo
            // Note: In a real app, we might run the AI structure generation here or trigger it later.
            // For now, we create a basic functional repo with the ingested assets.
            const finalRepo = {
                name: repo.name,
                brief: repo.brief,
                assets: repo.assets,
                created: repo.createdAt,
                fileSystem: [
                    {
                        id: 'root', name: 'root', type: 'folder', children: [
                            {
                                id: 'assets', name: 'Assets', type: 'folder', children: repo.assets.map(a => ({
                                    id: a.id,
                                    name: a.name,
                                    type: 'file',
                                    icon: a.type === 'video' ? 'movie' : 'description'
                                }))
                            },
                            {
                                id: 'docs', name: 'Documents', type: 'folder', children: [
                                    { id: 'readme', name: 'README.md', type: 'file', content: `# ${repo.name}\n\n${repo.brief}` }
                                ]
                            }
                        ]
                    }
                ]
            };

            // Add to 'repos' store
            await db.addRepo(finalRepo);

            // Remove from pending
            await db.deletePendingRepo(repoId);

            this.broadcast({ type: 'JOB_COMPLETED', repoId });
        } catch (e) {
            console.error(`[SW] Error processing job ${repoId}`, e);
            // Optionally update job status to failed in DB and broadcast
            this.broadcast({ type: 'JOB_FAILED', repoId, error: String(e) });
        } finally {
            this.processingJobs.delete(repoId);
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
