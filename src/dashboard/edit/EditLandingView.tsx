import React, { useState, useEffect } from 'react';
import { db, RepoData } from '../../utils/db';
import TemplateCarousel from '../create/components/TemplateCarousel';
// Import assets or placeholders as needed

interface EditLandingViewProps {
    onSelectRepo: (repo: RepoData) => void;
    onNavigate: (view: any) => void;
}

const EditLandingView: React.FC<EditLandingViewProps> = ({ onSelectRepo, onNavigate }) => {
    const [repos, setRepos] = useState<RepoData[]>([]);
    const [carouselItems, setCarouselItems] = useState<any[]>([]);

    useEffect(() => {
        const loadRepos = async () => {
            try {
                const data = await db.getAllRepos();
                setRepos(data);

                // Map repos to carousel cards
                if (data.length > 0) {
                    const mapped = data.map((repo, index) => ({
                        id: String(repo.id),
                        title: repo.name,
                        description: repo.brief || 'No description',
                        // Use a deterministic unplash image based on index or existing metadata
                        image: `https://images.unsplash.com/photo-${[
                            '1555421689-491a97ff2040',
                            '1551288049-bebda4e38f71',
                            '1516321318423-f06f85e504b3',
                            '1536440136628-849c177e76a1',
                            '1611162617474-5b21e879e113'
                        ][index % 5]}?auto=format&fit=crop&q=80&w=400`,
                        icon: 'movie_edit'
                    }));
                    setCarouselItems(mapped);
                } else {
                    // Placeholder if no projects
                    setCarouselItems([{
                        id: 'create-new',
                        title: 'No Projects Found',
                        description: 'Create a new project to get started',
                        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400',
                        icon: 'add_circle'
                    }]);
                }
            } catch (error) {
                console.error("Failed to load repos:", error);
            }
        };
        loadRepos();
    }, []);

    const handleCarouselSelect = (item: any) => {
        if (item.id === 'create-new') {
            onNavigate('trem-create');
            return;
        }
        const repo = repos.find(r => String(r.id) === item.id);
        if (repo) {
            onSelectRepo(repo);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 fade-in bg-slate-50/50 dark:bg-background-dark min-h-full font-sans">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Hero Section */}
                <div className="text-center space-y-6 py-8 md:py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-emerald-600 dark:text-primary text-xs font-medium tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        AI-POWERED VIDEO EDITING
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                        Edit with <span className="text-primary">Trem AI</span>
                    </h1>

                    <p className="text-xl text-slate-500 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Select a project to resume editing or refine your content with AI tools.
                    </p>
                </div>

                {/* Carousel Section */}
                <div>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-sm font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Resume Editing</h2>
                    </div>

                    {/* 3D Carousel Selection */}
                    <div className="relative -mx-10 md:-mx-20 lg:-mx-32 fade-in-up">
                        {carouselItems.length > 0 && (
                            <TemplateCarousel
                                templates={carouselItems}
                                onSelect={(item) => handleCarouselSelect(item)}
                            />
                        )}
                    </div>
                </div>

                {/* Projects Section (Grid) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2 pt-8 border-t border-slate-200/60 dark:border-border-dark">
                        <h2 className="text-sm font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">All Projects</h2>
                        {repos.length > 0 && (
                            <button className="text-xs text-emerald-600 dark:text-primary hover:text-emerald-700 dark:hover:text-primary_hover font-medium transition-colors">
                                View all
                            </button>
                        )}
                    </div>

                    {repos.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center bg-white/50 dark:bg-surface-card rounded-2xl border border-dashed border-slate-200 dark:border-border-dark hover:border-slate-300 dark:hover:border-white/20 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 text-slate-400 dark:text-gray-500">
                                <span className="material-icons-outlined text-xl">folder_open</span>
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">No projects yet</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-500 cursor-pointer hover:text-primary" onClick={() => onNavigate('trem-create')}>
                                Create your first project now
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {repos.map((repo) => (
                                <button
                                    key={repo.id}
                                    onClick={() => onSelectRepo && onSelectRepo(repo)}
                                    className="group relative bg-white dark:bg-surface-card border border-slate-200 dark:border-border-dark rounded-xl p-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                            <span className="material-icons-outlined text-slate-400 dark:text-gray-400 group-hover:text-primary transition-colors">
                                                movie_edit
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-primary transition-colors text-base">
                                                {repo.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                {repo.brief || 'No description provided'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-medium text-slate-600 dark:text-gray-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                                    Editable
                                                </div>
                                                <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">
                                                    {new Date(repo.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
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

export default EditLandingView;
