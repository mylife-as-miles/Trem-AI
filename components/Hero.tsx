import React from 'react';
import { ArrowUpRight, Menu } from 'lucide-react';
import ThreeScene from './ThreeScene';

const Logo = () => (
    <div className="flex items-center gap-2 font-semibold text-primary z-50 pointer-events-auto select-none group cursor-pointer">
        <div className="w-5 h-5 md:w-6 md:h-6 bg-primary rounded-[4px] flex items-center justify-center group-hover:rotate-180 transition-transform duration-500 ease-out">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full"></div>
        </div>
        <span className="tracking-tight text-base md:text-lg">trem-ai</span>
    </div>
);

const DecorativeBackground = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20 text-primary" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <line x1="75%" y1="0" x2="75%" y2="100%" stroke="currentColor" strokeWidth="2" />
        <path
            d="M 850 -50 A 500 500 0 0 1 1350 450"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
        />
        <circle cx="75%" cy="45%" r="280" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="45%" cy="85%" r="100" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
);

const TryForFreeBrackets = () => (
    <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 160 60" preserveAspectRatio="none">
            <path d="M 40 10 C 20 10 20 50 40 50" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d="M 120 10 C 140 10 140 50 120 50" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
    </div>
)

// New "HUD" Style Spec Label for Deconstructed View with improved readability
const SpecLabel = ({ label, value, sub, align = 'left', index = 0 }: { label: string, value: string, sub: string, align?: 'left' | 'right', index?: number }) => (
    <div className={`flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start text-left'} group relative z-10`} style={{ transitionDelay: `${index * 100}ms` }}>
        {/* Glassmorphism Backing */}
        <div className={`absolute -inset-4 bg-white/40 backdrop-blur-md rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/40 shadow-sm transition-all`}></div>

        {/* Always visible soft backing for better contrast */}
        <div className={`absolute -inset-4 bg-card/30 backdrop-blur-[2px] rounded-2xl -z-20 border border-white/20`}></div>

        <div className={`flex items-center gap-2 mb-2 ${align === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="h-[1px] w-8 bg-primary/30 group-hover:w-16 transition-all duration-500"></div>
            <span className="text-[10px] font-mono tracking-widest text-secondary uppercase">{label}</span>
        </div>
        <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic text-primary mb-1">{value}</h4>
        <p className="text-[10px] sm:text-xs font-medium text-primary/60 max-w-[150px]">{sub}</p>
    </div>
);

const Hero: React.FC = () => {
    return (
        <div className="relative w-full min-h-screen bg-card overflow-x-hidden font-sans text-primary selection:bg-white selection:text-black">

            {/* --- GLOBAL FIXED BACKGROUNDS --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <DecorativeBackground />
            </div>

            <div className="fixed inset-0 z-0">
                <ThreeScene />
            </div>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className="relative z-10 w-full max-w-[1920px] mx-auto flex flex-col">

                {/* --- SECTION 1: HERO --- */}
                <div id="hero-section" className="relative flex flex-col min-h-[100dvh] w-full pointer-events-none px-4 sm:px-8 md:px-12 lg:px-24 pb-10">
                    <nav className="flex justify-between items-center py-6 md:py-10 pointer-events-auto">
                        <div className="flex items-center gap-4 md:gap-12">
                            <button className="group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-primary/10 hover:bg-primary hover:text-card transition-all duration-300">
                                <Menu className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                            </button>
                            <Logo />
                        </div>
                        <div className="flex gap-4 md:gap-12 text-[10px] sm:text-xs font-mono font-medium text-secondary/60 tracking-widest uppercase hidden md:flex">
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> System Online</span>
                            <span>v2.4.0-beta</span>
                        </div>
                        <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary text-card">
                            <ArrowUpRight className="w-5 h-5" />
                        </button>
                    </nav>

                    <main className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto pointer-events-auto mt-12 md:mt-0 relative">

                        {/* Floating Tag */}
                        <div className="absolute top-0 right-0 hidden lg:flex flex-col items-end gap-2 text-right opacity-60">
                            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Render Pipeline</span>
                            <span className="font-serif italic text-2xl text-primary">Active</span>
                        </div>

                        <div className="mb-6 md:mb-10 flex flex-wrap items-center gap-3 text-primary font-medium text-xs md:text-sm tracking-wide uppercase">
                            <span className="px-3 py-1 rounded-full border border-primary/10 bg-white/5 backdrop-blur-sm">Non-Linear</span>
                            <span className="px-3 py-1 rounded-full border border-primary/10 bg-white/5 backdrop-blur-sm">Non-Blocking</span>
                            <span className="px-3 py-1 rounded-full border border-primary/10 bg-white/5 backdrop-blur-sm">Cloud Native</span>
                        </div>

                        <h1 className="text-[13vw] sm:text-[10vw] lg:text-[7.5rem] leading-[0.9] sm:leading-[0.85] font-medium text-primary tracking-[-0.04em] mb-8 md:mb-12 break-words -ml-[0.05em]">
                            Edit video <br />
                            <div className="flex flex-wrap items-baseline gap-2 md:gap-6">
                                <span className="text-[5vw] sm:text-[4vw] lg:text-4xl font-mono font-normal text-secondary tracking-normal align-middle max-w-[200px] leading-tight hidden md:inline-block">
                                    / at the speed <br /> of thought
                                </span>
                                <span className="relative font-serif italic font-semibold text-[13vw] sm:text-[10vw] lg:text-[8.5rem]">thought<span className="text-accentBlue">.</span></span>
                            </div>
                        </h1>

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-0 w-full">
                            <p className="text-secondary text-sm sm:text-base md:text-xl leading-relaxed max-w-md font-light border-l border-primary/20 pl-4 md:pl-6">
                                The first asynchronous video engine. Render, clip, and effect in parallel without freezing your flow.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                                <button className="group relative flex items-center justify-between bg-primary text-card rounded-full pl-8 pr-2 py-2 h-16 sm:h-20 w-full sm:w-auto min-w-[240px] hover:bg-white transition-all duration-500 cursor-pointer shadow-xl hover:shadow-2xl active:scale-95 overflow-hidden">
                                    <span className="relative z-10 text-base sm:text-lg font-medium tracking-wide">Start Editing</span>
                                    <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 bg-card rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                    </div>
                                    {/* Hover Effect bg */}
                                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                </button>

                                <div className="hidden sm:flex flex-col items-center justify-center px-4">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-secondary/70 mb-1">Architecture</span>
                                    <span className="text-xs font-bold border-b border-primary text-primary">V2.4 VIEW</span>
                                </div>
                            </div>
                        </div>
                    </main>

                    <div className="absolute bottom-6 md:bottom-10 left-4 sm:left-12 flex items-end justify-between w-[90%] text-secondary/50 text-[10px] sm:text-xs font-mono font-medium tracking-wider hidden md:flex">
                        <div className="flex flex-col">
                            <span>LATENCY: 12ms</span>
                            <span>REGION: US-EAST</span>
                        </div>
                        <span>SCROLL TO EXPLORE</span>
                    </div>
                </div>

                {/* --- SECTION 2: DETAILS --- */}
                <div id="details-section" className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center py-20 pointer-events-none px-4 sm:px-8">
                    <div className="relative z-20 flex flex-col items-center text-center space-y-6 md:space-y-10 pointer-events-auto backdrop-blur-md bg-white/5 md:bg-transparent p-8 sm:p-12 rounded-[2rem] max-w-5xl mx-auto border border-primary/10 md:border-none shadow-2xl md:shadow-none">
                        <div className="inline-flex items-center gap-3 text-primary font-mono font-medium uppercase tracking-[0.2em] text-[10px] sm:text-xs border border-primary/10 px-4 py-2 rounded-full bg-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-accentBlue animate-pulse"></div>
                            <span>Parallel Processing Core</span>
                        </div>

                        <h2 className="text-4xl sm:text-6xl md:text-8xl leading-[0.9] text-primary tracking-tighter">
                            <span className="block font-serif italic mb-2">Never wait for</span>
                            <span className="block font-semibold">a render bar.</span>
                        </h2>

                        <p className="text-secondary text-base sm:text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto font-light">
                            Trem-AI decouples the interface from the engine. Make a thousand edits a minute; our <span className="text-primary font-medium">cloud swarm</span> handles the heavy lifting instantly.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 pt-8 w-full max-w-3xl">
                            {[
                                { label: "Export", val: "8K+" },
                                { label: "Depth", val: "32-bit" },
                                { label: "FPS", val: "240" },
                                { label: "Format", val: "RAW" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center border-l border-primary/10 first:border-l-0 md:first:border-l">
                                    <span className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{item.val}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-secondary font-mono mt-1">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- SECTION 3: DECONSTRUCTED VIEW (HUD Style) --- */}
                <div id="breakdown-section" className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center pointer-events-none overflow-hidden py-10 px-4 sm:px-8">
                    {/* Background Grid Lines for HUD feel */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary"></div>
                        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-primary"></div>
                        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-primary border-t border-dashed"></div>
                        <div className="absolute top-3/4 left-0 w-full h-[1px] bg-primary border-t border-dashed"></div>
                    </div>

                    <div className="absolute top-0 left-0 w-full p-6 md:p-12 flex justify-between items-start z-10">
                        <div className="pointer-events-auto">
                            <h3 className="text-3xl md:text-5xl font-serif italic text-primary">Engine Metrics</h3>
                            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono uppercase tracking-widest text-secondary">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Live Telemetry
                            </div>
                        </div>
                        <div className="hidden md:block text-right font-mono text-xs text-secondary/60">
                            <div>SYS.CPU: 12%</div>
                            <div>SYS.MEM: 4.2GB</div>
                            <div>NET.IO: 1.2GB/s</div>
                        </div>
                    </div>

                    <div className="w-full h-full max-w-[1800px] relative flex flex-col md:flex-row items-center justify-between z-10 mt-20 md:mt-0 mx-auto px-4 md:px-12">
                        {/* Left Stats */}
                        <div className="flex flex-col gap-12 md:gap-32 w-full md:w-auto pointer-events-auto">
                            <SpecLabel label="Pipeline" value="Async" sub="Non-blocking Render IO" align="left" index={1} />
                            <SpecLabel label="Bit Depth" value="32-bit" sub="Float Precision Color" align="left" index={2} />
                        </div>

                        {/* Center Spacer */}
                        <div className="w-full h-[30vh] md:w-full md:h-auto flex-1"></div>

                        {/* Right Stats */}
                        <div className="flex flex-col gap-12 md:gap-32 w-full md:w-auto text-right items-end pointer-events-auto mt-12 md:mt-0">
                            <SpecLabel label="Preview" value="120fps" sub="Real-time Playback" align="right" index={3} />
                            <SpecLabel label="Nodes" value="Dist." sub="Elastic Compute Swarm" align="right" index={4} />
                        </div>
                    </div>
                </div>

                {/* --- SECTION 4: FOOTER (MAGNETIC PORTAL) --- */}
                <div id="footer-section" className="relative w-full min-h-[90dvh] flex flex-col items-center justify-center py-20 pointer-events-none overflow-hidden px-4 sm:px-8">

                    <div className="relative z-20 flex flex-col items-center justify-center w-full pointer-events-none text-center">
                        <span className="text-xs font-mono uppercase tracking-[0.4em] text-secondary mb-8 pointer-events-auto bg-white/5 px-4 py-1 rounded-full backdrop-blur-sm border border-white/5">Ready to Cut?</span>

                        <div className="flex flex-col items-center mb-16 md:mb-24 pointer-events-auto relative z-10">
                            <h2 className="text-[15vw] sm:text-[12vw] lg:text-[10rem] font-serif italic text-primary leading-[0.8] tracking-tighter opacity-90">
                                Create
                            </h2>
                            <span className="text-[15vw] sm:text-[12vw] lg:text-[10rem] font-sans font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-transparent leading-[0.8] tracking-tighter -mt-2 md:-mt-6 relative block">
                                Faster.
                            </span>
                        </div>

                        <div className="relative group cursor-pointer w-full max-w-md mx-auto pointer-events-auto z-20 px-4">
                            <div className="relative overflow-hidden rounded-full bg-primary text-card shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                <button className="w-full pl-8 pr-3 py-3 flex items-center justify-between">
                                    <span className="text-lg md:text-xl font-medium tracking-wide pl-4">Open Studio</span>
                                    <div className="w-14 h-14 rounded-full bg-card text-primary flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                                        <ArrowUpRight size={24} strokeWidth={2} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 w-full px-6 md:px-12 flex justify-between items-end pointer-events-auto text-primary/80">
                        <div className="flex flex-col gap-1">
                            <Logo />
                            <span className="text-[10px] text-secondary">© 2026 Trem Inc.</span>
                        </div>
                        <div className="flex gap-6 text-xs font-medium uppercase tracking-wider text-secondary hover:text-primary transition-colors">
                            <a href="#" className="hover:underline decoration-1 underline-offset-4">Legal</a>
                            <a href="#" className="hover:underline decoration-1 underline-offset-4">Privacy</a>
                            <a href="#" className="hover:underline decoration-1 underline-offset-4">Twitter</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hero;
