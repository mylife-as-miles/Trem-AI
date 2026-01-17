import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RepoHeader from './components/RepoHeader';
import Orchestrator from './components/Orchestrator';
import StatusGrid from './components/StatusGrid';
import TaskFeed from './components/TaskFeed';
import VideoRepoOverview from './components/VideoRepoOverview';

import TimelineEditor from './components/TimelineEditor';
import CompareDiffView from './components/CompareDiffView';

type ViewState = 'dashboard' | 'repo' | 'timeline' | 'diff';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('diff'); // Default to diff for user request check

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false); // Close mobile sidebar on nav
    }
  };

  // If we are in timeline view, we want a full screen experience without the default shell?
  // The design provided has its own header.
  if (currentView === 'timeline') {
    return <TimelineEditor />;
  }
  if (currentView === 'diff') {
    return <CompareDiffView />;
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-black text-slate-800 dark:text-white font-sans overflow-hidden transition-colors duration-200">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 flex flex-col relative z-0 bg-background-light dark:bg-black w-full">
        {currentView === 'dashboard' ? (
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        ) : (
          <RepoHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scroll-smooth">
          {currentView === 'dashboard' ? (
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
              <Orchestrator />
              <StatusGrid />
              <TaskFeed />
              <div className="h-20"></div> {/* Spacer for bottom scroll */}
            </div>
          ) : (
            <div className="pb-20">
              <VideoRepoOverview />
            </div>
          )}
        </div>
      </main>

      {/* Floating Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="p-3 bg-white dark:bg-black border border-slate-200 dark:border-white/20 rounded-full shadow-lg text-slate-600 dark:text-white hover:text-primary transition-colors hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          onClick={() => setDarkMode(!darkMode)}
        >
          <span className="material-icons-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </div>
  );
};

export default App;