import React, { useState, useEffect } from 'react';
import { db, RepoData } from '../../utils/db';

interface CreateLandingViewProps {
    onSelectTemplate: (template: string) => void;
    onSelectRepo?: (repo: RepoData) => void;
}

const TEMPLATE_CARDS = [
    {
        id: 'infographics',
        title: 'Infographics',
        description: 'Animate charts, data, and visual storytelling elements',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
        category: 'DATA VIZ',
        icon: 'analytics'
    },
    {
        id: 'text-animation',
        title: 'Text Animation',
        description: 'Bring titles, captions, and typography to life with kinetic energy',
        image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=1200',
        category: 'TYPOGRAPHY',
        icon: 'text_fields'
    },
    {
        id: 'posters',
        title: 'Motion Posters',
        description: 'Turn static posters into eye-catching motion visuals for social media',
        image: 'https://images.unsplash.com/photo-1558655146-d09347e0b7a8?auto=format&fit=crop&q=80&w=1200',
        category: 'SOCIAL',
        icon: 'movie'
    },
    {
        id: 'presentation',
        title: 'Smart Presentations',
        description: 'Create smooth, engaging video presentations that automatically adapt to content',
        image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=1200',
        category: 'CORPORATE',
        icon: 'slideshow'
    },
    {
        id: 'blank',
        title: 'From Scratch',
        description: 'Start with a blank canvas and build any motion you want',
        image: 'https://images.unsplash.com/photo-1626544827763-d516dce335ca?auto=format&fit=crop&q=80&w=1200',
        category: 'CUSTOM',
        icon: 'add'
    }
];

const CreateLandingView: React.FC<CreateLandingViewProps> = ({ onSelectTemplate, onSelectRepo }) => {
    const [repos, setRepos] = useState<RepoData[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const loadRepos = async () => {
            // ... existing data loading ...
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

    const activeItem = TEMPLATE_CARDS[activeIndex];

    return (
        <div className="flex-1 p-6 md:p-10 fade-in bg-slate-50 min-h-screen flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">

                {/* Header Section (Kept as requested) */}
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
                        CREATE WITH <span className="text-purple-600">TREM AI</span>
                    </h1>
                    <p className="text-lg text-slate-500">
                        How would you like to get started?
                    </p>
                </div>

                {/* Carousel Area */}
                <div className="flex-1 flex flex-col justify-center min-h-[600px]">

                    {/* Main Card */}
                    <div className="relative w-full aspect-[2/1] max-h-[500px] rounded-[32px] overflow-hidden shadow-2xl group transition-all duration-500">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={activeItem.image}
                                alt={activeItem.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Gradient Overlay for Text Readability if needed, but keeping it light for 'Light Mode' request? 
                                 Actually, the reference image has a dark card. The user asked for "light mode" generally, 
                                 but often "light mode" implies the surrounding page is white, while content cards might still have images.
                                 To ensure the 'Start Creating' button pops, I will add a subtle dark overlay or just rely on the image.
                             */}
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-8 left-8">
                            <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                                {activeItem.category}
                            </span>
                        </div>

                        {/* Centered CTA */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={() => onSelectTemplate(activeItem.title)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105 flex items-center gap-2 group/btn"
                            >
                                Start Creating
                                <span className="material-icons-outlined group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Info Section */}
                    <div className="flex items-end justify-between mt-12 px-4">
                        <div className="max-w-xl space-y-4">
                            <div className="inline-block px-3 py-1 rounded bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                                Feature Spotlight
                            </div>
                            <h2 className="text-5xl font-bold text-slate-900 uppercase leading-none tracking-tight">
                                {activeItem.title}
                            </h2>
                            <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                                {activeItem.description}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6">
                            {/* Dots */}
                            <div className="flex gap-2">
                                {TEMPLATE_CARDS.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-purple-600 w-8' : 'bg-slate-300 hover:bg-slate-400'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Arrows */}
                            <div className="flex gap-3">
                                <button
                                    onClick={prevSlide}
                                    className="w-12 h-12 rounded-full border border-slate-200 hover:border-purple-600 hover:text-purple-600 flex items-center justify-center transition-colors text-slate-400"
                                >
                                    <span className="material-icons-outlined">chevron_left</span>
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-12 h-12 rounded-full border border-slate-200 hover:border-purple-600 hover:text-purple-600 flex items-center justify-center transition-colors text-slate-400"
                                >
                                    <span className="material-icons-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Projects Section (Minimized but accessible) */}
                <div className="mt-16 pt-8 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Recent Projects</h3>
                    {repos.length === 0 ? (
                        <p className="text-slate-400 text-sm italic">No projects yet. Start creating above!</p>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {repos.map((repo) => (
                                <button
                                    key={repo.id}
                                    onClick={() => onSelectRepo && onSelectRepo(repo)}
                                    className="min-w-[200px] p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-500 transition-colors text-left group"
                                >
                                    <h4 className="font-bold text-slate-800 truncate group-hover:text-purple-600">{repo.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(repo.created).toLocaleDateString()}
                                    </p>
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
