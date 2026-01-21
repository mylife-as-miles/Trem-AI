import React, { useState, useEffect, useRef } from 'react';
import { db, AssetData } from '../utils/db';

interface AssetLibraryProps {
    isModal?: boolean;
    onClose?: () => void;
    onSelect?: (assets: string[]) => void;
}

const MOCK_ASSETS: AssetData[] = [
    { id: 'shot_05', name: 'Shot_05_RedShoes', type: 'video', duration: '00:04:12', thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_FG3siz-07Zar46PuwVeXadGde8wD1oABlXQRLHcrBqv4ipUuXzt-wiksmm1efukjl7A2RCE8_Vhex7BOgslIXb7jfBughYHpY1QfEmy8hUeD8RQ4EVwH8Vbge-Bo70Y7g4hVqcr9ome6UUUR3MXoHt2NIOaJHIGFHUGyDSDIeqfls_rltYQPaguiZ3-NYvNzRK04K4S9JAVrcrG-XKghqKGIbcFA60Gy0_WWCyqXVALr2ysEmqLlav6sE9WiGB1qr9EgdYbXSZM', tags: ['Rain', 'City', 'Sad', 'Night'], meta: { object: 'red_shoes', motion: 'running' }, size: 0, created: Date.now(), status: 'ready' },
    { id: 'b_roll_mtn', name: 'B-Roll_Mountain_02', type: 'video', duration: '00:08:22', thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIXZ-cPuVPzVLTXOAKmVCTKh-dlGXWTU-kPdah6a1_m_2R1IjtTXBcy4YijkJNiGyZ4wQR2JtlIERvfHiRJlkm6lud55LGQo3EiTJrf4DSjAW7b8EBZNxu5hrQ8ERr1-kbf8un8OFI3nmqKOviwULI3BNakDO-BEMIAthJLy1cbTw61Vu0G54agsoZ1Dh-Y8-5AM_4QJvS3u0QDWAlWan2Dov77rSuYKKmHyFUOZDzyo6U2SRWI7hRSe5Oh2JGSKwFQaZu1S_Dk2Q', size: 0, created: Date.now(), status: 'ready' },
    { id: 'int_night', name: 'Int_Night_Street', type: 'video', duration: '00:01:45', thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlQnnEBjGcXNaP6m0G4g-7TjUpTDHjrlHe1fjGfkeeunOTCn2nq9C097nwAERUI2uIwIRJzSrGt3CPEdsLMiWyQ8EsmDnTGrNC6tl-XpX43c8o1sVw4TpeZNujy-8V6TA6xXd_LCf7kTToRliZk9vSha9D3chfYA64CRLYhJBV6CiBqXKB6I7x5ToiqO9cv8WoKE6xAjMLdkkWn7W1QPcyCsVbT5a3hWxaMYb8vywpuZbAH86YqoEOlm_CIo4wiTmBRegz7OoAxPo', size: 0, created: Date.now(), status: 'ready' },
    { id: 'gym_wide', name: 'Gym_Workout_Wide', type: 'video', duration: '00:12:01', thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqUmuUTjPu4whb7LtB63lXgMAhV5uj6JOkkluG0jt_zr0-FB9CuDEtpZQgZW2_w9N_bvxQlXwiMSUkCmFoVh1B3uB6Ua0Lv6WM8UF8mORQDRt-SNZF1HRRJq60hNiXVfZGiHm0bX9AfajNv-ELyaXRUgeBZPKiuSADarbaOnsDBMpHDF8cEVeY7VP3l5J4BRw_PfRN0fk3Oj7iQoovOIYHIWz09UQYY2cCIjbL98VXSfGr-5SD1f_Ry9aaznxre9TFvcdUKi_StLk', size: 0, created: Date.now(), status: 'ready' },
    { id: 'shoe_macro', name: 'Shoe_Detail_Macro', type: 'video', duration: '00:00:30', thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWSK-k3L5C9e9SzUwVK7rgY_Jbuo9Jm3wDl00Z2D9KjG1Uc2Ar4ngCZ9yIYUPElGE4YZF48kKYdMezmX6T2Ed59WIzvNFxINj-WFSi2Hw0ykXP5tz-5ko7ZQGis6Y_k4Dn9AuD8bE8ZNV4MGFNH_14j2217tHKVEx2jXLrnHdVXNio16Hl8n_h19tMRhXEtzbxWGyxkGIcLi5rcHrFkE-LH5pme6oOcdBaJtJAOB2525hIQOKu8_TAbHkyyzLjfHdLWeCsSAESgW8', size: 0, created: Date.now(), status: 'ready' },
    { id: 'urban_run', name: 'Urban_Running_Tracking', type: 'video', duration: '00:03:15', thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE14UFQg0BB_D4XMRQvtCdsNShp6gkDlXhl6cr3IMUFU3qhZeeDfJA661CbObw74Asjmd7tEVPVqwK8tDyCRVeYLmdr-DPEDOjp6uQoTzcybEL-xiGUiq4_mxnsM6oYxMc43AQ6bvqmGiBKZa4usJB6rJckmZYAdsSciUS5Kt9raO47ULqs1lhfyHA-EFRJZyz0eJBe8gZZSuRWWlTUjy6xHf1Ij7xsiZm1KNsLQP4ofiumXjwiT0V32yx08aBSsXqLC1ifEWrlG4', size: 0, created: Date.now(), status: 'ready' },
];

const AssetLibrary: React.FC<AssetLibraryProps> = ({ isModal, onClose, onSelect }) => {
    const [activeFilters, setActiveFilters] = useState<string[]>(['Vision_Pro_v4']);
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [assets, setAssets] = useState<AssetData[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load assets from DB
    const loadAssets = async () => {
        try {
            const dbAssets = await db.getAllAssets();
            const merged = [...dbAssets.reverse(), ...MOCK_ASSETS];
            setAssets(merged);
        } catch (e) {
            console.error("Failed to load assets", e);
            setAssets(MOCK_ASSETS);
        }
    };

    useEffect(() => {
        loadAssets();
        const interval = setInterval(loadAssets, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleFilter = (filter: string) => {
        if (activeFilters.includes(filter)) {
            setActiveFilters(activeFilters.filter(f => f !== filter));
        } else {
            setActiveFilters([...activeFilters, filter]);
        }
    };

    const toggleAssetSelection = (assetId: string) => {
        if (selectedAssets.includes(assetId)) {
            setSelectedAssets(selectedAssets.filter(id => id !== assetId));
        } else {
            setSelectedAssets([...selectedAssets, assetId]);
        }
    };

    const handleConfirmSelection = () => {
        if (onSelect) {
            onSelect(selectedAssets);
        }
    };

    // Helper to extract video metadata
    const processVideoFile = (file: File): Promise<{ duration: string, thumb: string }> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.playsInline = true;
            const url = URL.createObjectURL(file);
            video.src = url;

            // Timeout fallback
            const timeout = setTimeout(() => {
                resolve({ duration: '--:--', thumb: '' });
                URL.revokeObjectURL(url);
            }, 3000);

            video.onloadeddata = () => {
                if (video.duration > 1) {
                    video.currentTime = 1.0;
                } else {
                    video.currentTime = 0;
                }
            };

            video.onseeked = () => {
                clearTimeout(timeout);

                // Duration
                const seconds = Math.floor(video.duration);
                const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
                const ss = (seconds % 60).toString().padStart(2, '0');
                const durationStr = `${mm}:${ss}`;

                // Thumbnail
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = 180; // 16:9 aspect
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const thumbData = canvas.toDataURL('image/jpeg', 0.7);

                    resolve({ duration: durationStr, thumb: thumbData });
                } else {
                    resolve({ duration: durationStr, thumb: '' });
                }

                URL.revokeObjectURL(url);
            };

            video.onerror = () => {
                clearTimeout(timeout);
                console.warn("Could not process video file:", file.name);
                resolve({ duration: '--:--', thumb: '' });
                URL.revokeObjectURL(url);
            };
        });
    };

    // File Upload Handlers
    const handleFiles = async (files: FileList | null) => {
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isImage = file.type.startsWith('image');
            const isVideo = file.type.startsWith('video');

            let thumb = undefined;
            let duration = undefined;

            if (isImage) {
                thumb = URL.createObjectURL(file);
            } else if (isVideo) {
                const meta = await processVideoFile(file);
                thumb = meta.thumb;
                duration = meta.duration;
            }

            const asset: AssetData = {
                id: crypto.randomUUID(),
                name: file.name,
                type: isImage ? 'image' : isVideo ? 'video' : 'audio',
                blob: file,
                size: file.size,
                created: Date.now(),
                status: 'ready',
                thumb: thumb,
                duration: duration || (isVideo ? '00:00' : undefined),
                tags: ['Uploaded', 'Local']
            };

            await db.addAsset(asset);
        }
        loadAssets(); // Refresh view
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        await handleFiles(e.dataTransfer.files);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };


    return (
        <div
            className={`flex bg-background-dark text-white font-sans overflow-hidden selection:bg-primary selection:text-white ${isModal ? 'h-[80vh] w-full rounded-xl border border-white/10 shadow-2xl' : 'h-screen'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="video/*,image/*,audio/*"
                onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-sm border-4 border-primary border-dashed m-4 rounded-xl flex items-center justify-center pointer-events-none">
                    <div className="text-center animate-bounce">
                        <span className="material-icons-outlined text-6xl text-white drop-shadow-lg">cloud_upload</span>
                        <h2 className="text-2xl font-bold text-white mt-4 drop-shadow-md">Drop Files to Upload</h2>
                    </div>
                </div>
            )}

            {/* Sidebar - Hide if modal */}
            {!isModal && (
                <aside className="w-72 flex-shrink-0 flex flex-col border-r border-white/10 bg-black z-20">
                    <div className="h-20 flex items-center px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                                <span className="material-icons-outlined text-lg">auto_awesome_motion</span>
                            </div>
                            <span className="font-display font-bold text-2xl tracking-tight text-white">Trem</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Existing Filters - Kept for visual consistency */}
                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4 font-bold flex items-center gap-2">
                                <span className="material-icons-outlined text-sm">calendar_today</span> Date Uploaded
                            </h3>
                            <ul className="space-y-2 font-mono text-sm text-gray-400">
                                {['Last 24 Hours', 'Past Week', 'Past Month'].map((label) => (
                                    <li key={label}
                                        className={`flex items-center gap-3 cursor-pointer group transition-colors ${activeFilters.includes(label) ? 'text-white' : 'hover:text-primary'}`}
                                        onClick={() => toggleFilter(label)}
                                    >
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${activeFilters.includes(label) ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-primary'}`}>
                                            {activeFilters.includes(label) && <span className="material-icons-outlined text-[10px] text-white">check</span>}
                                        </div>
                                        <span>{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative bg-background-dark overflow-hidden">
                <header className={`h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30 ${isModal ? 'bg-black' : ''}`}>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight">{isModal ? 'Select Assets' : 'Asset Library'}</h1>
                        {!isModal && (
                            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-1">
                                <span className="hover:text-primary cursor-pointer transition-colors">client</span>
                                <span className="text-white/20">/</span>
                                <span className="hover:text-primary cursor-pointer transition-colors">nike-commercial</span>
                                <span className="text-white/20">/</span>
                                <span className="text-primary">media</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-6 flex-1 justify-end">
                        {!isModal && (
                            <div className="relative group max-w-xl w-full">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-emerald-900/50 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative flex items-center bg-black border border-white/10 rounded-lg overflow-hidden group-focus-within:border-primary/50 transition-colors">
                                    <span className="material-icons-outlined text-gray-500 pl-3">search</span>
                                    <input
                                        className="w-full bg-transparent border-none text-sm text-white placeholder-gray-600 focus:ring-0 py-2.5 px-3 font-mono focus:outline-none"
                                        placeholder="Show me all clips with red shoes and running."
                                        type="text"
                                    />
                                </div>
                            </div>
                        )}
                        {isModal ? (
                            <div className="flex items-center gap-3">
                                <div className="text-sm font-mono text-gray-400">
                                    {selectedAssets.length} selected
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmSelection}
                                    className="bg-primary hover:bg-primary_hover text-white px-5 py-2 rounded-lg text-sm font-medium font-display tracking-wide transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={selectedAssets.length === 0}
                                >
                                    Add Selected
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={triggerFileInput}
                                className="bg-primary hover:bg-primary_hover text-white px-5 py-2.5 rounded-lg text-sm font-medium font-display tracking-wide transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
                            >
                                <span className="material-icons-outlined text-lg">cloud_upload</span>
                                Upload Files
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">

                        {/* Upload Placeholder - First Item */}
                        <div
                            onClick={triggerFileInput}
                            className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-dashed border-white/10 hover:border-primary transition-all duration-300 flex flex-col items-center justify-center cursor-pointer"
                        >
                            <div className="text-gray-600 mb-2 group-hover:text-primary transition-colors">
                                <span className="material-icons-outlined text-4xl">add_circle_outline</span>
                            </div>
                            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors">Upload New</div>
                        </div>

                        {assets.map((asset) => (
                            <div
                                key={asset.id}
                                onClick={() => isModal && toggleAssetSelection(asset.id)}
                                className={`
                                    relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border transition-all duration-300
                                    ${isModal && selectedAssets.includes(asset.id)
                                        ? 'border-primary ring-2 ring-primary/50 shadow-lg scale-[1.02]'
                                        : 'border-white/10 hover:border-primary'
                                    }
                                    ${!isModal && 'hover:border-primary shadow-lg ring-0 hover:ring-2 ring-primary/20'}
                                    ${isModal ? 'cursor-pointer' : ''}
                                `}
                            >
                                {asset.thumb ? (
                                    <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-40 transition-opacity duration-300" style={{ backgroundImage: `url('${asset.thumb}')` }}></div>
                                ) : (
                                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center opacity-80 group-hover:opacity-40 transition-opacity">
                                        <span className="material-icons-outlined text-4xl text-gray-600">
                                            {asset.type === 'image' ? 'image' : 'movie'}
                                        </span>
                                    </div>
                                )}

                                {/* Selection Checkbox Overlay for Modal */}
                                {isModal && (
                                    <div className="absolute top-2 left-2 z-20">
                                        <div className={`w-6 h-6 rounded-full border border-white/30 flex items-center justify-center transition-colors ${selectedAssets.includes(asset.id) ? 'bg-primary border-primary' : 'bg-black/50'}`}>
                                            {selectedAssets.includes(asset.id) && <span className="material-icons-outlined text-sm text-white">check</span>}
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-3 left-3 z-10 transition-opacity duration-300 group-hover:opacity-0 w-full pr-6">
                                    <div className="text-xs font-mono text-white font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10 truncate">{asset.name}</div>
                                </div>
                                <div className="absolute top-3 right-3 z-10 transition-opacity duration-300 group-hover:opacity-0">
                                    <div className="text-[10px] font-mono text-gray-300 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">{asset.duration || asset.type}</div>
                                </div>

                                {/* Detail Overlay - Only show in non-modal or if not interfering with selection */}
                                {!isModal && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5 border border-primary/30">
                                        <div className="flex flex-wrap gap-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                            {asset.tags?.map(tag => (
                                                <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/20 border border-primary/50 text-emerald-200 text-[10px] font-mono tracking-wide">{tag}</span>
                                            ))}
                                        </div>
                                        {asset.meta && (
                                            <div className="font-mono text-xs text-primary bg-black/80 p-3 rounded border border-primary/20 transform scale-95 group-hover:scale-100 transition-transform duration-300 delay-100 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                                <span className="text-gray-500">{`{`}</span><br />
                                                &nbsp;&nbsp;<span className="text-emerald-300">"object"</span>: <span className="text-green-400">"{asset.meta.object}"</span>,<br />
                                                &nbsp;&nbsp;<span className="text-emerald-300">"motion"</span>: <span className="text-green-400">"{asset.meta.motion}"</span><br />
                                                <span className="text-gray-500">{`}`}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="material-icons-outlined text-white text-4xl">play_circle</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssetLibrary;
