import React, { useState, useEffect } from 'react';

interface ActivityLogsViewProps {
    repoData: any;
    onNavigate?: (view: string) => void;
    onSelectCommit?: (commit: any) => void;
}

interface CommitEntry {
    id: string;
    message: string;
    author: string;
    timestamp: string | number;
    hashtags?: string[];
    parent?: string | null;
    branch?: string;
    artifacts?: Record<string, any>;
}

const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ repoData, onNavigate, onSelectCommit }) => {
    const [commits, setCommits] = useState<CommitEntry[]>([]);
    const [filteredCommits, setFilteredCommits] = useState<CommitEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('all');

    // Extract all commits from repository file system
    useEffect(() => {
        if (repoData?.fileSystem) {
            const commitsFolder = repoData.fileSystem.find((node: any) => node.name === 'commits');
            if (commitsFolder?.children) {
                const extractedCommits: CommitEntry[] = commitsFolder.children
                    .map((commitFile: any) => {
                        if (commitFile.type === 'file' && commitFile.content) {
                            try {
                                const commitData = JSON.parse(commitFile.content);
                                return {
                                    id: commitData.id || commitFile.name.replace('.json', ''),
                                    message: commitData.message || 'Repository update',
                                    author: commitData.author || 'Trem-AI',
                                    timestamp: commitData.timestamp || Date.now(),
                                    hashtags: commitData.hashtags || [],
                                    parent: commitData.parent,
                                    branch: commitData.branch || 'main',
                                    artifacts: commitData.artifacts || {}
                                };
                            } catch (e) {
                                return null;
                            }
                        }
                        return null;
                    })
                    .filter((entry): entry is CommitEntry => entry !== null)
                    .sort((a, b) => {
                        const aTime = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
                        const bTime = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
                        return bTime - aTime; // Most recent first
                    });

                setCommits(extractedCommits);
                setFilteredCommits(extractedCommits);
            }
        }
    }, [repoData]);

    // Filter commits based on search, author, and date range
    useEffect(() => {
        let filtered = [...commits];

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(commit =>
                commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                commit.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Author filter
        if (selectedAuthor !== 'all') {
            filtered = filtered.filter(commit => commit.author === selectedAuthor);
        }

        // Date range filter
        if (selectedDateRange !== 'all') {
            const now = Date.now();
            const ranges: Record<string, number> = {
                'today': 86400000,      // 24 hours
                'week': 604800000,      // 7 days
                'month': 2592000000,    // 30 days
            };

            const rangeMs = ranges[selectedDateRange];
            if (rangeMs) {
                filtered = filtered.filter(commit => {
                    const commitTime = typeof commit.timestamp === 'number'
                        ? commit.timestamp
                        : new Date(commit.timestamp).getTime();
                    return (now - commitTime) <= rangeMs;
                });
            }
        }

        setFilteredCommits(filtered);
    }, [searchQuery, selectedAuthor, selectedDateRange, commits]);

    const formatTimestamp = (ts: string | number) => {
        const date = new Date(ts);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (ts: string | number) => {
        const now = Date.now();
        const then = typeof ts === 'number' ? ts : new Date(ts).getTime();
        const diff = Math.floor((now - then) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const uniqueAuthors = Array.from(new Set(commits.map(c => c.author)));

    return (
        <div className="h-full flex flex-col bg-surface-light dark:bg-surface-dark p-8">

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => onNavigate?.(`repo/${repoData?.id}`)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <span className="material-icons-outlined text-slate-400">arrow_back</span>
                    </button>
                    <span className="material-icons-outlined text-primary text-3xl">history</span>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                        Activity Logs
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 ml-14">
                    Complete commit history for <span className="text-primary font-mono">{repoData?.name || 'repository'}</span>
                </p>
            </div>

            {/* Filters */}
            <div className="glass-panel rounded-xl p-6 mb-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search commits or hashtags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    {/* Author Filter */}
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            person
                        </span>
                        <select
                            value={selectedAuthor}
                            onChange={(e) => setSelectedAuthor(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">All Authors</option>
                            {uniqueAuthors.map(author => (
                                <option key={author} value={author}>{author}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            calendar_today
                        </span>
                        <select
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Past Week</option>
                            <option value="month">Past Month</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {(searchQuery || selectedAuthor !== 'all' || selectedDateRange !== 'all') && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400">Active filters:</span>
                        {searchQuery && (
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                                Search: "{searchQuery}"
                            </span>
                        )}
                        {selectedAuthor !== 'all' && (
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                                Author: {selectedAuthor}
                            </span>
                        )}
                        {selectedDateRange !== 'all' && (
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                                {selectedDateRange === 'today' ? 'Today' : selectedDateRange === 'week' ? 'Past Week' : 'Past Month'}
                            </span>
                        )}
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedAuthor('all');
                                setSelectedDateRange('all');
                            }}
                            className="ml-2 text-xs text-slate-400 hover:text-primary transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    Showing <span className="text-white font-bold">{filteredCommits.length}</span> of{' '}
                    <span className="text-white font-bold">{commits.length}</span> commits
                </p>
            </div>

            {/* Commits List */}
            <div className="flex-1 overflow-y-auto space-y-4">
                {filteredCommits.length === 0 ? (
                    <div className="glass-panel rounded-xl p-12 border border-white/10 text-center">
                        <span className="material-icons-outlined text-6xl text-slate-600 mb-4">inbox</span>
                        <p className="text-slate-400">No commits found matching your filters</p>
                    </div>
                ) : (
                    filteredCommits.map((commit, idx) => (
                        <div
                            key={commit.id}
                            onClick={() => onSelectCommit?.(commit)}
                            className="glass-panel rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-icons-outlined text-primary">auto_awesome</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors">
                                            {commit.message}
                                        </h3>
                                        <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                                            {getRelativeTime(commit.timestamp)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-outlined text-xs">person</span>
                                            {commit.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-outlined text-xs">commit</span>
                                            <span className="font-mono">{commit.id}</span>
                                        </span>
                                        {commit.branch && (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs">
                                                {commit.branch}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-outlined text-xs">schedule</span>
                                            {formatTimestamp(commit.timestamp)}
                                        </span>
                                    </div>

                                    {/* Hashtags */}
                                    {commit.hashtags && commit.hashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {commit.hashtags.map((tag, tagIdx) => (
                                                <span
                                                    key={tagIdx}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs border border-primary/20"
                                                >
                                                    <span className="material-icons-outlined text-xs">tag</span>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityLogsView;
