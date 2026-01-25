import { create } from 'zustand';
import { RepoData } from '../utils/db';

export type ViewType = 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'repo-files' | 'repo-logs' | 'trem-create' | 'trem-edit';

interface TremStore {
    currentView: ViewType;
    repoData: RepoData | null;
    isSidebarOpen: boolean;

    // Actions
    setCurrentView: (view: ViewType) => void;
    setRepoData: (data: RepoData | null) => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
    toggleSidebar: () => void;
}

export const useTremStore = create<TremStore>((set) => ({
    currentView: 'dashboard',
    repoData: null,
    isSidebarOpen: false,

    setCurrentView: (view) => set({ currentView: view }),
    setRepoData: (data) => set({ repoData: data }),
    setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
