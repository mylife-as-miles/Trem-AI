import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'dashboard' | 'repo' | 'timeline') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  return (
    <>
      {/* Mobile Overlay is handled in App.tsx, but we ensure z-index here */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 flex-shrink-0 flex flex-col 
          border-r border-slate-200 dark:border-white/10 
          bg-surface-light dark:bg-surface-dark 
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-slate-100 dark:border-white/10">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <span className="material-icons-outlined text-lg">auto_awesome_motion</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight dark:text-white text-slate-900">Trem</span>
          </button>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <span className="material-icons-outlined">close</span>
          </button>
          {/* Desktop Collapse Icon (Visual only for now) */}
          <button className="hidden lg:block p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="material-icons-outlined text-lg">dock</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative group">
            <span className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary transition-colors material-icons-outlined text-sm">search</span>
            <input
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm rounded-lg py-2 pl-9 pr-3 focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-500 text-slate-700 dark:text-gray-200 transition-all font-mono outline-none"
              placeholder="Search..."
              type="text"
            />
            <div className="hidden xl:block absolute right-3 top-2.5 text-[10px] text-slate-400 border border-slate-300 dark:border-white/10 rounded px-1">⌘K</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 space-y-6">

          {/* Active Processing */}
          <div>
            <h3 className="px-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-2 mt-2 font-bold">Active Processing</h3>
            <ul className="space-y-1">
              <li>
                <button onClick={() => onNavigate('repo')} className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md bg-primary/10 text-primary font-medium border border-primary/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                  <span className="material-icons-outlined text-sm animate-pulse">data_usage</span>
                  <span className="truncate">Ingest: 4k_Raw_Footage_A</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('timeline')} className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white transition-colors group">
                  <span className="material-icons-outlined text-sm text-slate-400 group-hover:text-primary transition-colors">edit</span>
                  <span className="truncate">Edit: nike-commercial</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('repo')} className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white transition-colors group">
                  <span className="material-icons-outlined text-sm text-slate-400 group-hover:text-primary transition-colors">movie_filter</span>
                  <span className="truncate">Render: Social_Cut_v3</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Video Repos */}
          <div>
            <h3 className="px-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-2 font-bold">Video Repos</h3>
            <ul className="space-y-1">
              {['client/nike-commercial', 'internal/podcast-ep-42', 'events/techcrunch-2023'].map((repo, i) => (
                <li key={i}>
                  <button
                    onClick={() => onNavigate('repo')}
                    className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white transition-colors group"
                  >
                    <span className="material-icons-outlined text-sm text-purple-400/70 group-hover:text-primary transition-colors">folder</span>
                    <span className="truncate">{repo}</span>
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => onNavigate('repo')} className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white transition-colors group">
                  <span className="material-icons-outlined text-sm text-purple-400/70 group-hover:text-primary transition-colors">cloud_queue</span>
                  <span className="truncate">archive/legacy-b-roll</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Deployed Agents */}

        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 hover:text-primary transition-colors w-full group">
            <span className="material-icons-outlined text-lg group-hover:text-primary">add_circle_outline</span>
            <span>New Video Repository</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;