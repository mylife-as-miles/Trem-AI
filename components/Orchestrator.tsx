import React, { useState, useEffect } from 'react';
import { interpretAgentCommand } from '../services/geminiService';
import TopNavigation from './TopNavigation';
import { db, RepoData } from '../utils/db';

interface OrchestratorProps {
  onNavigate: (view: 'timeline' | 'dashboard' | 'repo' | 'diff' | 'assets' | 'settings' | 'create-repo') => void;
  onSelectRepo?: (repo: RepoData) => void;
}

const Orchestrator: React.FC<OrchestratorProps> = ({ onNavigate, onSelectRepo }) => {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Repo Selection State
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const [repos, setRepos] = useState<RepoData[]>([]);

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const data = await db.getAllRepos();
        setRepos(data);
        if (data.length > 0 && !selectedRepo) {
          // Optionally select the first one, or leave as null
        }
      } catch (error) {
        console.error("Failed to load repos:", error);
      }
    };
    loadRepos();
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setFeedback(null);

    try {
      const response = await interpretAgentCommand(prompt);
      setFeedback(response);
      setTimeout(() => {
        onNavigate('timeline');
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Navigation Header */}
      <TopNavigation onNavigate={onNavigate} />

      {/* Main Scrollable Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Orchestrator</h1>
            <p className="text-slate-500 dark:text-gray-400">Manage your asynchronous video agents via natural language.</p>
          </div>

          {/* Command Input */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-emerald-600/30 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex gap-4">
                <span className="pt-2 text-primary font-mono text-lg select-none font-bold">&gt;</span>
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl font-display text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-gray-600 resize-none h-24 p-1 leading-relaxed caret-primary font-medium outline-none"
                  placeholder="Example: Auto-edit the highlights from yesterday's raw footage and apply the 'Cinematic' LUT..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {feedback && (
                <div className="ml-8 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary font-mono mb-2 animate-pulse">
                  AI Response: {feedback}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 gap-4 sm:gap-0">
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors">
                    <span className="material-icons-outlined text-sm text-primary">model_training</span>
                    <span>Model: GPT-4o-Video</span>
                  </button>

                  {/* Repo Selection Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <span className="material-icons-outlined text-sm text-primary">folder_open</span>
                      <span>{selectedRepo || "Select Repo"}</span>
                      <span className="material-icons-outlined text-[10px] ml-1 opacity-60">expand_more</span>
                    </button>
                    {isRepoDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                        {repos.length === 0 && (
                          <div className="px-4 py-2 text-xs text-slate-400 italic">No repositories found</div>
                        )}
                        {repos.map(repo => (
                          <button
                            key={repo.id}
                            onClick={() => {
                              setSelectedRepo(repo.name);
                              setIsRepoDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary transition-colors font-mono flex items-center gap-2 ${selectedRepo === repo.name ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-gray-300'}`}
                          >
                            <span className={`material-icons-outlined text-[10px] ${selectedRepo === repo.name ? 'opacity-100' : 'opacity-0'}`}>check</span>
                            {repo.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className={`bg-primary hover:bg-primary_hover text-white p-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  <span className={`material-icons-outlined ${isProcessing ? 'animate-spin' : ''}`}>
                    {isProcessing ? 'sync' : 'arrow_upward'}
                  </span>
                </button>
              </div>
            </div>
          </div>


          {/* Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-slate-800 dark:text-white">Suggestions</h2>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">AI-POWERED</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Generate highlights from raw footage",
                "Add subtitles to all clips",
                "Apply color grading LUT",
                "Detect and cut silence",
                "Create social media cuts",
                "Sync audio tracks"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(suggestion)}
                  className="px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-gray-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group flex items-center gap-2"
                >
                  <span className="material-icons-outlined text-sm text-slate-400 group-hover:text-primary transition-colors">auto_awesome</span>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>


          {/* Recent Repositories */}
          {repos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-display font-bold text-slate-800 dark:text-white">Recent Repositories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {repos.slice(0, 6).map(repo => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepo(repo.name);
                      if (onSelectRepo) {
                        onSelectRepo(repo);
                      }
                    }}
                    className={`bg-white dark:bg-white/5 border rounded-lg p-4 text-left hover:border-primary/50 transition-all flex items-center gap-3 ${selectedRepo === repo.name ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-white/10'}`}
                  >
                    <span className="material-icons-outlined text-emerald-400">folder</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-bold text-slate-800 dark:text-white truncate">{repo.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">
                        {new Date(repo.created).toLocaleDateString()}
                      </div>
                    </div>
                    {selectedRepo === repo.name && (
                      <span className="material-icons-outlined text-primary text-sm">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Orchestrator;