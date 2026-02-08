import React, { useState, useEffect, useRef } from 'react';
import { RepoData } from '../../utils/db';

interface EditPlanningViewProps {
    prompt: string;
    repo: RepoData;
    onApprove: (finalPlan: any) => void;
    onBack: () => void;
}

interface PlanItem {
    id: string;
    description: string;
    type: 'cut' | 'effect' | 'text' | 'audio';
    status: 'pending' | 'approved' | 'rejected';
}

const MOCK_PLAN_ITEMS: PlanItem[] = [
    { id: '1', description: 'Remove silence from interview track (00:00 - 00:15)', type: 'cut', status: 'pending' },
    { id: '2', description: 'Enhance audio clarity and reduce noise', type: 'audio', status: 'pending' },
    { id: '3', description: 'Add "Cinematic" color grading', type: 'effect', status: 'pending' },
    { id: '4', description: 'Generate subtitles for main speaker', type: 'text', status: 'pending' },
    { id: '5', description: 'Insert B-roll transition at 01:20', type: 'cut', status: 'pending' },
];

const EditPlanningView: React.FC<EditPlanningViewProps> = ({ prompt, repo, onApprove, onBack }) => {
    const [status, setStatus] = useState<'analyzing' | 'planning' | 'ready'>('analyzing');
    const [planItems, setPlanItems] = useState<PlanItem[]>([]);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([
        { role: 'user', text: prompt }
    ]);
    const [chatInput, setChatInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Simulate Analysis Phase
    useEffect(() => {
        const analyze = async () => {
            // Step 1: Analyzing
            await new Promise(r => setTimeout(r, 2000));
            setChatMessages(prev => [...prev, { role: 'agent', text: `I'm analyzing the footage in "${repo.name}". Looking for scene changes, audio levels, and content structure...` }]);

            // Step 2: Planning
            setStatus('planning');
            await new Promise(r => setTimeout(r, 1500));

            // Step 3: Present Plan
            setPlanItems(MOCK_PLAN_ITEMS);
            setStatus('ready');
            setChatMessages(prev => [...prev, { role: 'agent', text: "I've drafted a plan based on your request. I found some silence in the intro and suggesting a color grade. Review the tasks on the right." }]);
        };

        analyze();
    }, [repo.name]);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;

        const newMessage = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', text: newMessage }]);
        setChatInput("");

        // Simulate Agent Response
        setTimeout(() => {
            setChatMessages(prev => [...prev, { role: 'agent', text: "Noted. I'll update the plan accordingly." }]);
        }, 1000);
    };

    const togglePlanItem = (id: string) => {
        setPlanItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, status: item.status === 'rejected' ? 'pending' : 'rejected' }
                : item
        ));
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-background-dark font-sans overflow-hidden">

            {/* Left Panel: Agent Chat */}
            <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-border-dark bg-white dark:bg-surface-card relative">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-border-dark bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm sticky top-0 z-10">
                    <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <span className="material-icons-outlined text-sm">arrow_back</span>
                        Back to Workspace
                    </button>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 animate-pulse'}`}></div>
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            {status === 'analyzing' ? 'ANALYZING REPO' : status === 'planning' ? 'GENERATING PLAN' : 'AWAITING APPROVAL'}
                        </span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'agent'
                                ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                <span className="material-icons-outlined text-sm">{msg.role === 'agent' ? 'smart_toy' : 'person'}</span>
                            </div>
                            <div className={`rounded-2xl px-5 py-3.5 max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'agent'
                                ? 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/10'
                                : 'bg-primary text-slate-900 font-medium shadow-primary/20 shadow-lg'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {status !== 'ready' && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg flex items-center justify-center animate-pulse">
                                <span className="material-icons-outlined text-sm">smart_toy</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl px-5 py-3.5 border border-slate-200 dark:border-white/10 flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Refine the plan (e.g., 'Don't apply the color grade')..."
                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={status !== 'ready'}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim() || status !== 'ready'}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-primary hover:bg-primary/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <span className="material-icons-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: The Plan */}
            <div className="w-1/2 flex flex-col bg-slate-50/30 dark:bg-black/20">
                <div className="px-8 py-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-outlined text-primary">assignment</span>
                            Execution Plan
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Review approved tasks before rendering.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-mono border border-blue-200 dark:border-blue-800">
                            {planItems.filter(i => i.status !== 'rejected').length} TASKS
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-3 custom-scrollbar">
                    {status === 'ready' ? (
                        planItems.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => togglePlanItem(item.id)}
                                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${item.status === 'rejected'
                                    ? 'bg-slate-100 dark:bg-white/5 border-transparent opacity-60'
                                    : 'bg-white dark:bg-surface-card border-slate-200 dark:border-border-dark shadow-sm hover:border-primary/50 hover:shadow-md'
                                    }`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.status === 'rejected'
                                    ? 'border-slate-300 dark:border-slate-600 bg-transparent'
                                    : 'border-primary bg-primary text-white'
                                    }`}>
                                    {item.status !== 'rejected' && <span className="material-icons-outlined text-xs">check</span>}
                                </div>

                                <div className="flex-1">
                                    <div className={`text-sm font-medium transition-colors ${item.status === 'rejected' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-white'
                                        }`}>
                                        {item.description}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wide ${item.type === 'cut' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' :
                                            item.type === 'audio' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300' :
                                                item.type === 'effect' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' :
                                                    'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Loading Skeletons
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse"></div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-200 dark:border-border-dark bg-white dark:bg-surface-card">
                    <button
                        onClick={() => onApprove(planItems)}
                        disabled={status !== 'ready' || planItems.filter(i => i.status !== 'rejected').length === 0}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                    >
                        <span>Approve & Start Editing</span>
                        <span className="material-icons-outlined text-lg">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPlanningView;
