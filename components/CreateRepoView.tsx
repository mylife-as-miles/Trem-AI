import React, { useState, useEffect } from 'react';
import AssetLibrary from './AssetLibrary';

interface CreateRepoViewProps {
    onNavigate: (view: 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings' | 'create-repo') => void;
    onCreateRepo?: (data: { name: string, brief: string, assets: any[] }) => void;
}

interface Asset {
    id: string;
    name: string;
    status: 'pending' | 'transcribing' | 'detecting' | 'indexed';
    progress: number;
}

const CreateRepoView: React.FC<CreateRepoViewProps> = ({ onNavigate, onCreateRepo }) => {
    const [step, setStep] = useState<'details' | 'ingest' | 'commit'>('details');
    // ... rest of state

    const handleCommit = () => {
        // Here we would actually save the repo data
        console.log("Committing Repo:", { repoName, repoBrief, assets: selectedAssets });

        if (onCreateRepo) {
            onCreateRepo({
                name: repoName,
                brief: repoBrief,
                assets: selectedAssets
            });
        } else {
            // Fallback if no handler
            onNavigate('repo');
        }
    };
    const [repoName, setRepoName] = useState('');
    const [repoBrief, setRepoBrief] = useState('');
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

    // Ingestion Simulation
    useEffect(() => {
        if (step === 'ingest' && selectedAssets.length > 0) {
            const interval = setInterval(() => {
                setSelectedAssets(prev => {
                    const allIndexed = prev.every(a => a.status === 'indexed');
                    if (allIndexed) {
                        clearInterval(interval);
                        return prev;
                    }

                    return prev.map(asset => {
                        if (asset.status === 'indexed') return asset;

                        let newProgress = asset.progress + Math.random() * 5;
                        if (newProgress >= 100) {
                            if (asset.status === 'pending') return { ...asset, status: 'transcribing', progress: 0 };
                            if (asset.status === 'transcribing') return { ...asset, status: 'detecting', progress: 0 };
                            if (asset.status === 'detecting') return { ...asset, status: 'indexed', progress: 100 };
                            return asset;
                        }
                        return { ...asset, progress: newProgress };
                    });
                });
            }, 500);
            return () => clearInterval(interval);
        }
    }, [step]);

    // Check if ready to commit
    const isIngestionComplete = selectedAssets.length > 0 && selectedAssets.every(a => a.status === 'indexed');

    const handleAssetsSelected = (assetIds: string[]) => {
        // Convert IDs to basic items for the list
        const newAssets: Asset[] = assetIds.map(id => ({
            id,
            name: `Imported_Clip_${id}`, // Mock name
            status: 'pending',
            progress: 0
        }));
        setSelectedAssets(newAssets);
        setIsAssetModalOpen(false);
        if (newAssets.length > 0) {
            setStep('ingest');
        }
    };



    return (
        <div className="flex flex-col h-full overflow-hidden bg-background-dark text-white p-8">
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full">

                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight">Create Semantic Repository</h1>
                        <p className="text-slate-400 mt-2">Initialize a new video workspace driven by AI context.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-primary' : 'bg-primary/30'}`}></div>
                        <div className="w-8 h-px bg-white/10"></div>
                        <div className={`w-3 h-3 rounded-full ${step === 'ingest' ? 'bg-primary' : 'bg-primary/30'}`}></div>
                        <div className="w-8 h-px bg-white/10"></div>
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
                                    className="w-full bg-black border border-white/20 rounded-lg p-4 text-xl font-display focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-mono text-primary font-bold uppercase tracking-wider">Creative Brief (Readme)</label>
                                <textarea
                                    value={repoBrief}
                                    onChange={(e) => setRepoBrief(e.target.value)}
                                    placeholder="Describe the goals, tone, and visual style..."
                                    className="w-full bg-black border border-white/20 rounded-lg p-4 font-mono text-sm h-32 focus:border-primary focus:outline-none transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Step 2: Assets & Ingestion */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold font-display">Source Assets</h2>
                            {step === 'details' && (
                                <button
                                    onClick={() => setIsAssetModalOpen(true)}
                                    disabled={!repoName}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                                        ${repoName
                                            ? 'bg-primary hover:bg-primary_hover text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
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
                                    ${repoName ? 'border-white/10 hover:border-primary/50 cursor-pointer bg-white/5' : 'border-white/5 bg-transparent'}
                                `}
                            >
                                <span className={`material-icons-outlined text-4xl ${repoName ? 'text-gray-400' : 'text-gray-700'}`}>folder_open</span>
                                <p className={`font-mono text-sm ${repoName ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {repoName ? 'Click to select footage, audio, or scripts' : 'Enter a repository name first'}
                                </p>
                            </div>
                        )}

                        {/* Ingestion List */}
                        {selectedAssets.length > 0 && (
                            <div className="space-y-3">
                                {selectedAssets.map(asset => (
                                    <div key={asset.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4">
                                        <div className="p-3 rounded bg-black/40 border border-white/10">
                                            <span className="material-icons-outlined text-gray-400">movie</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-sm font-bold truncate">{asset.name}</span>
                                                <span className={`text-xs font-mono uppercase tracking-wider ${asset.status === 'indexed' ? 'text-primary' : 'text-yellow-500'}`}>
                                                    {asset.status === 'indexed' ? 'Ready' : asset.status}
                                                </span>
                                            </div>
                                            {asset.status !== 'indexed' ? (
                                                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${asset.progress}%` }}></div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-500 font-mono">
                                                    meta/{asset.id}.json ✔
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Step 3: Commit */}
                    {isIngestionComplete && (
                        <section className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 animate-fade-in-up">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold font-display text-white">Ready to Commit</h3>
                                    <p className="text-primary/80 font-mono text-sm mt-1">Generated {selectedAssets.length} metadata files • Trem Locked</p>
                                </div>
                                <button
                                    onClick={handleCommit}
                                    className="bg-primary hover:bg-primary_hover text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all flex items-center gap-3 transform hover:-translate-y-1 active:scale-95"
                                >
                                    <span className="material-icons-outlined">check_circle</span>
                                    Initialize Repository
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer Controls (Cancel) */}
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                    <button onClick={() => onNavigate('dashboard')} className="text-gray-500 hover:text-white transition-colors font-mono text-sm">
                        Cancel & Discard
                    </button>
                    <div className="text-xs text-gray-600 font-mono">
                        Trem-AI v2.1.0 • Semantic Indexing Active
                    </div>
                </div>

            </div>

            {/* Asset Modal */}
            {isAssetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-black/80 backdrop-blur-sm">
                    <AssetLibrary
                        isModal={true}
                        onClose={() => setIsAssetModalOpen(false)}
                        onSelect={handleAssetsSelected}
                    />
                </div>
            )}
        </div>
    );
};

export default CreateRepoView;
