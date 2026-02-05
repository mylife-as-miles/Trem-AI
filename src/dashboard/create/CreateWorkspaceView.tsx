import React, { useState, useEffect, useRef } from 'react';
import { generateRemotionProject } from '../../services/gemini/create/index';
// Note: TopNavigation is now handled in the parent container
import { db, RepoData, AssetData } from '../../utils/db';
import AssetLibrary from '../assets/AssetLibraryPage';

interface CreateWorkspaceViewProps {
    onNavigate: (view: 'timeline' | 'dashboard' | 'repo' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'trem-create' | 'trem-edit') => void;
    onSelectRepo?: (repo: RepoData) => void;
    initialPrompt?: string;
    templateMode?: string;
    onBack?: () => void;
}

const SUGGESTIONS = [
    "Create a 30s product launch video for a new energy drink",
    "Generate a motion graphics intro with the brand logo",
    "Produce a parametrized social media ad set for A/B testing",
    "Make a kinetic typography explainer video",
    "Create a 15s teaser for an upcoming event",
    "Generate a software demo walkthrough with voiceover"
];

interface AgentOption {
    id: string;
    label: string;
    category: 'Persona' | 'Model' | 'Workflow';
    icon: string;
    description: string;
}

const AGENT_OPTIONS: AgentOption[] = [
    { id: 'creative-director', label: 'Creative Director', category: 'Persona', icon: 'auto_fix_high', description: 'Focuses on aesthetics, pacing, and brand alignment.' },
    { id: 'technical-editor', label: 'Technical Editor', category: 'Persona', icon: 'build', description: 'Optimizes for code quality, Remotion best practices, and performance.' },
    { id: 'social-manager', label: 'Social Media Manager', category: 'Persona', icon: 'share', description: 'Optimizes for engagement, vertical formats, and trends.' },
    { id: 'model-pro', label: 'Gemini 1.5 Pro', category: 'Model', icon: 'psychology', description: 'Highest fidelity reasoning for complex logic.' },
    { id: 'model-flash', label: 'Gemini Flash', category: 'Model', icon: 'bolt', description: 'Fastest generation speed for rapid prototyping.' },
    { id: 'workflow-remotion', label: 'Remotion Standard', category: 'Workflow', icon: 'movie', description: 'Standard 2D video composition workflow.' },
    { id: 'workflow-r3f', label: 'React Three Fiber', category: 'Workflow', icon: '3d_rotation', description: 'Advanced 3D scenes and WebGL integration.' },
    { id: 'workflow-experimental', label: 'Experimental Motion', category: 'Workflow', icon: 'science', description: 'Cutting-edge animation techniques (Beta).' },
];

const CreateWorkspaceView: React.FC<CreateWorkspaceViewProps> = ({ onNavigate, onSelectRepo, initialPrompt = "", templateMode, onBack }) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    // Typewriter State
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Asset Library Modal State
    const [showAssetLibrary, setShowAssetLibrary] = useState(false);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

    // Agent Settings State
    const [selectedAgentId, setSelectedAgentId] = useState<string>("creative-director");
    const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
    const [agentSearch, setAgentSearch] = useState("");
    const agentDropdownRef = useRef<HTMLDivElement>(null);

    // Repos (Still needed for "Recent Projects" list, but not the dropdown)
    const [repos, setRepos] = useState<RepoData[]>([]);

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
            if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
                setIsAgentDropdownOpen(false);
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

        try {
            // 1. Generate Files
            const generatedFiles = await generateRemotionProject(prompt);
            setFeedback("Project structure generated successfully.");

            // 2. Resolve Assets
            const resolvedAssets: AssetData[] = [];
            if (selectedAssetIds.length > 0) {
                const assets = await Promise.all(selectedAssetIds.map(id => db.getAsset(id)));
                assets.forEach(a => {
                    if (a) resolvedAssets.push(a);
                });
            }

            // 3. Create Repo in DB
            const newRepo: Omit<RepoData, 'id'> = {
                name: prompt.length > 40 ? prompt.substring(0, 40) + "..." : prompt,
                brief: prompt,
                assets: resolvedAssets,
                fileSystem: Object.entries(generatedFiles).map(([path, content]) => ({ path, content })),
                created: Date.now()
            };

            const newRepoId = await db.addRepo(newRepo);

            // 4. Select Repo & Navigate
            if (onSelectRepo) {
                onSelectRepo({ ...newRepo, id: newRepoId });
                // Navigation happens in onSelectRepo or implicit view switch
            } else {
                // Fallback if no select handler
                onNavigate('repo');
            }

        } catch (e) {
            console.error(e);
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

    const filteredAgents = AGENT_OPTIONS.filter(agent =>
        agent.label.toLowerCase().includes(agentSearch.toLowerCase()) ||
        agent.description.toLowerCase().includes(agentSearch.toLowerCase())
    );

    const activeAgent = AGENT_OPTIONS.find(a => a.id === selectedAgentId) || AGENT_OPTIONS[0];

    // Grouping for display
    const groupedAgents = filteredAgents.reduce((acc, agent) => {
        if (!acc[agent.category]) acc[agent.category] = [];
        acc[agent.category].push(agent);
        return acc;
    }, {} as Record<string, AgentOption[]>);


    return (
        <div className="flex flex-col min-h-full relative fade-in">
            <div className="max-w-4xl mx-auto space-y-12 w-full">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-gray-400"
                        >
                            <span className="material-icons-outlined">arrow_back</span>
                        </button>
                    )}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                            {templateMode ? `Create: ${templateMode}` : "Autonomous Video Creator"}
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400">
                            Describe your vision, and Trem Create builds it.
                        </p>
                    </div>
                </div>

                {/* Command Input */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-rose-600/30 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">

                        {/* Combined Input Container */}
                        <div className="flex gap-4">
                            <span className="pt-2 text-purple-500 font-mono text-lg select-none font-bold">&gt;</span>

                            <div className="flex-1 flex flex-col gap-3">
                                {/* Selected Assets as Thumbnails inside input flow */}
                                {selectedAssetIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAssetIds.map(id => (
                                            <div key={id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 text-xs font-medium text-purple-700 dark:text-purple-300 animate-in fade-in zoom-in-95 duration-200">
                                                <span className="material-icons-outlined text-[10px]">movie</span>
                                                <span>Asset {id.slice(0, 4)}...</span>
                                                <button
                                                    onClick={() => setSelectedAssetIds(prev => prev.filter(p => p !== id))}
                                                    className="hover:text-purple-900 dark:hover:text-white p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="material-icons-outlined text-[10px] block">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl font-display text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-gray-600 resize-none h-24 p-0 leading-relaxed caret-purple-500 font-medium outline-none"
                                    placeholder={displayedPlaceholder}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        </div>

                        {feedback && (
                            <div className="ml-8 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-500 font-mono mb-2">
                                <span className="font-bold mr-2">Status:</span> {feedback}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 gap-4 sm:gap-0">
                            <div className="flex flex-wrap gap-3">

                                {/* Add Asset Library Button (Simple Modal Trigger) */}
                                <button
                                    onClick={() => setShowAssetLibrary(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shadow-sm text-sm font-medium"
                                >
                                    <span className="material-icons-outlined text-lg">video_library</span>
                                    <span>Add Asset Library</span>
                                    {selectedAssetIds.length > 0 && (
                                        <span className="bg-purple-500 text-white text-[10px] px-1.5 rounded-full">{selectedAssetIds.length}</span>
                                    )}
                                </button>

                                {/* Agent Settings (Advanced Dropdown) */}
                                <div className="relative" ref={agentDropdownRef}>
                                    <button
                                        onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200 shadow-sm ${isAgentDropdownOpen
                                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400'
                                            }`}
                                    >
                                        <span className={`material-icons-outlined text-lg ${isAgentDropdownOpen ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                                            {activeAgent.icon}
                                        </span>
                                        <span className="font-medium">{activeAgent.label}</span>
                                        <span className={`material-icons-outlined text-sm transition-transform duration-200 ${isAgentDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>

                                    {isAgentDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 flex flex-col origin-top-left animate-in fade-in zoom-in-95 duration-100">
                                            <div className="p-3 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 material-icons-outlined text-slate-400 text-sm">search</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Search agents & models..."
                                                        className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-700 dark:text-gray-200 placeholder-slate-400"
                                                        value={agentSearch}
                                                        onChange={(e) => setAgentSearch(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-80 overflow-y-auto p-1 custom-scrollbar">
                                                {Object.keys(groupedAgents).length === 0 ? (
                                                    <div className="px-4 py-8 text-center">
                                                        <p className="text-xs text-slate-500 dark:text-gray-500">No agents found</p>
                                                    </div>
                                                ) : (
                                                    Object.entries(groupedAgents).map(([category, agents]) => (
                                                        <div key={category} className="mb-2 last:mb-0">
                                                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10">{category}</div>
                                                            {agents.map(agent => (
                                                                <button
                                                                    key={agent.id}
                                                                    onClick={() => {
                                                                        setSelectedAgentId(agent.id);
                                                                        setIsAgentDropdownOpen(false);
                                                                        setAgentSearch("");
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-start gap-3 group ${selectedAgentId === agent.id
                                                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'
                                                                        }`}
                                                                >
                                                                    <div className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${selectedAgentId === agent.id
                                                                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300'
                                                                        : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 group-hover:bg-white group-hover:shadow-sm dark:group-hover:bg-white/10'
                                                                        }`}>
                                                                        <span className="material-icons-outlined text-base">{agent.icon}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium">{agent.label}</div>
                                                                        <div className="text-[10px] opacity-70 leading-snug mt-0.5">
                                                                            {agent.description}
                                                                        </div>
                                                                    </div>
                                                                    {selectedAgentId === agent.id && (
                                                                        <span className="material-icons-outlined text-purple-500 text-sm mt-1">check_circle</span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))
                                                )}
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
            </div>

            {/* Asset Library Modal Overlay */}
            {showAssetLibrary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <AssetLibrary
                        isModal
                        onClose={() => setShowAssetLibrary(false)}
                        onSelect={(assets) => {
                            setSelectedAssetIds(prev => [...new Set([...prev, ...assets])]);
                            setShowAssetLibrary(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default CreateWorkspaceView;
