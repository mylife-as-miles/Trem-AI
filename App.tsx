import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Orchestrator from './components/Orchestrator';
import TimelineEditor from './components/TimelineEditor';
import VideoRepoOverview, { RepoData } from './components/VideoRepoOverview';
import CompareDiffView from './components/CompareDiffView';
import AssetLibrary from './components/AssetLibrary';
import CreateRepoView from './components/CreateRepoView';
import RepoFilesView from './components/RepoFilesView';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'repo-files'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [repoData, setRepoData] = useState<RepoData | null>(null);

    const handleNavigate = (view: 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'repo-files') => {
        setCurrentView(view);
        setIsSidebarOpen(false);
    };

    const handleCreateRepo = (data: RepoData) => {
        setRepoData(data);
        handleNavigate('repo');
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Orchestrator onNavigate={handleNavigate} />;
            case 'timeline':
                return <TimelineEditor onNavigate={handleNavigate} />;
            case 'repo':
                return <VideoRepoOverview repoData={repoData} onNavigate={handleNavigate} />;
            case 'diff':
                return <CompareDiffView onNavigate={handleNavigate} />;
            case 'assets':
                return <AssetLibrary />;
            case 'create-repo':
                return <CreateRepoView onNavigate={handleNavigate} onCreateRepo={handleCreateRepo} />;
            case 'repo-files':
                return <RepoFilesView onNavigate={handleNavigate} repoData={repoData} />;
            default:
                return <Orchestrator onNavigate={handleNavigate} />;
        }
    };

    const handleSelectRepo = (data: RepoData) => {
        setRepoData(data);
        handleNavigate('repo');
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white overflow-hidden selection:bg-primary selection:text-white font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNavigate={handleNavigate}
                onSelectRepo={handleSelectRepo}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header Button for Sidebar */}
                <div className="lg:hidden absolute top-4 left-4 z-50">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-md bg-white dark:bg-zinc-800 shadow-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white"
                    >
                        <span className="material-icons-outlined">menu</span>
                    </button>
                </div>

                <main className="flex-1 overflow-auto">
                    {renderView()}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default App;
