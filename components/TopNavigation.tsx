import React from 'react';

const TopNavigation: React.FC = () => {
    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10 bg-background-light/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
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
    );
};

export default TopNavigation;
