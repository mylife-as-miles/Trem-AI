import React, { useState, useEffect } from 'react';
import { db, RepoData } from '../../utils/db';

interface EditLandingViewProps {
    onSelectRepo: (repo: RepoData) => void;
    onNavigate: (view: any) => void;
}

const EditLandingView: React.FC<EditLandingViewProps> = ({ onSelectRepo, onNavigate }) => {
    const [recentRepos, setRecentRepos] = useState<RepoData[]>([]);

    useEffect(() => {
        const loadRepos = async () => {
            try {
                const repos = await db.getAllRepos();
                // Sort by last opened or created if possible, effectively just taking all for now
                setRecentRepos(repos);
            } catch (error) {
                console.error("Failed to load repos:", error);
            }
        };
        loadRepos();
    }, []);

    return (
        <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-start pt-20 pb-10 min-h-full">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

            <div className="w-full max-w-6xl px-8 z-10 space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-white">
                        Edit <span className="text-primary">Projects</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Resume your work, manage assets, or dive into the timeline.
                    </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: 'Timeline Editor',
                            icon: 'movie_edit',
                            desc: 'Fine-tune clips and cuts',
                            action: () => onNavigate('timeline')
                        },
                        {
                            title: 'Project Settings',
                            icon: 'settings',
                            desc: 'Configure defaults & render',
                            action: () => onNavigate('settings')
                        },
                        {
                            title: 'Asset Library',
                            icon: 'video_library',
                            desc: 'Manage footage & files',
                            action: () => onNavigate('assets')
                        },
                        {
                            title: 'Version Compare',
                            icon: 'difference',
                            desc: 'Review changes & diffs',
                            action: () => onNavigate('diff')
                        }
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.action}
                            className="group relative p-6 rounded-2xl bg-surface-card border border-border-dark hover:border-primary/50 transition-all duration-300 text-left overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative z-10">
                                <span className="material-icons-outlined text-4xl text-primary mb-4 group-hover:scale-110 transition-transform duration-300 display-block">
                                    {item.icon}
                                </span>
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                    {item.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Recent Projects List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-icons-outlined text-primary">history</span>
                            Recent Projects
                        </h2>
                        {/* <button className="text-sm text-zinc-400 hover:text-white transition-colors">View All</button> */}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {recentRepos.length === 0 ? (
                            <div className="p-10 border border-border-dark border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500 bg-surface-card/30">
                                <span className="material-icons-outlined text-4xl mb-2 opacity-50">folder_off</span>
                                <p>No projects found. Create one to get started.</p>
                                <button
                                    onClick={() => onNavigate('trem-create')}
                                    className="mt-4 px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors"
                                >
                                    Create New Project
                                </button>
                            </div>
                        ) : (
                            recentRepos.map((repo) => (
                                <div
                                    key={repo.id}
                                    onClick={() => onSelectRepo(repo)}
                                    className="group flex items-center p-4 bg-surface-card border border-border-dark rounded-xl hover:border-primary/50 cursor-pointer transition-all duration-200"
                                >
                                    {/* Project Icon/Thumbnail Placeholder */}
                                    <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center mr-6 group-hover:bg-zinc-700 transition-colors border border-border-dark">
                                        <span className="material-icons-outlined text-2xl text-zinc-500 group-hover:text-primary transition-colors">
                                            movie
                                        </span>
                                    </div>

                                    {/* Project Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                            {repo.name}
                                        </h3>
                                        <p className="text-sm text-zinc-500">
                                            {repo.path}
                                        </p>
                                    </div>

                                    {/* Action Arrow */}
                                    <div className="px-4">
                                        <span className="material-icons-outlined text-zinc-600 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                            arrow_forward
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EditLandingView;
