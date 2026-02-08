import React, { useState } from 'react';
import TopNavigation from '../../components/layout/TopNavigation';
import { RepoData } from '../../utils/db';
import EditLandingView from './EditLandingView';
import EditWorkspaceView from './EditWorkspaceView';

interface RemotionEditProps {
    onNavigate: (view: 'timeline' | 'dashboard' | 'repo' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'trem-create' | 'trem-edit') => void;
    onSelectRepo?: (repo: RepoData) => void;
}

type EditViewMode = 'landing' | 'workspace';

const RemotionEditPage: React.FC<RemotionEditProps> = ({ onNavigate, onSelectRepo }) => {
    const [viewMode, setViewMode] = useState<EditViewMode>('landing');
    const [selectedRepo, setSelectedRepo] = useState<RepoData | undefined>(undefined);
    const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);

    const handleSelectRepo = (repo: RepoData) => {
        setSelectedRepo(repo);
        setSelectedTemplate(undefined);
        setViewMode('workspace');
        if (onSelectRepo) {
            onSelectRepo(repo);
        }
    };

    const handleSelectTemplate = (template: string) => {
        setSelectedTemplate(template);
        setSelectedRepo(undefined);
        setViewMode('workspace');
    };

    const handleBackToLanding = () => {
        setViewMode('landing');
        setSelectedRepo(undefined);
        setSelectedTemplate(undefined);
    };

    return (
        <div className="flex flex-col min-h-full relative bg-slate-50 dark:bg-background-dark transition-colors duration-300">
            {/* Top Navigation Header */}
            <TopNavigation onNavigate={onNavigate} activeTab="edit" />

            {/* Main Content Area */}
            {viewMode === 'landing' ? (
                <EditLandingView
                    onSelectRepo={handleSelectRepo}
                    onSelectTemplate={handleSelectTemplate}
                    onNavigate={onNavigate}
                />
            ) : (
                <div className="flex-1 overflow-hidden">
                    <EditWorkspaceView
                        onNavigate={onNavigate}
                        onSelectRepo={onSelectRepo}
                        onBack={handleBackToLanding}
                        initialRepo={selectedRepo}
                        templateMode={selectedTemplate}
                    />
                </div>
            )}
        </div>
    );
};

export default RemotionEditPage;
