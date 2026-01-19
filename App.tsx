import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Orchestrator from './components/Orchestrator';
import TimelineEditor from './components/TimelineEditor';
import VideoRepoOverview from './components/VideoRepoOverview';
import CompareDiffView from './components/CompareDiffView';
import AssetLibrary from './components/AssetLibrary';
// import Header from './components/Header'; // Assuming Header might be used inside views or globally

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleNavigate = (view: 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings') => {
        setCurrentView(view);
        setIsSidebarOpen(false); // Close sidebar on mobile nav
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Orchestrator onNavigate={handleNavigate} />;
            case 'timeline':
                return <TimelineEditor onNavigate={handleNavigate} />;
            case 'repo':
                return <VideoRepoOverview onNavigate={handleNavigate} />;
            case 'diff':
                return <CompareDiffView onNavigate={handleNavigate} />;
            case 'assets':
                return <AssetLibrary onNavigate={handleNavigate} />;
            default:
                return <Orchestrator onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white overflow-hidden selection:bg-primary selection:text-white font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNavigate={handleNavigate}
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
