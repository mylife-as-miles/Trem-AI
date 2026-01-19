import React, { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, Menu, Zap, Check, Play, Star, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeScene from './ThreeScene';

gsap.registerPlugin(ScrollTrigger);

const Logo = () => (
    <div className="flex items-center gap-2 font-semibold text-foreground z-50 pointer-events-auto select-none group cursor-pointer">
        <div className="w-5 h-5 md:w-6 md:h-6 bg-primary rounded-[4px] flex items-center justify-center group-hover:rotate-180 transition-transform duration-500 ease-out shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full"></div>
        </div>
        <span className="tracking-tight text-base md:text-lg">trem-ai</span>
    </div>
);

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
    <div className="flex flex-col items-center text-center mb-16 md:mb-24 relative z-10 px-4">
        {subtitle && (
            <span className="text-primary font-mono text-xs uppercase tracking-widest mb-4 block">{subtitle}</span>
        )}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
            {children}
        </h2>
    </div>
);

const Hero: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Initial Reveal Animation
            const tl = gsap.timeline();

            tl.from(".nav-item", {
                y: -20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out"
            })
                .from(".hero-title-line", {
                    y: 100,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.15,
                    ease: "power4.out"
                }, "-=0.4")
                .from(".hero-btn", {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.6,
                    ease: "back.out(1.7)"
                }, "-=0.4");

            // Scroll Triggers for Sections
            gsap.utils.toArray<HTMLElement>('.fade-up-section').forEach(section => {
                gsap.from(section.children, {
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                    },
                    y: 40,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out"
                });
            });

        }, componentRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={componentRef} className="relative w-full min-h-screen bg-background overflow-x-hidden font-sans text-foreground selection:bg-primary selection:text-white">
            <div className="bg-noise"></div>

            {/* --- GLOBAL FIXED BACKGROUNDS --- */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 text-foreground">
                <svg className="w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
                    <path d="M 0 450 Q 720 150 1440 450" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
                </svg>
            </div>

            <div className="fixed inset-0 z-0">
                <ThreeScene />
            </div>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className="relative z-10 w-full max-w-[1920px] mx-auto flex flex-col">

                {/* --- SECTION 1: HERO --- */}
                <div id="hero-section" className="relative flex flex-col min-h-[90dvh] w-full px-4 sm:px-8 md:px-12 lg:px-24 pb-10">
                    <nav className="flex justify-between items-center py-6 md:py-10 pointer-events-auto relative z-50">
                        <div className="flex items-center gap-4 md:gap-12 nav-item">
                            <Logo />
                        </div>
                        <div className="hidden md:flex gap-8 nav-item items-center text-sm font-medium text-secondary">
                            <a href="#features" className="hover:text-primary transition-colors">Features</a>
                            <a href="#process" className="hover:text-primary transition-colors">Process</a>
                            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                            <button onClick={onStart} className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:text-white transition-all text-foreground">
                                Sign in
                            </button>
                            <button onClick={onStart} className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary_hover transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                Sign up for free
                            </button>
                        </div>
                        <button onClick={onStart} className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white nav-item">
                            <Menu className="w-5 h-5" />
                        </button>
                    </nav>

                    <main className="flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto pointer-events-auto mt-12 md:mt-20 relative text-center items-center">
                        <h1 className="text-[12vw] sm:text-[9vw] lg:text-[7rem] leading-[0.9] font-medium text-foreground tracking-[-0.04em] mb-8 md:mb-10 relative z-20">
                            <div className="hero-title-line">Edit your video in</div>
                            <div className="hero-title-line relative inline-block">
                                <span className="font-serif italic text-primary text-glow mix-blend-screen">5 minutes</span>
                            </div>
                        </h1>

                        <p className="text-secondary text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-10 hero-title-line font-light">
                            Instant AI animations for your <span className="text-foreground border-b border-primary/50">talking head</span> marketing videos.
                            Turn raw footage into engaging content in seconds.
                        </p>

                        <div className="hero-btn">
                            <button onClick={onStart} className="group relative flex items-center gap-4 bg-primary text-white rounded-full pl-8 pr-2 py-2 h-16 sm:h-20 min-w-[280px] hover:bg-white transition-all duration-500 cursor-pointer shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] active:scale-95 overflow-hidden mx-auto">
                                <span className="relative z-10 text-xl font-medium tracking-wide">Join now</span>
                                <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-white ml-auto">
                                    <ArrowUpRight className="w-6 h-6" />
                                </div>
                                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                <span className="absolute inset-0 z-[11] text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center pl-8 pointer-events-none text-xl font-medium tracking-wide">Join now</span>
                            </button>
                        </div>
                    </main>
                </div>

                {/* --- FEATURES GRID --- */}
                <div id="features" className="w-full py-20 px-4 sm:px-8 md:px-12 pointer-events-auto fade-up-section">
                    <SectionHeading subtitle="Built by creatives, for creatives">
                        We know it sounds too good to be true, <br /><span className="font-serif italic text-secondary">here's why it isn't.</span>
                    </SectionHeading>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {[
                            { title: "Workflow-first", desc: "Editing starts with workflow, with timelines only if you want them." },
                            { title: "Content-aware", desc: "We analyze everything in your video before creating the animations." },
                            { title: "Match your brand", desc: "Define your style once. Get consistent animations every time." },
                            { title: "Tweak by chat", desc: "Modify insertions by chat instead of spending hours in After Effects." },
                            { title: "Learns with you", desc: "Becomes faster and better with every edit you make." },
                            { title: "Platform Native", desc: "Optimized outputs for YouTube, Instagram, TikTok, and LinkedIn." }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all duration-300 hover:border-primary/50 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors"></div>
                                <h3 className="text-2xl font-display font-medium mb-3 text-foreground">{feature.title}</h3>
                                <p className="text-secondary text-lg font-light leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- PROCESS STEPS --- */}
                <div id="process" className="w-full py-20 px-4 sm:px-8 md:px-12 pointer-events-auto fade-up-section bg-gradient-to-b from-transparent to-black/80">
                    <SectionHeading subtitle="How we do it">
                        From raw footage to <br /> <span className="text-primary text-glow">viral content.</span>
                    </SectionHeading>

                    <div className="max-w-6xl mx-auto flex flex-col md:grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Context Analysis", desc: "We process your video contents, script, lighting, and framing." },
                            { step: "02", title: "Storyboard", desc: "We generate a tailored storyboard based on transcript processing." },
                            { step: "03", title: "Animation", desc: "Each canvas is animated element by element, just like a pro editor." },
                            { step: "04", title: "Integration", desc: "We integrate approved animations and render the final cut." }
                        ].map((item, i) => (
                            <div key={i} className="relative flex flex-col border-l border-white/20 pl-6 md:border-l-0 md:border-t md:pt-6 group">
                                <span className="text-6xl font-display font-bold text-white/5 mb-4 group-hover:text-primary/20 transition-colors">{item.step}</span>
                                <h4 className="text-xl font-bold text-foreground mb-2">{item.title}</h4>
                                <p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- TESTIMONIALS --- */}
                <div id="testimonials" className="w-full py-24 px-4 sm:px-8 pointer-events-auto fade-up-section overflow-hidden">
                    <h3 className="text-center text-sm font-mono uppercase tracking-widest text-secondary mb-12">In the words of creatives</h3>

                    {/* Horizontal Scroll / Grid for simplicity on this implementation */}
                    <div className="flex flex-wrap justify-center gap-6 max-w-[1920px] mx-auto">
                        {[
                            { name: "James Fears", role: "Content Creator", text: "This is a really good product. I barely have to do any editing. I like not having to think." },
                            { name: "Nizzy", role: "Co-founder of Mail0", text: "This is what I want: one that cuts the dead parts & auto captions. Honestly a game changer." },
                            { name: "Sam", role: "Filmmaker @frontrow", text: "Proud to be one of the first users! :)" },
                            { name: "Paulius", role: "Indie Hacker", text: "This is super cool." }
                        ].map((t, i) => (
                            <div key={i} className="w-full sm:w-[350px] p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex gap-1 mb-4 text-primary">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                                <p className="text-foreground/90 text-lg mb-6 leading-relaxed">"{t.text}"</p>
                                <div>
                                    <div className="font-bold text-foreground text-sm">{t.name}</div>
                                    <div className="text-xs text-secondary font-mono mt-0.5">{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* --- PRICING --- */}
                <div id="pricing" className="w-full py-24 px-4 sm:px-8 pointer-events-auto fade-up-section">
                    <SectionHeading subtitle="Commitment Free">
                        Fair pricing for <br /> <span className="font-serif italic">every stage.</span>
                    </SectionHeading>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                        {/* Free Tier */}
                        <div className="p-8 rounded-3xl border border-white/10 bg-black/40 flex flex-col">
                            <h3 className="text-xl font-bold text-foreground mb-2">Free</h3>
                            <div className="text-4xl font-display font-bold text-foreground mb-4">$0<span className="text-lg font-sans font-normal text-secondary">/mo</span></div>
                            <p className="text-secondary text-sm mb-6">Try it out for free, no commitments.</p>
                            <button onClick={onStart} className="w-full py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all mb-8 text-sm font-bold uppercase tracking-wider">Try it</button>
                            <ul className="space-y-4 text-sm text-secondary">
                                {['3 Export credits', 'Guided AI editing', 'You approve most actions', 'Captions', 'Basic b-roll'].map((feat, i) => (
                                    <li key={i} className="flex gap-3"><Check size={16} className="text-primary shrink-0" /> {feat}</li>
                                ))}
                            </ul>
                            <div className="mt-6 text-xs text-secondary/50 text-center">*we don't ask for your credit card</div>
                        </div>

                        {/* Creator Tier (Featured) */}
                        <div className="p-8 rounded-[2rem] border border-primary/50 bg-black/80 flex flex-col relative shadow-[0_0_40px_rgba(168,85,247,0.15)] transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-lg">Most Popular</div>
                            <h3 className="text-xl font-bold text-foreground mb-2 text-primary">Creator</h3>
                            <div className="text-5xl font-display font-bold text-foreground mb-4">$19<span className="text-lg font-sans font-normal text-secondary">/mo</span></div>
                            <p className="text-secondary text-sm mb-6">If you want to make more videos and edit faster.</p>
                            <button onClick={onStart} className="w-full py-3 rounded-full bg-primary hover:bg-primary_hover text-white transition-all mb-8 text-sm font-bold uppercase tracking-wider shadow-lg">Get Started</button>
                            <ul className="space-y-4 text-sm text-foreground/90">
                                {['20 Export credits', 'Autonomous AI editing', 'Agent makes decisions', 'Animated titles', 'B-roll insertions', 'Advanced animations'].map((feat, i) => (
                                    <li key={i} className="flex gap-3"><Check size={16} className="text-primary shrink-0" /> {feat}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Tier */}
                        <div className="p-8 rounded-3xl border border-white/10 bg-black/40 flex flex-col">
                            <h3 className="text-xl font-bold text-foreground mb-2">Pro</h3>
                            <div className="text-4xl font-display font-bold text-foreground mb-4">$99<span className="text-lg font-sans font-normal text-secondary">/mo</span></div>
                            <p className="text-secondary text-sm mb-6">Daily videos with highly advanced insertions.</p>
                            <button onClick={onStart} className="w-full py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all mb-8 text-sm font-bold uppercase tracking-wider">Get Started</button>
                            <ul className="space-y-4 text-sm text-secondary">
                                {['60 Export credits', 'Autonomous AI editing', 'Agent makes decisions', 'Context-aware captions', 'Advanced b-roll', 'Advanced animations'].map((feat, i) => (
                                    <li key={i} className="flex gap-3"><Check size={16} className="text-primary shrink-0" /> {feat}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- FAQ --- */}
                <div id="faq" className="w-full py-20 px-4 sm:px-8 pointer-events-auto fade-up-section max-w-3xl mx-auto">
                    <h3 className="text-2xl font-display font-bold text-foreground mb-8 text-center">Questions?</h3>
                    <div className="space-y-4">
                        {[
                            { q: "How is this different from traditional video editors?", a: "Trem-AI removes the timeline grind. Instead of dragging clips and keyframes, it analyzes your video and builds animations for you." },
                            { q: "What kinds of videos work best?", a: "Talking head marketing videos, social media shorts, and educational content typically see the best results." },
                            { q: "Will it match my brand style?", a: "Yes. You can define your brand assets and style guide once, and our agents will adhere to it for every edit." },
                            { q: "How much control do I have?", a: "Total control. You can approve every decision the agent makes, or let it run autonomously and tweak the final output." }
                        ].map((item, i) => (
                            <div key={i} className="border-b border-white/10 pb-4">
                                <div className="font-medium text-foreground py-2 cursor-pointer">{item.q}</div>
                                <div className="text-secondary text-sm leading-relaxed">{item.a}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div id="footer-section" className="relative w-full py-20 px-4 sm:px-8 pointer-events-auto border-t border-white/5 bg-black/80">
                    <div className="relative z-20 flex flex-col items-center justify-center w-full text-center">
                        <span className="text-xs font-mono uppercase tracking-[0.4em] text-secondary mb-8">Sooooooo....</span>

                        <h2 className="text-[10vw] sm:text-[8vw] lg:text-[6rem] font-serif italic text-foreground leading-[0.9] tracking-tighter opacity-90 mb-4">
                            Ready to make <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 not-italic font-sans font-bold">crazy videos?</span>
                        </h2>

                        <div className="flex gap-4 mt-8">
                            <button onClick={onStart} className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors">Start for free</button>
                            <button className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">Talk to us</button>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto mt-24 flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <Logo />
                            <p className="text-xs text-secondary mt-2">© 2026 Trem-AI</p>
                        </div>
                        <div className="flex gap-6 text-sm text-secondary">
                            <a href="#" className="hover:text-white">Twitter</a>
                            <a href="#" className="hover:text-white">LinkedIn</a>
                            <a href="#" className="hover:text-white">Instagram</a>
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hero;
