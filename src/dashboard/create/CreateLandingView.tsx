import React, { useState, useEffect } from 'react';
import { db, RepoData } from '../../utils/db'; // We need recent projects

interface CreateLandingViewProps {
    onSelectTemplate: (template: string) => void;
    onSelectRepo?: (repo: RepoData) => void;
}

const TEMPLATE_CARDS = [
    {
        id: 'infographics',
        title: 'Infographics',
        description: 'Animate charts, data, and visual storytelling elements',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400', // Placeholder
        icon: 'analytics'
    },
    {
        id: 'text-animation',
        title: 'Text Animation',
        description: 'Bring titles, captions, and typography to life',
        image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=400',
        icon: 'text_fields'
    },
    {
        id: 'posters',
        title: 'Posters',
        description: 'Turn static posters into eye-catching motion visuals',
        image: 'https://images.unsplash.com/photo-1558655146-d09347e0b7a8?auto=format&fit=crop&q=80&w=400',
        icon: 'movie'
    },
    {
        id: 'presentation',
        title: 'Presentation',
        description: 'Create smooth, engaging slides and motion decks',
        image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=400',
        icon: 'slideshow'
    },
    {
        id: 'blank',
        title: 'From scratch',
        description: 'Start with a blank canvas and build any motion you want',
        image: '', // Special case styling
        icon: 'add'
    }
];

const CreateLandingView: React.FC<CreateLandingViewProps> = ({ onSelectTemplate, onSelectRepo }) => {
    const [repos, setRepos] = useState<RepoData[]>([]);

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

    return (
        <div className="flex-1 p-6 md:p-10 fade-in">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                        CREATE WITH <span className="text-primary">TREM AI</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-gray-400">
                        How would you like to get started?
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {TEMPLATE_CARDS.map((card) => (
                        <button
                            key={card.id}
                            onClick={() => onSelectTemplate(card.title)}
                            className="group relative flex flex-col items-start text-left bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-64"
                        >
                            {/* Card Image Area */}
                            <div className={`w-full h-32 bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center`}>
                                {card.id === 'blank' ? (
                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors">
                                        <span className="material-icons-outlined">add</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Colored Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 z-10"></div>
                                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                            {/* Abstract Placeholder for now */}
                                            <span className="material-icons-outlined text-4xl text-white/20">{card.icon}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="p-4 flex flex-col flex-1 w-full">
                                <div className="flex items-center justify-between w-full mb-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                        {card.title}
                                    </h3>
                                    <span className="material-icons-outlined text-slate-300 dark:text-gray-600 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Projects Section */}
                <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold font-mono text-slate-600 dark:text-white">
                            Your projects
                        </span>
                    </div>

                    {repos.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5">
                            <h3 className="text-xl font-display font-bold text-slate-700 dark:text-white mb-2">NO PROJECTS YET</h3>
                            <p className="text-sm text-slate-500 dark:text-gray-500 max-w-xs text-center">
                                Create a project or explore what others are making in the Community
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {repos.map((repo) => (
                                <button
                                    key={repo.id}
                                    onClick={() => onSelectRepo && onSelectRepo(repo)}
                                    className="group bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-left hover:border-primary/50 transition-all flex items-start gap-4 hover:shadow-md"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <span className="material-icons-outlined text-slate-400 dark:text-gray-400 group-hover:text-primary transition-colors">movie</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                            {repo.name}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">
                                            {repo.brief}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                                            <span>Draft</span>
                                            <span>•</span>
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
