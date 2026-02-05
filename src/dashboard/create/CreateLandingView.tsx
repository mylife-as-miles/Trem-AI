import React, { useState, useEffect } from 'react';
import { db, RepoData } from '../../utils/db';

interface CreateLandingViewProps {
    onSelectTemplate: (template: string) => void;
    onSelectRepo?: (repo: RepoData) => void;
}

const TEMPLATE_CARDS = [
    {
        id: 'infographics',
        title: 'Animated Infographics',
        description: 'Turn numbers into stories. Animate charts and visual blocks step by step to guide attention and build momentum.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        icon: 'analytics',
        badge: 'VIBE MOTION DESIGN'
    },
    {
        id: 'text-animation',
        title: 'Kinetic Typography',
        description: 'Bring titles, captions, and typography to life with dynamic motion presets and custom easing controls.',
        image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=800',
        icon: 'text_fields',
        badge: 'TYPE MOTION'
    },
    {
        id: 'posters',
        title: 'Motion Posters',
        description: 'Turn static posters into eye-catching motion visuals. Perfect for social media and digital signage.',
        image: 'https://images.unsplash.com/photo-1558655146-d09347e0b7a8?auto=format&fit=crop&q=80&w=800',
        icon: 'movie',
        badge: 'EVENT PROMO'
    },
    {
        id: 'presentation',
        title: 'Smart Presentations',
        description: 'Create smooth, engaging slides and motion decks that automatically adapt to your content length.',
        image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=800',
        icon: 'slideshow',
        badge: 'CORPORATE'
    },
    {
        id: 'blank',
        title: 'Start From Scratch',
        description: 'Begin with a blank canvas and build any motion you want using our advanced timeline editor.',
        image: '',
        icon: 'add',
        badge: 'CUSTOM BUILD'
    }
];

const CreateLandingView: React.FC<CreateLandingViewProps> = ({ onSelectTemplate, onSelectRepo }) => {
    const [repos, setRepos] = useState<RepoData[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const loadRepos = async () => {
            try {
                const data = await db.getAllRepos();
                setRepos(data);
            } catch (error) {
                console.error("Failed to load repos:", error);
            }
        };
        loadRepos();
    }, []);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % TEMPLATE_CARDS.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + TEMPLATE_CARDS.length) % TEMPLATE_CARDS.length);
    };

    const activeCard = TEMPLATE_CARDS[activeIndex];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-black fade-in overflow-y-auto">
            {/* Main Carousel Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative">

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none opacity-50"></div>

                {/* Content Container */}
                <div className="max-w-4xl w-full flex flex-col items-center gap-8 relative z-10">

                    {/* Main Visual Card */}
                    <button
                        onClick={() => onSelectTemplate(activeCard.title)}
                        className="group relative w-full aspect-video md:aspect-[2/1] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 transition-transform duration-300 hover:scale-[1.01]"
                    >
                        {/* Card Badge */}
                        {activeCard.badge && (
                            <div className="absolute top-6 left-6 z-20">
                                <span className="bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border border-white/10 uppercase">
                                    {activeCard.badge}
                                </span>
                            </div>
                        )}

                        {activeCard.id === 'blank' ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center group-hover:border-primary group-hover:text-primary text-slate-500 transition-colors">
                                    <span className="material-icons-outlined text-4xl">add</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Image Background with Overlay */}
                                <img
                                    src={activeCard.image}
                                    alt={activeCard.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                {/* Abstract Visualization (Placeholder for animation) */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="material-icons-outlined text-6xl md:text-8xl text-white/20 group-hover:text-primary/80 transition-colors duration-300 transform group-hover:scale-110">
                                        {activeCard.icon}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Hover Overlay Content */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10 backdrop-blur-[2px]">
                            <span className="bg-primary text-white px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                Start Creating
                            </span>
                        </div>
                    </button>

                    {/* Text Content */}
                    <div className="text-center max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 key={activeIndex}">
                        <div className="inline-block bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase mb-2">
                            {activeCard.badge}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {activeCard.title}
                        </h2>
                        <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                            {activeCard.description}
                        </p>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-6 mt-4">
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-full bg-slate-200 dark:bg-zinc-900 text-slate-600 dark:text-white hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                        >
                            <span className="material-icons-outlined">chevron_left</span>
                        </button>

                        <div className="flex gap-2">
                            {TEMPLATE_CARDS.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === activeIndex
                                            ? 'w-8 bg-primary'
                                            : 'w-2 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400 dark:hover:bg-zinc-600'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-full bg-slate-200 dark:bg-zinc-900 text-slate-600 dark:text-white hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                        >
                            <span className="material-icons-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Footer Section */}
            <div className="border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <span className="text-xs font-bold font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                                Recent Projects
                            </span>
                        </div>
                    </div>

                    {repos.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-slate-400 dark:text-gray-600">No projects yet. Start creating above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {repos.slice(0, 4).map((repo) => (
                                <button
                                    key={repo.id}
                                    onClick={() => onSelectRepo && onSelectRepo(repo)}
                                    className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-lg p-3 text-left hover:border-primary/50 transition-all flex items-center gap-3 hover:shadow-lg"
                                >
                                    <div className="w-10 h-10 rounded bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <span className="material-icons-outlined text-slate-400 group-hover:text-primary transition-colors text-lg">movie</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-primary transition-colors">
                                            {repo.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                                            <span>{new Date(repo.created).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateLandingView;
