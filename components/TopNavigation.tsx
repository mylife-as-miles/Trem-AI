import React from 'react';

interface TopNavigationProps {
    onNavigate?: (view: 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'repo-files') => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onNavigate }) => {
    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10 bg-background-light/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
            <div className="flex items-center gap-2">
                {/* Context switcher removed as per user request */}
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center -space-x-2">
                    <img alt="User" className="w-8 h-8 rounded-full border-2 border-background-light dark:border-black" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfOTDE_X3JwToSHTjUFVUtEmOhsNZj6RL934lNVNkkJ_7-dUJZEIfrP-BB4R4yKz6DimrwF9peEsyj_o_qTyGoJMJOIY6497yHymfN_9F7STpDS1WU4VhqLtB4lv5rUS9pq_am9pw4b9Oa84Xtx6eWZ8hdpz0VKq6xB3s-x830O9tK35zH4IDI59VYtVh53_FTHTGcjhnrq1u24Z-SHawNiXKPLY7e3aK6NGBtwHSbiXSaWb5DZhnQiVdO59VHXuxa09qplRDAhcE" />
                    <div className="w-8 h-8 rounded-full border-2 border-background-light dark:border-black bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-slate-500 dark:text-white">+2</div>
                </div>
                <div className="h-4 w-px bg-slate-300 dark:bg-white/10 mx-2"></div>
                <button
                    onClick={() => onNavigate?.('dashboard')}
                    className="text-slate-400 hover:text-primary transition-colors"
                    title="Upload / Orchestrator"
                >
                    <span className="material-icons-outlined">cloud_upload</span>
                </button>
                <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <span className="material-icons-outlined">settings</span>
                </button>
                <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <span className="material-icons-outlined">notifications</span>
                </button>
            </div>
        </header>
    );
};

export default TopNavigation;
