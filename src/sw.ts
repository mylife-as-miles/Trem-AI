/// <reference lib="webworker" />
import { db, IngestionJob, PendingRepoData } from './utils/db';
// Note: whisperService uses DOM APIs (FileReader, relative fetch) not available in SW.
// For full transcription in SW, those functions would need a SW-compatible refactor.

// Type declaration for workbox manifest
declare const self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Workbox manifest placeholder - required by vite-plugin-pwa injectManifest
// This will be replaced with the precache manifest at build time
const manifest = self.__WB_MANIFEST;

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

    async addJob(job: IngestionJob) {
        // Persist to DB? 
        // Actually, the main thread likely persists the 'PendingRepoData'
        // effectively queueing it. 
        // But the SW needs to know what to work on.
        // Let's assume we receive a 'START_JOB' message with the ID.
        await this.processJob(job.repoId);
    }

    async processJob(repoId: string) {
        // 1. Get Repo Data
        const repo = await db.getPendingRepo(repoId);
        if (!repo || repo.jobStatus === 'completed') return;

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
                // Simulate processing (e.g. upload/transcribe)
                // In reality, we'd replicate the logic from whisperService here
                // Note: We can't easily import 'whisperService' if it uses DOM/React stuff.
                // We'll need to move pure logic to a shared helper or duplicate it.
                // For this demo, let's simulate a delay.
                await new Promise(resolve => setTimeout(resolve, 2000));

                asset.status = 'ready';
                asset.progress = 100;
                repo.assets[i] = asset;
                await db.updatePendingRepo(repoId, { assets: repo.assets });
                this.broadcast({ type: 'ASSET_UPDATE', repoId, asset });

            } catch (e) {
                console.error(`[SW] Asset failed`, e);
                asset.status = 'error';
                repo.assets[i] = asset;
                await db.updatePendingRepo(repoId, { assets: repo.assets });
                this.broadcast({ type: 'ASSET_UPDATE', repoId, asset });
            }
        }

        // 3. Complete Job
        console.log(`[SW] Job ${repoId} completed`);
        await db.updatePendingRepo(repoId, { jobStatus: 'completed' });
        this.broadcast({ type: 'JOB_COMPLETED', repoId });
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
