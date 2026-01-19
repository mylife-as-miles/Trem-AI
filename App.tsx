import React, { useState } from 'react';
import Hero from './components/Hero';
import Orchestrator from './components/Orchestrator';
import TimelineEditor from './components/TimelineEditor';
import VideoRepoOverview from './components/VideoRepoOverview';
import CompareDiffView from './components/CompareDiffView';
import AssetLibrary from './components/AssetLibrary';

type ViewState = 'landing' | 'orchestrator' | 'timeline' | 'repo' | 'diff' | 'assets';

function App() {
  const [view, setView] = useState<ViewState>('landing');

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <Hero onStart={() => setView('orchestrator')} />;
      case 'orchestrator':
        return (
          <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl">
              <Orchestrator onNavigate={setView} />
            </div>
          </div>
        );
      case 'timeline':
        return <TimelineEditor onNavigate={setView} />;
      case 'repo':
        return (
          <div className="min-h-screen bg-background text-foreground p-8">
            {/* Temporary Back Button for views without nav */}
            <button onClick={() => setView('orchestrator')} className="mb-4 text-sm text-secondary hover:text-primary">← Back to Orchestrator</button>
            <VideoRepoOverview />
          </div>
        );
      case 'diff':
        return <CompareDiffView onNavigate={setView} />;
      case 'assets':
        return (
          <div className="h-screen flex flex-col">
            <div className="bg-black border-b border-white/10 p-2">
              <button onClick={() => setView('orchestrator')} className="text-xs text-secondary hover:text-white">← Back</button>
            </div>
            <AssetLibrary />
          </div>
        );
      default:
        return <Hero onStart={() => setView('orchestrator')} />;
    }
  };

  return (
    <div className="antialiased min-h-screen bg-background text-foreground animate-fade-in">
      {renderView()}
    </div>
  );
}

export default App;