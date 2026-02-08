import React, { useState } from 'react';
import TopNavigation from '../../components/layout/TopNavigation';
import { RepoData } from '../../utils/db';
import EditLandingView from './EditLandingView';
import EditWorkspaceView from './EditWorkspaceView';
import EditPlanningView from './EditPlanningView';

interface RemotionEditProps {
    onNavigate: (view: 'timeline' | 'dashboard' | 'repo' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'trem-create' | 'trem-edit') => void;
    onSelectRepo?: (repo: RepoData) => void;
}

type EditViewMode = 'landing' | 'workspace' | 'planning';

const RemotionEditPage: React.FC<RemotionEditProps> = ({ onNavigate, onSelectRepo }) => {
    const [viewMode, setViewMode] = useState<EditViewMode>('landing');
    const [selectedRepo, setSelectedRepo] = useState<RepoData | undefined>(undefined);
    const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [editPlan, setEditPlan] = useState<any>(null);

    const handleSelectRepo = (repo: RepoData) => {
        setSelectedRepo(repo);
        setSelectedTemplate(undefined);
        setViewMode('workspace');
        // Do not call parent onSelectRepo to avoid auto-navigation to standard repo view
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

    const handleGoToPlanning = (prompt: string) => {
        setCurrentPrompt(prompt);
        setViewMode('planning');
    };

    const handleApprovePlan = (plan: any) => {
        setEditPlan(plan);
        // Execute the plan -> Navigate to timeline
        onNavigate('timeline');
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
            ) : viewMode === 'planning' && selectedRepo ? (
                <div className="flex-1 overflow-hidden">
                    <EditPlanningView
                        prompt={currentPrompt}
                        repo={selectedRepo}
                        onApprove={handleApprovePlan}
                        onBack={() => setViewMode('workspace')}
                    />
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <EditWorkspaceView
                        onNavigate={onNavigate}
                        onSelectRepo={handleSelectRepo}
                        onBack={handleBackToLanding}
                        initialRepo={selectedRepo}
                        templateMode={selectedTemplate}
                        onPlan={handleGoToPlanning}
                    />
                </div>
            )}
        </div>
    );

};

export default RemotionEditPage;
