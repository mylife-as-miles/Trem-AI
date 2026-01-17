import React, { useState } from 'react';
import { interpretAgentCommand } from '../services/geminiService';

const Orchestrator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setFeedback(null);
    
    try {
        const response = await interpretAgentCommand(prompt);
        setFeedback(response);
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
    <div className="space-y-8 md:space-y-12">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Orchestrate</h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-gray-400">Manage your asynchronous video agents via natural language.</p>
      </div>
      
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-xl dark:shadow-glow-box flex flex-col gap-4">
          <div className="flex gap-2 md:gap-4">
            <span className="pt-2 text-primary font-mono text-lg select-none font-bold">&gt;</span>
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-base md:text-xl font-display text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-gray-600 resize-none h-24 p-1 leading-relaxed caret-primary font-medium outline-none" 
              placeholder="Example: Auto-edit the highlights from yesterday's raw footage..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          {feedback && (
             <div className="ml-6 md:ml-8 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary font-mono mb-2 animate-pulse">
                AI Response: {feedback}
             </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 gap-4 sm:gap-0">
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-400 hover:border-primary/50 hover:text-white transition-colors">
                <span className="material-icons-outlined text-sm text-primary">model_training</span>
                <span className="truncate">Model: GPT-4o-Video</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-400 hover:border-primary/50 hover:text-white transition-colors">
                <span className="material-icons-outlined text-sm text-primary">speed</span>
                <span>Latency: Async</span>
              </button>
            </div>
            <button 
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`w-full sm:w-auto bg-primary hover:bg-primary_hover text-white p-2 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}>
              <span className={`material-icons-outlined ${isProcessing ? 'animate-spin' : ''}`}>
                  {isProcessing ? 'sync' : 'arrow_upward'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orchestrator;