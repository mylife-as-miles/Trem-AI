import React, { useState, useEffect } from 'react';

// --- Types ---
import TopNavigation from './TopNavigation';
import SimpleMarkdown from './SimpleMarkdown';
import CommitDetailsView from './CommitDetailsView';
import AlertDialog from './AlertDialog';
import { db } from '../utils/db';

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  locked?: boolean;
  icon?: string;
  iconColor?: string;
  content?: string;
}

import { RepoData } from '../utils/db';



export type { RepoData };

interface VideoRepoOverviewProps {
  repoData?: RepoData | null;
  onNavigate?: (view: string) => void;
}

// --- Mock Data ---
const defaultFileSystem: FileNode[] = [
  {
    id: 'media',
    name: 'media',
    type: 'folder',
    locked: true,
    children: [
      { id: 'raw_footage', name: 'raw_footage', type: 'folder', children: [] },
      { id: 'proxies', name: 'proxies', type: 'folder', children: [] },
    ]
  },
  {
    id: 'timelines',
    name: 'timelines',
    type: 'folder',
    children: [
      { id: 'main_cut_v2', name: 'Main_Cut_v2.xml', type: 'file', icon: 'movie_creation', iconColor: 'text-emerald-400' },
      { id: 'social_vertical', name: 'Social_Vertical.xml', type: 'file', icon: 'movie_creation', iconColor: 'text-emerald-400' }
    ]
  },
  {
    id: 'exports',
    name: 'exports',
    type: 'folder',
    children: [
      { id: 'instagram_story', name: 'Instagram_Story_v1.mp4', type: 'file', icon: 'movie', iconColor: 'text-green-400' },
      { id: 'broadcast_master', name: 'Broadcast_Master_ProRes.mov', type: 'file', icon: 'movie', iconColor: 'text-blue-400' }
    ]
  },
  {
    id: 'assets',
    name: 'assets',
    type: 'folder',
    children: [
      { id: 'fonts', name: 'fonts', type: 'folder', children: [] },
      { id: 'logos', name: 'logos', type: 'folder', children: [] }
    ]
  }
];

interface ActivityLogEntry {
  agent: string;
  message: string;
  timestamp: number;
}

const VideoRepoOverview: React.FC<VideoRepoOverviewProps> = ({ repoData, onNavigate }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['timelines', 'media']));
  const [selectedId, setSelectedId] = useState<string>('timelines');
  const [fileSystem, setFileSystem] = useState<FileNode[]>(defaultFileSystem);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [editedBrief, setEditedBrief] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Update filesystem to match the Repo data - checks for existing structure first
  useEffect(() => {
    if (repoData) {
      if (repoData.fileSystem) {
        setFileSystem(repoData.fileSystem);

        // Extract activity log from commits folder
        const commitsFolder = repoData.fileSystem.find((node: FileNode) => node.name === 'commits');
        if (commitsFolder && commitsFolder.children) {
          const activities: ActivityLogEntry[] = commitsFolder.children
            .map((commitFile: FileNode) => {
              if (commitFile.type === 'file' && commitFile.content) {
                try {
                  const commitData = JSON.parse(commitFile.content);
                  return {
                    agent: commitData.author || 'Trem-AI',
                    message: commitData.message || 'Repository update',
                    timestamp: commitData.timestamp || Date.now()
                  };
                } catch (e) {
                  return null;
                }
              }
              return null;
            })
            .filter((entry): entry is ActivityLogEntry => entry !== null)
            .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

          setActivityLog(activities);
        }
      } else {
        // Fallback to legacy format if fileSystem is missing
        const timelineFolderExists = defaultFileSystem.find(n => n.name === 'timelines');
        if (!timelineFolderExists) {
          const newFS = [
            {
              id: 'media',
              name: 'media',
              type: 'folder' as const,
              locked: true,
              children: [
                {
                  id: 'raw_footage',
                  name: 'raw_footage',
                  type: 'folder' as const,
                  children: repoData.assets?.map((a: any) => ({
                    id: a.id,
                    name: a.name || `${a.id}.mp4`,
                    type: 'file' as const,
                    icon: 'movie',
                    iconColor: 'text-blue-400'
                  })) || []
                },
                { id: 'proxies', name: 'proxies', type: 'folder' as const, children: [] }
              ]
            },
            ...defaultFileSystem.filter(n => n.name !== 'media')
          ];
          setFileSystem(newFS);
        }
      }
    }
  }, [repoData]);

  // Handler functions
  const handleEditBrief = () => {
    setEditedBrief(briefContent || '');
    setIsEditingBrief(true);
  };

  const handleSaveBrief = async () => {
    if (repoData?.id) {
      try {
        await db.updateRepo(repoData.id, { brief: editedBrief });
        // Force parent to reload repo data
        window.location.reload();
      } catch (error) {
        console.error('Failed to update brief:', error);
      }
    }
    setIsEditingBrief(false);
  };

  const handleDelete = async () => {
    if (repoData?.id) {
      try {
        await db.deleteRepo(repoData.id);
        // Navigate back to dashboard
        if (onNavigate) {
          onNavigate('dashboard');
        }
      } catch (error) {
        console.error('Failed to delete repository:', error);
      }
    }
    setShowDeleteDialog(false);
  };

  const handleCommitClick = (activityEntry: ActivityLogEntry) => {
    // Find the full commit data from the file system
    if (repoData?.fileSystem) {
      const commitsFolder = repoData.fileSystem.find((node: FileNode) => node.name === 'commits');
      if (commitsFolder && commitsFolder.children) {
        const commitFile = commitsFolder.children.find((file: FileNode) => {
          if (file.type === 'file' && file.content) {
            try {
              const data = JSON.parse(file.content);
              return data.timestamp === activityEntry.timestamp;
            } catch (e) {
              return false;
            }
          }
          return false;
        });

        if (commitFile && commitFile.content) {
          try {
            const fullCommitData = JSON.parse(commitFile.content);
            setSelectedCommit(fullCommitData);
          } catch (e) {
            console.error('Failed to parse commit data:', e);
          }
        }
      }
    }
  };

  const handleViewFullLogs = () => {
    // Navigate to activity logs page
    if (repoData?.id && onNavigate) {
      onNavigate(`repo/${repoData.id}/logs`);
    }
  };

  // Helper to find path to selected item for breadcrumbs
  const findPath = (nodes: FileNode[], targetId: string, currentPath: FileNode[] = []): FileNode[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return [...currentPath, node];
      }
      if (node.children) {
        const path = findPath(node.children, targetId, [...currentPath, node]);
        if (path) return path;
      }
    }
    return null;
  };

  const selectedPath = findPath(fileSystem, selectedId) || [];

  const toggleFolder = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const handleSelect = (id: string, type: 'folder' | 'file') => {
    setSelectedId(id);
    // Auto-expand folder on select if closed
    if (type === 'folder' && !expandedIds.has(id)) {
      const next = new Set(expandedIds);
      next.add(id);
      setExpandedIds(next);
    }
  };

  const renderTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedIds.has(node.id);
      const isSelected = selectedId === node.id;
      const isLocked = node.locked;
      const paddingLeft = `${level * 1.5 + 0.75}rem`;

      return (
        <div key={node.id}>
          <div
            className={`
              flex items-center justify-between py-2 pr-3 rounded-lg cursor-pointer text-sm font-mono transition-colors mb-1
              ${isSelected
                ? 'bg-primary/10 border border-primary/20 text-slate-900 dark:text-white'
                : 'border border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }
              ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            style={{ paddingLeft }}
            onClick={() => !isLocked && handleSelect(node.id, node.type)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {node.type === 'folder' && (
                <button
                  onClick={(e) => !isLocked && toggleFolder(e, node.id)}
                  className={`p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${isSelected ? 'text-primary' : ''}`}
                >
                  <span className="material-icons-outlined text-base block transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    chevron_right
                  </span>
                </button>
              )}
              {node.type === 'file' && <span className="w-5"></span>}

              <span className={`material-icons-outlined text-lg ${isSelected ? 'text-primary' : node.iconColor || (node.type === 'folder' ? 'text-slate-400' : 'text-slate-500')}`}>
                {node.icon || (node.type === 'folder' ? (isExpanded ? 'folder_open' : 'folder') : 'description')}
              </span>
              <span className="truncate">{node.name}</span>
            </div>
            {isLocked && <span className="material-icons-outlined text-xs">lock</span>}
          </div>

          {node.type === 'folder' && isExpanded && node.children && (
            <div className="overflow-hidden transition-all duration-300 ease-in-out">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const briefContent = React.useMemo(() => {
    if (!repoData?.fileSystem) return repoData?.brief;
    const descriptions = repoData.fileSystem.find(n => n.name === 'descriptions');
    const videoMd = descriptions?.children?.find(n => n.name === 'video.md');
    return videoMd?.content || repoData.brief;
  }, [repoData]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-black">
      <TopNavigation onNavigate={onNavigate} />
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">

            {/* Creative Brief Card */}
            <div className="lg:col-span-2 glass-panel rounded-xl p-8 flex flex-col relative overflow-hidden group min-h-[300px]">
              <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-20 pointer-events-none">
                <span className="material-icons-outlined text-9xl text-primary">description</span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-semibold">{repoData?.name ? `Brief: ${repoData.name}` : 'Creative Brief'}</h2>
                <div className="flex items-center gap-2">
                  {!isEditingBrief ? (
                    <>
                      <button
                        onClick={handleEditBrief}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-primary transition-colors"
                        title="Edit Brief"
                      >
                        <span className="material-icons-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Repository"
                      >
                        <span className="material-icons-outlined text-lg">delete</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveBrief}
                        className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary_hover text-white text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingBrief(false)}
                        className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col relative z-10 overflow-y-auto pr-2 custom-scrollbar">
                {isEditingBrief ? (
                  <textarea
                    className="flex-1 w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    value={editedBrief}
                    onChange={(e) => setEditedBrief(e.target.value)}
                    placeholder="Enter creative brief in markdown format..."
                  />
                ) : (
                  <SimpleMarkdown className="text-slate-900 dark:text-white leading-relaxed">
                    {briefContent || (
                      `# High-Energy 30s Spot

**Client:** Nike  
**Campaign:** Urban Flow Q3  
**Tone:** Energetic, Raw, Authentic

## Objectives
*   Highlight the **red shoes** in every scene.
*   Use the \`Urban_LUT_v2\` for color grading.
*   Sync cuts to the beat of *Tech_House_01.mp3*.

## Required Shots
1.  Close-up of laces tying
2.  Wide shot running through subway
3.  Slow-motion jump (120fps)

> "Motion is the key emotion here. Keep it moving." - *Creative Director*`
                    )}
                  </SimpleMarkdown>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {['#social-media', '#high-contrast', '#vertical'].map(tag => (
                  <div key={tag} className="px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* Repository Files */}
            <div className="glass-panel rounded-xl p-0 flex flex-col overflow-hidden min-h-[300px]">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Repository Files</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate && onNavigate('repo-files')}
                      className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                      title="Manage Files"
                    >
                      <span className="material-icons-outlined text-base">folder_special</span>
                    </button>
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-outlined text-base">create_new_folder</span></button>
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-outlined text-base">upload_file</span></button>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setSelectedId('root')}
                    className={`hover:text-white transition-colors flex-shrink-0 ${selectedPath.length === 0 ? 'text-primary font-bold' : 'text-slate-500'}`}
                  >
                    root
                  </button>
                  {selectedPath.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <span className="text-slate-600">/</span>
                      <button
                        onClick={() => handleSelect(node.id, node.type)}
                        className={`hover:text-white transition-colors whitespace-nowrap ${i === selectedPath.length - 1 ? 'text-primary font-bold' : 'text-slate-500'}`}
                      >
                        {node.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-2 overflow-y-auto">
                {renderTree(fileSystem)}
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-medium text-slate-900 dark:text-white">Latest Activity</h2>
              <button
                onClick={handleViewFullLogs}
                className="text-xs text-primary font-mono hover:text-primary_hover transition-colors"
              >
                VIEW FULL LOG
              </button>
            </div>
            <div className="glass-panel rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm font-mono min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-3 font-medium w-1/4">Agent / Worker</th>
                    <th className="px-6 py-3 font-medium w-1/2">Commit Message</th>
                    <th className="px-6 py-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  {activityLog.length > 0 ? (
                    activityLog.slice(0, 5).map((entry, idx) => {
                      const timeAgo = Math.floor((Date.now() - entry.timestamp) / 1000);
                      let timeStr = 'just now';
                      if (timeAgo < 60) timeStr = `${timeAgo}s ago`;
                      else if (timeAgo < 3600) timeStr = `${Math.floor(timeAgo / 60)}m ago`;
                      else if (timeAgo < 86400) timeStr = `${Math.floor(timeAgo / 3600)}h ago`;
                      else timeStr = `${Math.floor(timeAgo / 86400)}d ago`;

                      return (
                        <tr
                          key={idx}
                          onClick={() => {
                            // Find full commit data from fileSystem
                            const commitsFolder = repoData?.fileSystem?.find((n: FileNode) => n.name === 'commits');
                            const commitFile = commitsFolder?.children?.[idx];
                            if (commitFile?.content) {
                              try {
                                const commitData = JSON.parse(commitFile.content);
                                handleCommitClick(commitData);
                              } catch (e) {
                                console.error('Failed to parse commit', e);
                              }
                            }
                          }}
                          className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-4 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="text-primary font-bold">{entry.agent}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {entry.message}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-500">{timeStr}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 italic">
                        No activity yet. Commits will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Commit Details Modal */}
      {selectedCommit && (
        <CommitDetailsView
          commit={selectedCommit}
          repoName={repoData?.name}
          onClose={() => setSelectedCommit(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <AlertDialog
          isOpen={showDeleteDialog}
          title="Delete Repository?"
          description={`Are you sure you want to permanently delete "${repoData?.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
};

export default VideoRepoOverview;