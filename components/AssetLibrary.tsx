import React, { useState } from 'react';

const AssetLibrary: React.FC = () => {
    // Determine number of active filters for some visual feedback if needed
    const [activeFilters, setActiveFilters] = useState<string[]>(['Vision_Pro_v4']);

    const toggleFilter = (filter: string) => {
        if (activeFilters.includes(filter)) {
            setActiveFilters(activeFilters.filter(f => f !== filter));
        } else {
            setActiveFilters([...activeFilters, filter]);
        }
    };

    return (
        <div className="flex bg-background-dark text-white font-sans h-screen overflow-hidden selection:bg-primary selection:text-white">
            {/* Sidebar */}
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
                    <div>
                        <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4 font-bold flex items-center gap-2">
                            <span className="material-icons-outlined text-sm">smart_toy</span> Agent Tagged
                        </h3>
                        <ul className="space-y-2 font-mono text-sm text-gray-400">
                            {['Vision_Pro_v4', 'Audio_Whisper_en', 'Motion_Tracker_X'].map((label) => (
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
                    <div>
                        <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4 font-bold flex items-center gap-2">
                            <span className="material-icons-outlined text-sm">memory</span> Worker Pool
                        </h3>
                        <ul className="space-y-2 font-mono text-sm text-gray-400">
                            {['cpu_ingest_01', 'gpu_render_farm'].map((label) => (
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative bg-background-dark overflow-hidden">
                <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight">Asset Library</h1>
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-1">
                            <span className="hover:text-primary cursor-pointer transition-colors">client</span>
                            <span className="text-white/20">/</span>
                            <span className="hover:text-primary cursor-pointer transition-colors">nike-commercial</span>
                            <span className="text-white/20">/</span>
                            <span className="text-primary">media</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 flex-1 justify-end">
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
                        <button className="bg-primary hover:bg-primary_hover text-white px-5 py-2.5 rounded-lg text-sm font-medium font-display tracking-wide transition-all flex items-center gap-2 whitespace-nowrap active:scale-95">
                            <span className="material-icons-outlined text-lg">sync</span>
                            Sync Raw Footage
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {/* Clip 1 - Detail with overlay */}
                        <div className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-white/10 hover:border-primary shadow-lg transition-all duration-300 ring-0 hover:ring-2 ring-primary/20">
                            <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-40 transition-opacity duration-300" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_FG3siz-07Zar46PuwVeXadGde8wD1oABlXQRLHcrBqv4ipUuXzt-wiksmm1efukjl7A2RCE8_Vhex7BOgslIXb7jfBughYHpY1QfEmy8hUeD8RQ4EVwH8Vbge-Bo70Y7g4hVqcr9ome6UUUR3MXoHt2NIOaJHIGFHUGyDSDIeqfls_rltYQPaguiZ3-NYvNzRK04K4S9JAVrcrG-XKghqKGIbcFA60Gy0_WWCyqXVALr2ysEmqLlav6sE9WiGB1qr9EgdYbXSZM')" }}></div>
                            <div className="absolute bottom-3 left-3 z-10 transition-opacity duration-300 group-hover:opacity-0">
                                <div className="text-xs font-mono text-white font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">Shot_05_RedShoes</div>
                            </div>
                            <div className="absolute top-3 right-3 z-10 transition-opacity duration-300 group-hover:opacity-0">
                                <div className="text-[10px] font-mono text-gray-300 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">00:04:12</div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5 border border-primary/30">
                                <div className="flex flex-wrap gap-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    {['Rain', 'City', 'Sad', 'Night'].map(tag => (
                                        <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/20 border border-primary/50 text-emerald-200 text-[10px] font-mono tracking-wide">{tag}</span>
                                    ))}
                                </div>
                                <div className="font-mono text-xs text-primary bg-black/80 p-3 rounded border border-primary/20 transform scale-95 group-hover:scale-100 transition-transform duration-300 delay-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                    <span className="text-gray-500">{`{`}</span><br />
                                    &nbsp;&nbsp;<span className="text-emerald-300">"object"</span>: <span className="text-green-400">"red_shoes"</span>,<br />
                                    &nbsp;&nbsp;<span className="text-emerald-300">"motion"</span>: <span className="text-green-400">"running"</span><br />
                                    <span className="text-gray-500">{`}`}</span>
                                </div>
                                <div className="font-mono text-sm text-white bg-black/60 p-2 rounded border-l-2 border-primary transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-150 relative">
                                    <div className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-primary"></div>
                                    <span className="text-primary text-[10px] block mb-1 font-bold">TRANSCRIPT_SNIPPET</span>
                                    "I can't believe it..."
                                </div>
                            </div>
                        </div>

                        {/* Clip 2 */}
                        <div className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBIXZ-cPuVPzVLTXOAKmVCTKh-dlGXWTU-kPdah6a1_m_2R1IjtTXBcy4YijkJNiGyZ4wQR2JtlIERvfHiRJlkm6lud55LGQo3EiTJrf4DSjAW7b8EBZNxu5hrQ8ERr1-kbf8un8OFI3nmqKOviwULI3BNakDO-BEMIAthJLy1cbTw61Vu0G54agsoZ1Dh-Y8-5AM_4QJvS3u0QDWAlWan2Dov77rSuYKKmHyFUOZDzyo6U2SRWI7hRSe5Oh2JGSKwFQaZu1S_Dk2Q')" }}></div>
                            <div className="absolute bottom-3 left-3 z-10">
                                <div className="text-xs font-mono text-gray-300 font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">B-Roll_Mountain_02</div>
                            </div>
                            <div className="absolute top-3 right-3 z-10">
                                <div className="text-[10px] font-mono text-gray-400 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">00:08:22</div>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-icons-outlined text-white text-4xl">play_circle</span>
                            </div>
                        </div>

                        {/* Clip 3 */}
                        <div className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlQnnEBjGcXNaP6m0G4g-7TjUpTDHjrlHe1fjGfkeeunOTCn2nq9C097nwAERUI2uIwIRJzSrGt3CPEdsLMiWyQ8EsmDnTGrNC6tl-XpX43c8o1sVw4TpeZNujy-8V6TA6xXd_LCf7kTToRliZk9vSha9D3chfYA64CRLYhJBV6CiBqXKB6I7x5ToiqO9cv8WoKE6xAjMLdkkWn7W1QPcyCsVbT5a3hWxaMYb8vywpuZbAH86YqoEOlm_CIo4wiTmBRegz7OoAxPo')" }}></div>
                            <div className="absolute bottom-3 left-3 z-10">
                                <div className="text-xs font-mono text-gray-300 font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">Int_Night_Street</div>
                            </div>
                            <div className="absolute top-3 right-3 z-10">
                                <div className="text-[10px] font-mono text-gray-400 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">00:01:45</div>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-icons-outlined text-white text-4xl">play_circle</span>
                            </div>
                        </div>

                        {/* Error Clip */}
                        <div className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-800 bg-black">
                                <span className="material-icons-outlined text-4xl">videocam_off</span>
                            </div>
                            <div className="absolute bottom-3 left-3 z-10">
                                <div className="text-xs font-mono text-red-400 font-medium bg-red-900/20 px-2 py-1 rounded backdrop-blur-sm border border-red-500/30">Corrupt_File_X9</div>
                            </div>
                        </div>

                        {/* Clip 4 */}
                        <div className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqUmuUTjPu4whb7LtB63lXgMAhV5uj6JOkkluG0jt_zr0-FB9CuDEtpZQgZW2_w9N_bvxQlXwiMSUkCmFoVh1B3uB6Ua0Lv6WM8UF8mORQDRt-SNZF1HRRJq60hNiXVfZGiHm0bX9AfajNv-ELyaXRUgeBZPKiuSADarbaOnsDBMpHDF8cEVeY7VP3l5J4BRw_PfRN0fk3Oj7iQoovOIYHIWz09UQYY2cCIjbL98VXSfGr-5SD1f_Ry9aaznxre9TFvcdUKi_StLk')" }}></div>
                            <div className="absolute bottom-3 left-3 z-10">
                                <div className="text-xs font-mono text-gray-300 font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">Gym_Workout_Wide</div>
                            </div>
                            <div className="absolute top-3 right-3 z-10">
                                <div className="text-[10px] font-mono text-gray-400 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">00:12:01</div>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-icons-outlined text-white text-4xl">play_circle</span>
                            </div>
                        </div>

                        {/* Clip 5 */}
                        <div className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCWSK-k3L5C9e9SzUwVK7rgY_Jbuo9Jm3wDl00Z2D9KjG1Uc2Ar4ngCZ9yIYUPElGE4YZF48kKYdMezmX6T2Ed59WIzvNFxINj-WFSi2Hw0ykXP5tz-5ko7ZQGis6Y_k4Dn9AuD8bE8ZNV4MGFNH_14j2217tHKVEx2jXLrnHdVXNio16Hl8n_h19tMRhXEtzbxWGyxkGIcLi5rcHrFkE-LH5pme6oOcdBaJtJAOB2525hIQOKu8_TAbHkyyzLjfHdLWeCsSAESgW8')" }}></div>
                            <div className="absolute bottom-3 left-3 z-10">
                                <div className="text-xs font-mono text-gray-300 font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">Shoe_Detail_Macro</div>
                            </div>
                            <div className="absolute top-3 right-3 z-10">
                                <div className="text-[10px] font-mono text-gray-400 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">00:00:30</div>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-icons-outlined text-white text-4xl">play_circle</span>
                            </div>
                        </div>

                        {/* Clip 6 */}
                        <div className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAE14UFQg0BB_D4XMRQvtCdsNShp6gkDlXhl6cr3IMUFU3qhZeeDfJA661CbObw74Asjmd7tEVPVqwK8tDyCRVeYLmdr-DPEDOjp6uQoTzcybEL-xiGUiq4_mxnsM6oYxMc43AQ6bvqmGiBKZa4usJB6rJckmZYAdsSciUS5Kt9raO47ULqs1lhfyHA-EFRJZyz0eJBe8gZZSuRWWlTUjy6xHf1Ij7xsiZm1KNsLQP4ofiumXjwiT0V32yx08aBSsXqLC1ifEWrlG4')" }}></div>
                            <div className="absolute bottom-3 left-3 z-10">
                                <div className="text-xs font-mono text-gray-300 font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">Urban_Running_Tracking</div>
                            </div>
                            <div className="absolute top-3 right-3 z-10">
                                <div className="text-[10px] font-mono text-gray-400 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">00:03:15</div>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-icons-outlined text-white text-4xl">play_circle</span>
                            </div>
                        </div>

                        {/* Upload Placeholder */}
                        <div className="relative group aspect-[16/9] bg-black rounded-lg overflow-hidden border border-dashed border-white/10 hover:border-primary transition-all duration-300 flex flex-col items-center justify-center cursor-pointer">
                            <div className="text-gray-600 mb-2 group-hover:text-primary transition-colors">
                                <span className="material-icons-outlined text-4xl">add_circle_outline</span>
                            </div>
                            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors">Upload New</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssetLibrary;
