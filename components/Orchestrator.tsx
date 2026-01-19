import React, { useState } from 'react';
import { interpretAgentCommand } from '../services/geminiService';

interface OrchestratorProps {
  onNavigate: (view: 'timeline' | 'dashboard' | 'repo' | 'diff' | 'assets') => void;
}

const Orchestrator: React.FC<OrchestratorProps> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Repo Selection State
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);

  const repos = [
    "client/nike-commercial",
    "internal/podcast-ep-42",
    "events/techcrunch-2023",
    "archive/legacy-b-roll"
  ];

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
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10 bg-background-light/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-white/5 text-xs font-mono text-slate-600 dark:text-gray-300 border border-slate-300 dark:border-white/10 flex items-center gap-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            trem-video-pipeline / production
            <span className="material-icons-outlined text-[10px]">expand_more</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2">
            <img alt="User" className="w-8 h-8 rounded-full border-2 border-background-light dark:border-black" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfOTDE_X3JwToSHTjUFVUtEmOhsNZj6RL934lNVNkkJ_7-dUJZEIfrP-BB4R4yKz6DimrwF9peEsyj_o_qTyGoJMJOIY6497yHymfN_9F7STpDS1WU4VhqLtB4lv5rUS9pq_am9pw4b9Oa84Xtx6eWZ8hdpz0VKq6xB3s-x830O9tK35zH4IDI59VYtVh53_FTHTGcjhnrq1u24Z-SHawNiXKPLY7e3aK6NGBtwHSbiXSaWb5DZhnQiVdO59VHXuxa09qplRDAhcE" />
            <div className="w-8 h-8 rounded-full border-2 border-background-light dark:border-black bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-slate-500 dark:text-white">+2</div>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-white/10 mx-2"></div>
          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-icons-outlined">settings</span>
          </button>
          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-icons-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Orchestrate</h1>
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
                        {repos.map(repo => (
                          <button
                            key={repo}
                            onClick={() => {
                              setSelectedRepo(repo);
                              setIsRepoDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary transition-colors font-mono flex items-center gap-2 ${selectedRepo === repo ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-gray-300'}`}
                          >
                            <span className={`material-icons-outlined text-[10px] ${selectedRepo === repo ? 'opacity-100' : 'opacity-0'}`}>check</span>
                            {repo}
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

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CPU Ingest Card */}
            <div className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary/40 transition-colors">
              <div className="absolute right-0 top-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-icons-outlined text-4xl text-primary">memory</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">cpu_ingest</span>
              </div>
              <div>
                <div className="text-2xl font-mono text-slate-800 dark:text-white font-bold">84<span className="text-sm text-slate-500 dark:text-gray-500 font-normal">%</span></div>
                <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono">Process: FFMPEG_TRANSCODE</div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50"></div>
            </div>

            {/* GPU Edit Cluster Card */}
            <div className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-emerald-400/40 transition-colors">
              <div className="absolute right-0 top-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-icons-outlined text-4xl text-emerald-400">smart_toy</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">gpu_edit_cluster</span>
              </div>
              <div>
                <div className="text-2xl font-mono text-slate-800 dark:text-white font-bold">92<span className="text-sm text-slate-500 dark:text-gray-500 font-normal">%</span></div>
                <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono">Job: SCENE_DETECT_V3</div>
              </div>
              <div className="absolute bottom-0 left-0 w-3/4 h-1 bg-gradient-to-r from-emerald-400 to-transparent opacity-50"></div>
            </div>

            {/* CDN Uplink Card */}
            <div className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-icons-outlined text-4xl text-slate-500">cloud_upload</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-slate-500 dark:bg-gray-600"></div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold">cdn_uplink</span>
              </div>
              <div>
                <div className="text-2xl font-mono text-slate-800 dark:text-gray-300 font-normal">IDLE</div>
                <div className="text-xs text-slate-500 dark:text-gray-500 mt-1 font-mono">Waiting for queue...</div>
              </div>
            </div>
          </div>

          {/* Agent Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-slate-800 dark:text-white">Agent Tasks</h2>
              <button className="text-xs text-primary font-mono hover:text-primary_hover transition-colors hover:underline">VIEW ALL LOGS</button>
            </div>
            <div className="space-y-3">
              {/* Processing Task */}
              <div className="glass-panel rounded-lg p-4 flex items-center justify-between group hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded bg-primary/10 text-primary border border-primary/20">
                    <span className="material-icons-outlined">auto_fix_high</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">Highlight Extraction</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 font-mono mt-0.5">repo: interview-series-b • 12m ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end w-32">
                    <div className="text-[10px] font-mono text-primary mb-1 animate-pulse">PROCESSING</div>
                    <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-2/3 rounded-full"></div>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
                    <span className="material-icons-outlined">more_horiz</span>
                  </button>
                </div>
              </div>

              {/* Completed Task */}
              <div className="glass-panel rounded-lg p-4 flex items-center justify-between group hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="material-icons-outlined">subtitles</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">Subtitle Generation (En)</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 font-mono mt-0.5">repo: campaign-q1-raw • 45m ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-mono tracking-wide">
                    COMPLETED
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
                    <span className="material-icons-outlined">download</span>
                  </button>
                </div>
              </div>

              {/* Failed Task */}
              <div className="glass-panel rounded-lg p-4 flex items-center justify-between group hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    <span className="material-icons-outlined">warning_amber</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">Metadata Analysis Error</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 font-mono mt-0.5">repo: test-footage-alpha • 2h ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono tracking-wide">
                    FAILED
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
                    <span className="material-icons-outlined">restart_alt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Orchestrator;