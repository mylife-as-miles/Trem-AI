import React, { useState, useEffect } from 'react';

// --- Types ---
import TopNavigation from './TopNavigation';
import SimpleMarkdown from './SimpleMarkdown';

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  locked?: boolean;
  icon?: string;
  iconColor?: string;
}

import { RepoData } from '../utils/db';



export type { RepoData };

interface VideoRepoOverviewProps {
  repoData?: RepoData | null;
  onNavigate?: (view: 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'repo-files') => void;
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

const VideoRepoOverview: React.FC<VideoRepoOverviewProps> = ({ repoData, onNavigate }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['timelines', 'media']));
  const [selectedId, setSelectedId] = useState<string>('timelines');
  const [fileSystem, setFileSystem] = useState<FileNode[]>(defaultFileSystem);

  // Update filesystem to match the Repo data - checks for existing structure first
  useEffect(() => {
    if (repoData) {
      if (repoData.fileSystem) {
        setFileSystem(repoData.fileSystem);
      } else if (repoData.assets) {
        // Fallback for mock data without FS
        const repoName = repoData.name || 'new-repo';
        const newFS: FileNode[] = [
          { id: 'config', name: 'trem.json', type: 'file', icon: 'settings', iconColor: 'text-slate-400' },
          {
            id: 'media', name: 'media', type: 'folder', locked: true, children: [
              {
                id: 'raw_footage', name: 'raw_footage', type: 'folder', children: repoData.assets.map((asset: any) => ({
                  id: asset.id,
                  name: asset.name || asset.id,
                  type: 'file',
                  icon: 'movie',
                  iconColor: 'text-emerald-400'
                }))
              },
              { id: 'audio', name: 'audio', type: 'folder', children: [] },
              { id: 'images', name: 'images', type: 'folder', children: [] },
            ]
          },
          {
            id: 'meta',
            name: 'meta',
            type: 'folder',
            children: repoData.assets.map((asset: any) => ({
              id: `meta_${asset.id}`,
              name: `${asset.id}.json`,
              type: 'file',
              icon: 'description',
              iconColor: 'text-amber-400'
            }))
          },
          { id: 'timelines', name: 'timelines', type: 'folder', children: [] },
          {
            id: 'story', name: 'story', type: 'folder', children: [
              { id: 'dag_logic', name: 'main_flow.dag', type: 'file', icon: 'account_tree', iconColor: 'text-blue-400' }
            ]
          },
          { id: 'renders', name: 'renders', type: 'folder', children: [] },
          { id: 'lockfile', name: 'trem.lock', type: 'file', locked: true, icon: 'lock', iconColor: 'text-slate-500' }
        ];
        setFileSystem(newFS);
      }
    }
  }, [repoData]);

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
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <span className="material-icons-outlined text-lg">edit</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col relative z-10 overflow-y-auto pr-2 custom-scrollbar">
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
              <button className="text-xs text-primary font-mono hover:text-primary_hover transition-colors">VIEW FULL LOG</button>
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
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span className="text-primary font-bold">Agent_GPT4</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      trimmed silence <span className="text-slate-400 dark:text-slate-600 px-1">-&gt;</span> <span className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs text-slate-600 dark:text-slate-300">timeline: Main_Cut_v2</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">2m ago</td>
                  </tr>
                  {/* ... other log rows ... */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRepoOverview;