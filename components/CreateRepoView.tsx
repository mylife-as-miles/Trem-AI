import React, { useState, useEffect } from 'react';
import AssetLibrary from './AssetLibrary';
import TopNavigation from './TopNavigation';
import { db, RepoData } from '../utils/db';
import { generateRepoStructure } from '../services/geminiService';

interface CreateRepoViewProps {
    onNavigate: (view: 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings' | 'create-repo') => void;
    onCreateRepo?: (data: RepoData) => void;
}

interface Asset {
    id: string;
    name: string;
    status: 'pending' | 'transcribing' | 'detecting' | 'indexed';
    progress: number;
}

interface FileNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    children?: FileNode[];
    locked?: boolean;
    icon?: string;
    iconColor?: string;
    content?: string;
}

const CreateRepoView: React.FC<CreateRepoViewProps> = ({ onNavigate, onCreateRepo }) => {
    const [step, setStep] = useState<'details' | 'ingest' | 'commit'>('details');
    const [repoName, setRepoName] = useState('');
    const [repoBrief, setRepoBrief] = useState('');
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

    // Advanced Simulation State
    const [simLogs, setSimLogs] = useState<string[]>([]);
    const [workers, setWorkers] = useState<{ id: number, status: 'idle' | 'analyzing' | 'vectorizing' | 'optimizing', task: string }[]>([
        { id: 1, status: 'idle', task: 'Waiting...' },
        { id: 2, status: 'idle', task: 'Waiting...' },
        { id: 3, status: 'idle', task: 'Waiting...' },
        { id: 4, status: 'idle', task: 'Waiting...' }
    ]);

    // Ingestion Simulation
    useEffect(() => {
        if (step === 'ingest' && selectedAssets.length > 0) {
            setSimLogs(prev => [...prev, "> Initializing Trem-AI Compute Cluster...", "> Allocating 4 Worker Nodes..."]);

            const interval = setInterval(() => {
                setSelectedAssets(prev => {
                    const allIndexed = prev.every(a => a.status === 'indexed');
                    if (allIndexed) {
                        clearInterval(interval);
                        setWorkers(w => w.map(worker => ({ ...worker, status: 'idle', task: 'Complete' })));
                        setSimLogs(logs => [...logs, "> Indexing Complete. Semantic Baseline Locked."]);
                        return prev;
                    }

                    // Randomly update workers
                    setWorkers(prevWorkers => prevWorkers.map(w => {
                        if (Math.random() > 0.7) {
                            const statuses: ('analyzing' | 'vectorizing' | 'optimizing')[] = ['analyzing', 'vectorizing', 'optimizing'];
                            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                            return {
                                ...w,
                                status: randomStatus,
                                task: `${randomStatus === 'analyzing' ? 'Frame' : randomStatus === 'vectorizing' ? 'Vector' : 'Graph'} #${Math.floor(Math.random() * 9999)}`
                            };
                        }
                        return w;
                    }));

                    // Randomly add logs
                    if (Math.random() > 0.6) {
                        const messages = [
                            "Detecting scene change...",
                            "Extracting CLIP embedding...",
                            "Optimizing vector index...",
                            "Transcribing audio stream...",
                            "Generating metadata json..."
                        ];
                        const msg = messages[Math.floor(Math.random() * messages.length)];
                        setSimLogs(logs => {
                            const newLogs = [...logs, `> [Worker_${Math.floor(Math.random() * 4) + 1}] ${msg}`];
                            if (newLogs.length > 8) return newLogs.slice(newLogs.length - 8);
                            return newLogs;
                        });
                    }

                    return prev.map(asset => {
                        if (asset.status === 'indexed') return asset;

                        let newProgress = asset.progress + Math.random() * 2; // Slower progress for effect
                        if (newProgress >= 100) {
                            if (asset.status === 'pending') return { ...asset, status: 'transcribing', progress: 0 };
                            if (asset.status === 'transcribing') return { ...asset, status: 'detecting', progress: 0 };
                            if (asset.status === 'detecting') return { ...asset, status: 'indexed', progress: 100 };
                            return asset;
                        }
                        return { ...asset, progress: newProgress };
                    });
                });
            }, 200); // Faster tick rate for UI updates
            return () => clearInterval(interval);
        }
    }, [step]);

    // Check if ready to commit
    const isIngestionComplete = selectedAssets.length > 0 && selectedAssets.every(a => a.status === 'indexed');

    const handleAssetsSelected = async (assetIds: string[]) => {
        // Convert IDs to basic items for the list, fetching names from DB
        const newAssets = await Promise.all(assetIds.map(async id => {
            const dbAsset = await db.getAsset(id);
            return {
                id,
                name: dbAsset?.name || `Imported_Clip_${id}`,
                status: 'pending' as const,
                progress: 0
            };
        }));

        setSelectedAssets(newAssets);
        setIsAssetModalOpen(false);
        if (newAssets.length > 0) {
            setStep('ingest');
        }
    };

    const handleCommit = async () => {
        setSimLogs(prev => [...prev, "> Contacting Gemini 3 Flash for Semantic Structure..."]);

        // Call Gemini Service
        let generatedData;
        try {
            generatedData = await generateRepoStructure({
                duration: "2 minutes 14 seconds",
                transcript: "auto-generated",
                sceneBoundaries: "auto-detected"
            });
        } catch (e) {
            console.error("Gemini Generation Failed", e);
            setSimLogs(prev => [...prev, "> ERROR: Gemini Generation Failed. Check console."]);
            return;
        }

        const repoJson = {
            name: repoName,
            brief: repoBrief,
            created: Date.now(),
            version: "1.0.0",
            pipeline: "trem-video-pipeline-v1",
            ...generatedData.repo
        };

        // --- Generate File System Structure ---
        const newFS: FileNode[] = [
            { id: 'config', name: 'repo.json', type: 'file', icon: 'settings', iconColor: 'text-slate-400', content: JSON.stringify(repoJson, null, 2) },

            // media/
            {
                id: 'media', name: 'media', type: 'folder', locked: true, children: [
                    {
                        id: 'media_raw', name: 'raw', type: 'folder', children: selectedAssets.map(asset => ({
                            id: asset.id, name: asset.name || `${asset.id}.mp4`, type: 'file', icon: 'movie', iconColor: 'text-emerald-400'
                        }))
                    },
                    { id: 'media_proxies', name: 'proxies', type: 'folder', children: [] }
                ]
            },

            // otio/
            {
                id: 'otio', name: 'otio', type: 'folder', children: [
                    { id: 'otio_main', name: 'main.otio.json', type: 'file', icon: 'tune', iconColor: 'text-purple-400', content: JSON.stringify(generatedData.otio || {}, null, 2) }
                ]
            },

            // dag/
            {
                id: 'dag', name: 'dag', type: 'folder', children: [
                    { id: 'dag_graph', name: 'graph.json', type: 'file', icon: 'schema', iconColor: 'text-blue-400', content: JSON.stringify(generatedData.dag || {}, null, 2) }
                ]
            },

            // scenes/
            {
                id: 'scenes', name: 'scenes', type: 'folder', children: [
                    { id: 'scenes_json', name: 'scenes.json', type: 'file', icon: 'data_object', iconColor: 'text-amber-400', content: JSON.stringify(generatedData.scenes || {}, null, 2) }
                ]
            },

            // subtitles/
            {
                id: 'subtitles', name: 'subtitles', type: 'folder', children: [
                    { id: 'subtitles_main', name: 'main.srt', type: 'file', icon: 'subtitles', iconColor: 'text-slate-200', content: generatedData.subtitles_srt || '' }
                ]
            },

            // descriptions/
            {
                id: 'descriptions', name: 'descriptions', type: 'folder', children: [
                    { id: 'desc_video', name: 'video.md', type: 'file', icon: 'description', iconColor: 'text-blue-300', content: generatedData.descriptions?.video_md || '' },
                    { id: 'desc_scenes', name: 'scenes.md', type: 'file', icon: 'description', iconColor: 'text-blue-200', content: generatedData.descriptions?.scenes_md || '' }
                ]
            },

            // commits/
            {
                id: 'commits', name: 'commits', type: 'folder', children: [
                    { id: 'commit_0001', name: '0001.json', type: 'file', icon: 'commit', iconColor: 'text-orange-400', content: JSON.stringify(generatedData.commit || {}, null, 2) }
                ]
            },

            // builds/
            {
                id: 'builds', name: 'builds', type: 'folder', children: [
                    { id: 'build_draft', name: 'draft.mp4', type: 'file', icon: 'movie', iconColor: 'text-slate-500', locked: true }
                ]
            },

            // ai/
            {
                id: 'ai', name: 'ai', type: 'folder', children: [
                    { id: 'ai_prompts', name: 'prompts', type: 'folder', children: [] },
                    { id: 'ai_cache', name: 'cache', type: 'folder', children: [] }
                ]
            }
        ];

        try {
            console.log("Saving Repo to DB:", { repoName, repoBrief });
            const newRepoId = await db.addRepo({
                name: repoName,
                brief: repoBrief,
                created: Date.now(),
                assets: selectedAssets,
                fileSystem: newFS
            });

            if (onCreateRepo) {
                onCreateRepo({
                    id: newRepoId,
                    name: repoName,
                    brief: repoBrief,
                    assets: selectedAssets,
                    fileSystem: newFS,
                    created: Date.now()
                });
            } else {
                onNavigate('repo');
            }
        } catch (error) {
            console.error("Failed to save repo:", error);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300">
            <TopNavigation onNavigate={onNavigate} />
            <div className="flex-1 overflow-hidden p-8">
                <div className="max-w-5xl mx-auto w-full flex flex-col h-full">

                    {/* Header */}
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white">Create Semantic Repository</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Initialize a new video workspace driven by AI context.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-primary' : 'bg-primary/30'}`}></div>
                            <div className="w-8 h-px bg-slate-300 dark:bg-white/10"></div>
                            <div className={`w-3 h-3 rounded-full ${step === 'ingest' ? 'bg-primary' : 'bg-primary/30'}`}></div>
                            <div className="w-8 h-px bg-slate-300 dark:bg-white/10"></div>
                            <div className={`w-3 h-3 rounded-full ${step === 'commit' || isIngestionComplete ? 'bg-primary' : 'bg-primary/30'}`}></div>
                        </div>
                    </header>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto space-y-10">

                        {/* Step 1: Repo Details */}
                        <section className={`transition-opacity duration-300 ${step !== 'details' && 'opacity-50 pointer-events-none'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-sm font-mono text-primary font-bold uppercase tracking-wider">Repository Name</label>
                                    <input
                                        type="text"
                                        value={repoName}
                                        onChange={(e) => setRepoName(e.target.value)}
                                        placeholder="e.g., nike-commercial-q3"
                                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/20 rounded-lg p-4 text-xl font-display text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-600"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-mono text-primary font-bold uppercase tracking-wider">
                                        Creative Brief (Readme)
                                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-normal ml-2 lowercase normal-case opacity-70 border border-slate-300 dark:border-white/10 px-1 rounded">Markdown supported</span>
                                    </label>
                                    <textarea
                                        value={repoBrief}
                                        onChange={(e) => setRepoBrief(e.target.value)}
                                        placeholder="Describe the goals, tone, and visual style..."
                                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/20 rounded-lg p-4 font-mono text-sm h-32 text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors resize-none placeholder-slate-400 dark:placeholder-slate-600"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Step 2: Assets & Ingestion */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                                    {selectedAssets.length > 0 && step === 'ingest' ? 'Compute Cluster Status' : 'Source Assets'}
                                </h2>
                                {step === 'details' && (
                                    <button
                                        onClick={() => setIsAssetModalOpen(true)}
                                        disabled={!repoName}
                                        className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                                        ${repoName
                                                ? 'bg-primary hover:bg-primary_hover text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                                            }
                                    `}
                                    >
                                        <span className="material-icons-outlined">add_to_queue</span>
                                        Add Assets from Library
                                    </button>
                                )}
                            </div>

                            {/* Empty State */}
                            {selectedAssets.length === 0 && (
                                <div
                                    onClick={() => repoName && setIsAssetModalOpen(true)}
                                    className={`
                                    border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center gap-4 transition-colors
                                    ${repoName ? 'border-slate-300 dark:border-white/10 hover:border-primary/50 cursor-pointer bg-white dark:bg-white/5' : 'border-slate-200 dark:border-white/5 bg-transparent'}
                                `}
                                >
                                    <span className={`material-icons-outlined text-4xl ${repoName ? 'text-slate-400 dark:text-gray-400' : 'text-slate-300 dark:text-gray-700'}`}>folder_open</span>
                                    <p className={`font-mono text-sm ${repoName ? 'text-slate-500 dark:text-gray-400' : 'text-slate-400 dark:text-gray-700'}`}>
                                        {repoName ? 'Click to select footage, audio, or scripts' : 'Enter a repository name first'}
                                    </p>
                                </div>
                            )}

                            {/* Advanced Simulation UI */}
                            {selectedAssets.length > 0 && step === 'ingest' && (
                                <div className="space-y-6">
                                    {/* Worker Nodes Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {workers.map(worker => (
                                            <div key={worker.id} className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-3 relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-icons-outlined text-slate-400 text-sm">dns</span>
                                                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">NODE_0{worker.id}</span>
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full ${worker.status === 'idle' ? 'bg-slate-400' : 'bg-green-400 animate-pulse'}`}></div>
                                                </div>
                                                <div className="font-mono text-xs text-slate-500 dark:text-gray-500 mb-1">STATUS</div>
                                                <div className={`text-sm font-bold uppercase ${worker.status === 'idle' ? 'text-slate-400' : 'text-primary'}`}>
                                                    {worker.status}
                                                </div>
                                                <div className="mt-2 text-[10px] font-mono text-slate-400 dark:text-gray-600 truncate">
                                                    {worker.task}
                                                </div>
                                                {/* Activity Graph Overlay Mock */}
                                                {worker.status !== 'idle' && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 pointer-events-none">
                                                        <div className="flex items-end justify-between h-full px-1">
                                                            {[...Array(10)].map((_, i) => (
                                                                <div key={i} className="w-1 bg-primary transition-all duration-300" style={{ height: `${Math.random() * 100}%` }}></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Console & Process List Split */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Terminal Log */}
                                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto custom-scrollbar flex flex-col-reverse shadow-inner">
                                            <div className="flex items-center gap-2 text-green-500 mb-2 border-b border-green-500/20 pb-2 sticky top-0 bg-slate-900/90 backdrop-blur z-10 w-full">
                                                <span className="material-icons-outlined text-sm">terminal</span>
                                                <span className="font-bold">CLUSTER_LOGS</span>
                                            </div>
                                            <div className="space-y-1">
                                                {simLogs.map((log, i) => (
                                                    <div key={i} className="text-slate-300 break-words font-mono opacity-90">
                                                        {log}
                                                    </div>
                                                ))}
                                                <div className="animate-pulse text-green-500">_</div>
                                            </div>
                                        </div>

                                        {/* Asset Progress List */}
                                        <div className="h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                            {selectedAssets.map(asset => (
                                                <div key={asset.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 flex items-center gap-3">
                                                    <div className="p-2 rounded bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
                                                        <span className="material-icons-outlined text-slate-500 dark:text-gray-400 text-sm">movie</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-mono text-xs font-bold truncate text-slate-900 dark:text-white max-w-[120px]">{asset.name}</span>
                                                            <span className={`text-[10px] font-mono uppercase tracking-wider ${asset.status === 'indexed' ? 'text-primary' : 'text-amber-500 dark:text-yellow-500'}`}>
                                                                {asset.status === 'indexed' ? 'Ready' : asset.status}
                                                            </span>
                                                        </div>
                                                        <div className="h-1 bg-slate-200 dark:bg-black rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${asset.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Basic List (for before ingestion starts) */}
                            {selectedAssets.length > 0 && step === 'details' && (
                                <div className="space-y-3">
                                    {selectedAssets.map(asset => (
                                        <div key={asset.id} className="opacity-60 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-4 flex items-center gap-4">
                                            <div className="p-3 rounded bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
                                                <span className="material-icons-outlined text-slate-500 dark:text-gray-400">movie</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-mono text-sm font-bold truncate text-slate-900 dark:text-white">{asset.name}</span>
                                                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Pending Ingest</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-200 dark:bg-black rounded-full overflow-hidden">
                                                    <div className="h-full bg-slate-300 dark:bg-white/10 w-0"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Step 3: Commit */}
                        {isIngestionComplete && (
                            <section className="animate-fade-in-up space-y-6">
                                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Commit Assets</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-gray-400">Staged Changes</span>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-6">

                                        {/* Commit Message Input */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono uppercase text-slate-500 dark:text-gray-400 font-bold">Commit Message</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    defaultValue="Add raw footage and AI index"
                                                    className="flex-1 bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 font-mono text-sm text-slate-700 dark:text-gray-300 focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Staged Stats Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                                                <div className="text-xs text-slate-500 dark:text-gray-500 font-mono mb-1">New Media Assets</div>
                                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{selectedAssets.length} <span className="text-sm font-normal text-slate-400">files</span></div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                                                <div className="text-xs text-slate-500 dark:text-gray-500 font-mono mb-1">Total Duration</div>
                                                <div className="text-2xl font-bold text-slate-800 dark:text-white">14:22 <span className="text-sm font-normal text-slate-400">mm:ss</span></div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                                                <div className="text-xs text-slate-500 dark:text-gray-500 font-mono mb-1">Detected Scenes</div>
                                                <div className="text-2xl font-bold text-slate-800 dark:text-white">42 <span className="text-sm font-normal text-slate-400">cuts</span></div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                                                <div className="text-xs text-slate-500 dark:text-gray-500 font-mono mb-1">Dialogue Lines</div>
                                                <div className="text-2xl font-bold text-slate-800 dark:text-white">128 <span className="text-sm font-normal text-slate-400">lines</span></div>
                                            </div>
                                        </div>

                                        {/* Hashes & Metadata */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                                                <label className="text-xs font-mono uppercase text-slate-500 dark:text-gray-400 font-bold">Generated Hashes & Metadata</label>
                                                <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">TREM-HASH-V2</span>
                                            </div>
                                            <div className="font-mono text-xs text-slate-600 dark:text-gray-400 space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                {selectedAssets.map((asset, i) => (
                                                    <div key={asset.id} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/5 p-1 rounded transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity justify-self-start">+</span>
                                                            <span className="w-48 truncate">{asset.name}</span>
                                                            <span className="text-slate-400 dark:text-gray-600">→</span>
                                                            <span className="text-slate-500 dark:text-gray-500">meta/{asset.id}.json</span>
                                                        </div>
                                                        <span className="text-slate-400 dark:text-gray-600 text-[10px]">
                                                            {`8f${i}a${asset.id.substring(0, 4)}...`}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/5 p-1 rounded transition-colors border-t border-dashed border-slate-200 dark:border-white/10 mt-2 pt-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-emerald-500 dark:text-emerald-400">+</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-300">trem.lock</span>
                                                    </div>
                                                    <span className="text-slate-400 dark:text-gray-600 text-[10px]">
                                                        locking semantic baseline
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/10 flex justify-end">
                                        <button
                                            onClick={handleCommit}
                                            className="bg-primary hover:bg-primary_hover text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2 transform active:scale-95"
                                        >
                                            <span className="material-icons-outlined">check</span>
                                            Commit & Initialize Repo
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Footer Controls (Cancel) */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-between">
                        <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white transition-colors font-mono text-sm">
                            Cancel & Discard
                        </button>
                        <div className="text-xs text-slate-400 dark:text-gray-600 font-mono">
                            Trem-AI v2.1.0 • Semantic Indexing Active
                        </div>
                    </div>

                </div>

                {/* Asset Modal */}
                {isAssetModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                        <AssetLibrary
                            isModal={true}
                            onClose={() => setIsAssetModalOpen(false)}
                            onSelect={handleAssetsSelected}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateRepoView;
