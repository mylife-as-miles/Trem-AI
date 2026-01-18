import React, { useState } from 'react';

interface SettingsViewProps {
    onNavigate?: (view: 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings') => void;
}

type SettingsTab = 'general' | 'ai' | 'integrations' | 'workflow' | 'billing';

const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('ai');

    // Mock states for UI interactivity
    const [modelTemp, setModelTemp] = useState(0.7);
    const [autoCommit, setAutoCommit] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const renderSidebarItem = (id: SettingsTab, label: string, icon: string) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === id
                ? 'bg-primary text-white shadow-lg shadow-purple-900/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
        >
            <span className={`material-icons-outlined ${activeTab === id ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary'}`}>{icon}</span>
            <span className="font-medium text-sm">{label}</span>
            {activeTab === id && (
                <span className="ml-auto material-icons-outlined text-sm opacity-50">chevron_right</span>
            )}
        </button>
    );

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-sans overflow-hidden transition-colors duration-200">
            {/* Header */}
            <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate && onNavigate('dashboard')}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <span className="material-icons-outlined">arrow_back</span>
                    </button>
                    <h1 className="font-display font-bold text-xl tracking-tight">Settings</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-4 py-2 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                        Discard Changes
                    </button>
                    <button className="px-4 py-2 rounded-md bg-primary hover:bg-primary_hover text-white text-sm font-bold shadow-lg shadow-purple-500/20 transition-all">
                        Save Preferences
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Settings Sidebar */}
                <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 overflow-y-auto p-4 flex flex-col gap-1">
                    <div className="px-4 py-2 mb-4">
                        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-600 font-bold">Workspace</div>
                        <div className="font-display font-bold text-lg dark:text-white mt-1">Acme Studios</div>
                    </div>

                    {renderSidebarItem('general', 'General', 'settings')}
                    {renderSidebarItem('ai', 'AI Agents & Models', 'smart_toy')}
                    {renderSidebarItem('integrations', 'Integrations', 'integration_instructions')}
                    {renderSidebarItem('workflow', 'Workflow Automation', 'account_tree')}
                    {renderSidebarItem('billing', 'Billing & Plans', 'credit_card')}

                    <div className="mt-auto pt-8 px-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-900/10 border border-primary/20">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                                <span className="material-icons-outlined">star</span>
                                Pro Plan
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">You are using 45% of your monthly compute credits.</p>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full w-[45%] bg-primary rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                    <div className="max-w-4xl mx-auto space-y-12">

                        {/* Title & Description */}
                        <div>
                            <h2 className="text-3xl font-display font-bold mb-2">
                                {activeTab === 'general' && 'General Settings'}
                                {activeTab === 'ai' && 'AI Configuration'}
                                {activeTab === 'integrations' && 'Integrations'}
                                {activeTab === 'workflow' && 'Workflow Rules'}
                                {activeTab === 'billing' && 'Plan & Billing'}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                {activeTab === 'ai' ? 'Manage LLM providers, fine-tuning parameters, and agent personas.' : 'Configure global application settings.'}
                            </p>
                        </div>

                        {activeTab === 'ai' && (
                            <>
                                {/* Model Selection */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                                        <h3 className="text-xl font-bold">Primary Model</h3>
                                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">DEFAULT</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'gpt4', name: 'GPT-4o', vendor: 'OpenAI', desc: 'Best for reasoning & code', active: true },
                                            { id: 'claude', name: 'Claude 3.5 Sonnet', vendor: 'Anthropic', desc: 'Superior creative writing', active: false },
                                            { id: 'gemini', name: 'Gemini 1.5 Pro', vendor: 'Google', desc: '2M context window', active: false },
                                        ].map((model) => (
                                            <div key={model.id} className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer ${model.active
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:border-primary/50'}`}>
                                                {model.active && (
                                                    <div className="absolute top-3 right-3 text-primary">
                                                        <span className="material-icons-outlined">check_circle</span>
                                                    </div>
                                                )}
                                                <div className="text-xs font-mono text-slate-500 uppercase mb-2">{model.vendor}</div>
                                                <div className="font-bold text-lg mb-1">{model.name}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">{model.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Parameters */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                                        <h3 className="text-xl font-bold">Inference Parameters</h3>
                                    </div>

                                    <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-8">
                                        {/* Temperature */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="font-medium text-sm">Temperature</label>
                                                <span className="font-mono text-sm text-primary">{modelTemp}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={modelTemp}
                                                onChange={(e) => setModelTemp(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between mt-2 text-xs text-slate-400">
                                                <span>Precise</span>
                                                <span>Creative</span>
                                            </div>
                                        </div>

                                        {/* Context Window */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="font-medium text-sm">Context Window limit</label>
                                                <span className="font-mono text-sm text-slate-500">128k Tokens</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
                                                <div className="bg-slate-400 dark:bg-slate-500 h-2 rounded-full w-2/3"></div>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Cap context usage to control costs.</p>
                                        </div>
                                    </div>
                                </section>

                                {/* System Prompt */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                                        <h3 className="text-xl font-bold">Global System Prompt</h3>
                                        <button className="text-primary text-sm hover:underline">Reset to Default</button>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            className="w-full h-48 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none leading-relaxed"
                                            defaultValue={`You are Trem, an advanced AI video editing assistant. Your goal is to interpret creative briefs and execute precise edit decisions using OTIO timelines.

- Always prioritize narrative flow over flashy effects.
- When deleting clips, ensure the audio crossfades are preserved.
- Use 24fps timecode standard.`}
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                                            markdown supported
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {activeTab === 'integrations' && (
                            <section className="space-y-6">
                                <div className="grid gap-4">
                                    {[
                                        { name: 'GitHub', icon: 'code', status: 'Connected', color: 'text-white bg-black' },
                                        { name: 'Frame.io', icon: 'movie', status: 'Connect', color: 'text-white bg-purple-900' },
                                        { name: 'Slack', icon: 'chat', status: 'Connected', color: 'text-white bg-green-700' },
                                        { name: 'DaVinci Resolve', icon: 'tune', status: 'Install Plugin', color: 'text-white bg-blue-600' },
                                    ].map((app, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${app.color}`}>
                                                    <span className="material-icons-outlined text-2xl">{app.icon}</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{app.name}</div>
                                                    <div className="text-sm text-slate-500">Sync version control & comments</div>
                                                </div>
                                            </div>
                                            <button className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${app.status === 'Connected'
                                                ? 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 cursor-default'
                                                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'}`}>
                                                {app.status === 'Connected' ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        Connected
                                                    </span>
                                                ) : app.status}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsView;
