import React, { useState, useEffect, useRef } from 'react';
import { generateRemotionProject } from '../services/geminiService';
import TopNavigation from './TopNavigation';
import { db, RepoData } from '../utils/db';

interface TremCreateProps {
    onNavigate: (view: 'timeline' | 'dashboard' | 'repo' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'trem-create' | 'trem-edit') => void;
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

const MODES = ["Agent Settings", "Storyboard", "Render"];

const TremCreate: React.FC<TremCreateProps> = ({ onNavigate, onSelectRepo }) => {
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [generatedFiles, setGeneratedFiles] = useState<Record<string, string> | null>(null);

    // Typewriter State
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Repo Selection State
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
    const [repos, setRepos] = useState<RepoData[]>([]);
    const [repoSearch, setRepoSearch] = useState("");
    const repoDropdownRef = useRef<HTMLDivElement>(null);

    // Mode Selection State
    const [selectedMode, setSelectedMode] = useState<string>("Agent Settings");
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
    const modeDropdownRef = useRef<HTMLDivElement>(null);

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

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (repoDropdownRef.current && !repoDropdownRef.current.contains(event.target as Node)) {
                setIsRepoDropdownOpen(false);
            }
            if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
                setIsModeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
        setGeneratedFiles(null);

        try {
            const files = await generateRemotionProject(prompt);
            setGeneratedFiles(files);
            setFeedback("Project structure generated successfully.");
        } catch (e) {
            setFeedback("Error generating project. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    }

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(repoSearch.toLowerCase())
    );

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
                                <div className="ml-8 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-500 font-mono mb-2">
                                    <span className="font-bold mr-2">Status:</span> {feedback}
                                </div>
                            )}

                            {generatedFiles && (
                                <div className="ml-8 mt-2 space-y-2">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generated Files</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {Object.keys(generatedFiles).map(fileName => (
                                            <div key={fileName} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded p-3 text-sm font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <span className="material-icons-outlined text-xs text-purple-500">code</span>
                                                {fileName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 gap-4 sm:gap-0">
                                <div className="flex flex-wrap gap-3">


                                    {/* Advanced Asset Library (Repo) Selection Dropdown */}
                                    <div className="relative" ref={repoDropdownRef}>
                                        <button
                                            onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200 shadow-sm ${
                                                isRepoDropdownOpen
                                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400'
                                            }`}
                                        >
                                            <span className={`material-icons-outlined text-lg ${selectedRepo ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                                                {selectedRepo ? 'video_library' : 'add_circle'}
                                            </span>
                                            <span className="font-medium">{selectedRepo || "Add Asset Library"}</span>
                                            <span className={`material-icons-outlined text-sm transition-transform duration-200 ${isRepoDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                        </button>

                                        {isRepoDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 flex flex-col origin-top-left animate-in fade-in zoom-in-95 duration-100">
                                                <div className="p-3 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 material-icons-outlined text-slate-400 text-sm">search</span>
                                                        <input
                                                            type="text"
                                                            placeholder="Search libraries..."
                                                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-700 dark:text-gray-200 placeholder-slate-400"
                                                            value={repoSearch}
                                                            onChange={(e) => setRepoSearch(e.target.value)}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>

                                                <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                                    {filteredRepos.length === 0 ? (
                                                        <div className="px-4 py-8 text-center">
                                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 mb-2">
                                                                <span className="material-icons-outlined text-slate-400">inventory_2</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-gray-500">No libraries found</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Available Libraries</div>
                                                            {filteredRepos.map(repo => (
                                                                <button
                                                                    key={repo.id}
                                                                    onClick={() => {
                                                                        setSelectedRepo(repo.name);
                                                                        setIsRepoDropdownOpen(false);
                                                                        setRepoSearch("");
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 group ${
                                                                        selectedRepo === repo.name
                                                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                                                                        selectedRepo === repo.name
                                                                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300'
                                                                        : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 group-hover:bg-white group-hover:shadow-sm dark:group-hover:bg-white/10'
                                                                    }`}>
                                                                        <span className="material-icons-outlined text-lg">folder</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium truncate">{repo.name}</div>
                                                                        <div className="text-[10px] opacity-60 flex items-center gap-1">
                                                                            <span>{new Date(repo.created).toLocaleDateString()}</span>
                                                                            <span>•</span>
                                                                            <span>Video Project</span>
                                                                        </div>
                                                                    </div>
                                                                    {selectedRepo === repo.name && (
                                                                        <span className="material-icons-outlined text-purple-500 text-sm">check_circle</span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="p-2 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                                                    <button
                                                        onClick={() => onNavigate('create-repo')}
                                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-white/20 text-slate-500 dark:text-gray-400 hover:text-purple-600 hover:border-purple-300 dark:hover:text-purple-400 transition-colors text-xs font-medium"
                                                    >
                                                        <span className="material-icons-outlined text-sm">add</span>
                                                        Create New Library
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mode Selection Dropdown */}
                                    <div className="relative" ref={modeDropdownRef}>
                                        <button
                                            onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200 shadow-sm ${
                                                isModeDropdownOpen
                                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400'
                                            }`}
                                        >
                                            <span className={`material-icons-outlined text-lg ${selectedMode ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                                                {selectedMode === "Agent Settings" ? 'smart_toy' : 'layers'}
                                            </span>
                                            <span className="font-medium">{selectedMode}</span>
                                            <span className={`material-icons-outlined text-sm transition-transform duration-200 ${isModeDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                        </button>
                                        {isModeDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                                                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 bg-slate-50/50 dark:bg-white/5">Generation Mode</div>
                                                <div className="p-1">
                                                    {MODES.map(mode => (
                                                        <button
                                                            key={mode}
                                                            onClick={() => {
                                                                setSelectedMode(mode);
                                                                setIsModeDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 group ${
                                                                selectedMode === mode
                                                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                                                : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            <span className={`material-icons-outlined text-lg ${
                                                                selectedMode === mode ? 'text-purple-500' : 'text-slate-400 group-hover:text-purple-400'
                                                            }`}>
                                                                {mode === "Agent Settings" ? 'smart_toy' :
                                                                 mode === "Storyboard" ? 'auto_stories' : 'movie_filter'}
                                                            </span>
                                                            <span className="font-medium">{mode}</span>
                                                            {selectedMode === mode && (
                                                                <span className="material-icons-outlined text-purple-500 text-sm ml-auto">check</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className={`bg-purple-600 hover:bg-purple-700 text-white p-3 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg shadow-purple-600/20 ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    <span className="font-medium mr-2">{isProcessing ? 'Generating...' : 'Generate Video'}</span>
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
                                    className="px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-gray-300 hover:border-purple-500/50 hover:text-purple-500 hover:bg-purple-500/5 transition-all group flex items-center gap-2 shadow-sm"
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
                                        className={`bg-white dark:bg-white/5 border rounded-xl p-4 text-left hover:border-purple-500/50 transition-all flex items-center gap-3 shadow-sm hover:shadow-md ${selectedRepo === repo.name ? 'border-purple-500 bg-purple-500/5' : 'border-slate-200 dark:border-white/10'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRepo === repo.name ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                                            <span className="material-icons-outlined">movie</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-display text-sm font-bold text-slate-800 dark:text-white truncate">{repo.name}</div>
                                            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                                                <span className="material-icons-outlined text-[10px]">schedule</span>
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
                <div className="mt-12 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/20 text-center">
                    <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono mb-1 flex items-center justify-center gap-2">
                        <span className="material-icons-outlined text-sm">psychology</span>
                        Generative Video Engine
                    </h4>
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