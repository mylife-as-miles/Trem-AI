import React, { useState, useEffect } from 'react';
import { interpretAgentCommand } from '../services/geminiService';
import TopNavigation from './TopNavigation';
import { db, RepoData } from '../utils/db';

interface TremCreateProps {
    onNavigate: (view: 'timeline' | 'dashboard' | 'repo' | 'diff' | 'assets' | 'settings' | 'create-repo') => void;
    onSelectRepo?: (repo: RepoData) => void;
}

const SUGGESTIONS = [
    "Create a 30s product launch video for a new energy drink",
    "Generate a motion graphics intro with the brand logo",
    "Produce a parametrized social media ad set for A/B testing",
    "Make a kinetic typography explainer video",
    "Create a 15s teaser for an upcoming event",
    "Generate a software demo walkthrough with voiceover"
];

const MODES = ["Concept Generation", "Storyboard", "Render"];

const TremCreate: React.FC<TremCreateProps> = ({ onNavigate, onSelectRepo }) => {
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    // Typewriter State
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Repo Selection State
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
    const [repos, setRepos] = useState<RepoData[]>([]);

    // Mode Selection State
    const [selectedMode, setSelectedMode] = useState<string>("Concept Generation");
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

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

    // Typewriter Effect
    useEffect(() => {
        const currentText = SUGGESTIONS[suggestionIndex];
        let timer: NodeJS.Timeout;

        if (isPaused) {
            timer = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, 2000);
            return () => clearTimeout(timer);
        }

        if (isDeleting) {
            if (charIndex > 0) {
                timer = setTimeout(() => {
                    setCharIndex((prev) => prev - 1);
                }, 30);
            } else {
                setIsDeleting(false);
                setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
            }
        } else {
            if (charIndex < currentText.length) {
                timer = setTimeout(() => {
                    setCharIndex((prev) => prev + 1);
                }, 50);
            } else {
                setIsPaused(true);
            }
        }

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, isPaused, suggestionIndex]);

    const displayedPlaceholder = "Example: " + SUGGESTIONS[suggestionIndex].substring(0, charIndex);


    const handleSubmit = async () => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        setFeedback(null);

        try {
            // Here we would ideally call a specific service for "Creating" vs "Editing"
            // For now using the same service but we might want to differentiate later
            const response = await interpretAgentCommand("CREATE_MODE: " + prompt);
            setFeedback(response);
            setTimeout(() => {
                // Navigate to a relevant view, maybe still timeline or a specific 'render' view
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
            <TopNavigation onNavigate={onNavigate} activeTab="create" />

            {/* Main Scrollable Content */}
            <div className="flex-1 p-6 md:p-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Page Title */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Meet Trem Create: your autonomous video creator</h1>
                        <p className="text-slate-500 dark:text-gray-400">Trem Create works asynchronously to generate video content from scratch. Perfect for product launches, motion graphics, and parametrized content scaling. Describe your vision, and Trem Create builds it.</p>
                    </div>

                    {/* Command Input */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-rose-600/30 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                            <div className="flex gap-4">
                                <span className="pt-2 text-purple-500 font-mono text-lg select-none font-bold">&gt;</span>
                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl font-display text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-gray-600 resize-none h-24 p-1 leading-relaxed caret-purple-500 font-medium outline-none"
                                    placeholder={displayedPlaceholder}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            {feedback && (
                                <div className="ml-8 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-500 font-mono mb-2 animate-pulse">
                                    AI Response: {feedback}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 gap-4 sm:gap-0">
                                <div className="flex flex-wrap gap-2">


                                    {/* Repo Selection Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-400 hover:border-purple-500/50 hover:text-purple-500 transition-colors"
                                        >
                                            <span className="material-icons-outlined text-sm text-purple-500">folder_open</span>
                                            <span>{selectedRepo || "Select Project"}</span>
                                            <span className="material-icons-outlined text-[10px] ml-1 opacity-60">expand_more</span>
                                        </button>
                                        {isRepoDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                                                {repos.length === 0 && (
                                                    <div className="px-4 py-2 text-xs text-slate-400 italic">No projects found</div>
                                                )}
                                                {repos.map(repo => (
                                                    <button
                                                        key={repo.id}
                                                        onClick={() => {
                                                            setSelectedRepo(repo.name);
                                                            setIsRepoDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-white/5 hover:text-purple-500 transition-colors font-mono flex items-center gap-2 ${selectedRepo === repo.name ? 'text-purple-500 bg-purple-500/5' : 'text-slate-600 dark:text-gray-300'}`}
                                                    >
                                                        <span className={`material-icons-outlined text-[10px] ${selectedRepo === repo.name ? 'opacity-100' : 'opacity-0'}`}>check</span>
                                                        {repo.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Mode Selection Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-400 hover:border-purple-500/50 hover:text-purple-500 transition-colors"
                                        >
                                            <span className="material-icons-outlined text-sm text-purple-500">layers</span>
                                            <span>{selectedMode}</span>
                                            <span className="material-icons-outlined text-[10px] ml-1 opacity-60">expand_more</span>
                                        </button>
                                        {isModeDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                                                {MODES.map(mode => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => {
                                                            setSelectedMode(mode);
                                                            setIsModeDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-white/5 hover:text-purple-500 transition-colors font-mono flex items-center gap-2 ${selectedMode === mode ? 'text-purple-500 bg-purple-500/5' : 'text-slate-600 dark:text-gray-300'}`}
                                                    >
                                                        <span className={`material-icons-outlined text-[10px] ${selectedMode === mode ? 'opacity-100' : 'opacity-0'}`}>check</span>
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className={`bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    <span className={`material-icons-outlined ${isProcessing ? 'animate-spin' : ''}`}>
                                        {isProcessing ? 'sync' : 'auto_fix_high'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Suggestions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-display font-bold text-slate-800 dark:text-white">Templates & Ideas</h2>
                            <span className="text-[10px] font-mono text-purple-500 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">GENERATIVE</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTIONS.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPrompt(suggestion)}
                                    className="px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-gray-300 hover:border-purple-500/50 hover:text-purple-500 hover:bg-purple-500/5 transition-all group flex items-center gap-2"
                                >
                                    <span className="material-icons-outlined text-sm text-slate-400 group-hover:text-purple-500 transition-colors">lightbulb</span>
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Recent Repositories */}
                    {repos.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-display font-bold text-slate-800 dark:text-white">Recent Projects</h2>
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
                                        className={`bg-white dark:bg-white/5 border rounded-lg p-4 text-left hover:border-purple-500/50 transition-all flex items-center gap-3 ${selectedRepo === repo.name ? 'border-purple-500 bg-purple-500/5' : 'border-slate-200 dark:border-white/10'}`}
                                    >
                                        <span className="material-icons-outlined text-purple-400">movie</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-mono text-sm font-bold text-slate-800 dark:text-white truncate">{repo.name}</div>
                                            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">
                                                {new Date(repo.created).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {selectedRepo === repo.name && (
                                            <span className="material-icons-outlined text-purple-500 text-sm">check_circle</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-12 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/20 text-center">
                    <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono mb-1">Generative Video Engine</h4>
                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
                        Trem Create uses advanced generative models. Results may vary based on complexity.
                    </p>
                </div>
                <div className="h-20"></div>
            </div>
        </div>
    );
};

export default TremCreate;
