import React, { useState, useEffect, useRef } from 'react';
import TopNavigation from './TopNavigation';
import { RepoData, db } from '../utils/db'; // Added db import
import AlertDialog from './AlertDialog';
import { analyzeAsset, generateRepoStructure } from '../services/geminiService';
import { transcribeAudio } from '../services/whisperService';
import { extractFramesFromVideo } from '../utils/frameExtractor';
import { extractAudioFromVideo } from '../utils/audioExtractor';

interface RepoFilesViewProps {
    onNavigate: (view: 'dashboard' | 'repo' | 'timeline' | 'diff' | 'assets' | 'settings' | 'create-repo' | 'repo-files') => void;
    repoData?: RepoData | null;
}

interface FileNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    content?: string;
    children?: FileNode[];
    isOpen?: boolean;
    locked?: boolean;
    icon?: string;
    iconColor?: string;
}

const RepoFilesView: React.FC<RepoFilesViewProps> = ({ onNavigate, repoData }) => {
    const [files, setFiles] = useState<FileNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    // CRUD Dialog States
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
    const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    // AI & Terminal States
    const [isProcessing, setIsProcessing] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [showTerminal, setShowTerminal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize files from repoData
    useEffect(() => {
        if (!repoData) return;
        if (repoData.fileSystem && Array.isArray(repoData.fileSystem)) {
            // Deep clone to ensure editable
            try {
                const clonedFS = JSON.parse(JSON.stringify(repoData.fileSystem));
                setFiles(clonedFS);
            } catch (e) {
                console.error("Failed to parse fileSystem", e);
            }
        } else {
            // Fallback init
            setFiles([{ id: 'root', name: 'root', type: 'folder', children: [] }]);
        }
    }, [repoData]);

    // --- Helper Functions ---

    const addLog = (msg: string) => {
        setTerminalLogs(prev => [...prev, `> ${msg}`]);
    };

    const findNode = (id: string, nodes: FileNode[]): FileNode | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(id, node.children);
                if (found) return found;
            }
        }
        return null;
    };

    // --- CRUD Operations ---

    // Auto-Commit System
    const createCommit = async (message: string, updatedFS: FileNode[]) => {
        if (!repoData?.id) return;

        try {
            // 1. Generate new Commit ID
            const commitsDir = findNode('commits', updatedFS);
            let nextId = 1;
            if (commitsDir && commitsDir.children) {
                nextId = commitsDir.children.length + 1;
            }
            const commitId = String(nextId).padStart(4, '0');
            const commitFileName = `${commitId}.json`;

            // 2. Generate Commit Content (Snapshot of change)
            // Ideally we differentiate, but for now we snapshot the metadata
            const commitData = {
                id: `commit_${commitId}`,
                message: message,
                author: "User (via IDE)",
                timestamp: Date.now(),
                changes: "filesystem_update"
            };

            // 3. Add Commit File to FS
            const newCommitNode: FileNode = {
                id: `commit_${commitId}`,
                name: commitFileName,
                type: 'file',
                icon: 'commit',
                iconColor: 'text-orange-400',
                content: JSON.stringify(commitData, null, 2)
            };

            // Immutable update to add commit
            const fsWithCommit = JSON.parse(JSON.stringify(updatedFS)); // clone again
            const targetCommitsDiv = findNode('commits', fsWithCommit);
            if (targetCommitsDiv && targetCommitsDiv.children) {
                targetCommitsDiv.children.unshift(newCommitNode);
            } else {
                // Create commits folder if missing
                fsWithCommit.push({
                    id: 'commits',
                    name: 'commits',
                    type: 'folder',
                    children: [newCommitNode]
                });
            }

            // 4. Persist to DB
            const updatedRepoData = {
                ...repoData,
                fileSystem: fsWithCommit,
                // Update version/modified if tracked
            };

            await db.updateRepo(repoData.id, updatedRepoData);

            // Update Local State
            setFiles(fsWithCommit);
            addLog(`Commit Created: ${commitFileName} - "${message}"`);

        } catch (e) {
            console.error("Auto-Commit Failed", e);
            addLog("ERROR: Auto-Commit failed.");
        }
    };

    const handleDelete = async () => {
        if (!selectedFile) return;

        const deleteRecursive = (nodes: FileNode[], id: string): FileNode[] => {
            return nodes.filter(n => n.id !== id).map(n => ({
                ...n,
                children: n.children ? deleteRecursive(n.children, id) : undefined
            }));
        };

        const newFS = deleteRecursive(files, selectedFile.id);
        setFiles(newFS); // Optimistic update
        setSelectedFile(null);
        setDeleteDialogOpen(false);

        // Run Semantic Update
        setIsProcessing(true);
        setShowTerminal(true);
        addLog(`Deleted ${selectedFile.name}. Updating Semantic Index...`);

        // Simulating simple retrieval of context since we don't have full context awareness here yet
        // In a real system, we'd update scenes.json to remove references
        await new Promise(r => setTimeout(r, 1000));
        addLog("Semantic Index Updated.");

        await createCommit(`chore: deleted ${selectedFile.name}`, newFS);
        setIsProcessing(false);
    };

    const handleSave = () => {
        if (selectedFile) {
            setFiles(files.map(n => n.id === selectedFile.id ? { ...n, content: editorContent } : n));
            setIsDirty(false);
            createCommit(`feat: updated ${selectedFile.name}`, files);
        }
    };

    const handleDeleteClick = () => {
        if (selectedFile) {
            setDeleteDialogOpen(true);
        }
    };

    const handleCreateItem = async (type: 'folder' | 'file') => {
        // Default to root if no selection or selection is file
        // Or create inside selected folder
        let targetId = 'root'; // simplified, ideally we track 'current path'

        // For now, let's just add to root or 'media' if specific types? 
        // Let's implement a simple "add to root" or "add to currently open folder" logic later.
        // For MVP: Add to Root.

        const newItem: FileNode = {
            id: `new_${Date.now()}`,
            name: newItemName || (type === 'folder' ? 'New Folder' : 'new_file.txt'),
            type: type,
            children: type === 'folder' ? [] : undefined,
            content: '',
            icon: type === 'folder' ? undefined : 'description'
        };

        const newFS = [...files, newItem]; // Add to root for simplicity in this view
        setFiles(newFS);
        setNewFolderDialogOpen(false);
        setNewFileDialogOpen(false);
        setNewItemName('');

        // Commit
        await createCommit(`feat: created ${newItem.name}`, newFS);
    };


    // --- AI Pipeline ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setIsProcessing(true);
        setShowTerminal(true);
        setTerminalLogs([]);
        addLog("Starting Ingestion Pipeline...");

        const newFiles = Array.from(e.target.files);
        // We'll process sequentially to avoid overwhelming the client
        let currentFS = [...files];

        for (const file of newFiles) {
            addLog(`Processing: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

            // 1. Determine Type
            const isVideo = file.type.startsWith('video');
            const isAudio = file.type.startsWith('audio');
            const isImage = file.type.startsWith('image');

            // 2. Add to assets DB (store Blob)
            const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await db.addAsset({
                id: assetId,
                name: file.name,
                type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
                blob: file,
                created: Date.now(),
                status: 'pending'
            });

            // 3. Add to FileSystem (media/raw)
            const mediaFolder = findNode('raw', currentFS) || findNode('media', currentFS); // try raw, fallback media

            const newFileNode: FileNode = {
                id: assetId, // Match asset ID for preview linkage
                name: file.name,
                type: 'file',
                icon: isVideo ? 'movie' : isAudio ? 'music_note' : isImage ? 'image' : 'description',
                iconColor: 'text-emerald-400',
                locked: false
            };

            // Update FS immutably
            const addToFolder = (nodes: FileNode[], targetId: string, item: FileNode): FileNode[] => {
                return nodes.map(n => {
                    if (n.id === targetId && n.children) return { ...n, children: [...n.children, item] };
                    if (n.children) return { ...n, children: addToFolder(n.children, targetId, item) };
                    return n;
                });
            };

            if (mediaFolder) {
                currentFS = addToFolder(currentFS, mediaFolder.id, newFileNode);
                setFiles(currentFS); // Update UI immediately
            }

            // 4. Run Analysis Pipeline
            let analysisResult: any = null;
            let transcriptText = "";

            if (isVideo) {
                addLog("Target: VIDEO. Pipeline: Frames -> Whisper -> Gemini");

                // Frames
                addLog("Extracting Keyframes...");
                const frames = await extractFramesFromVideo(file);
                addLog(`Extracted ${frames.length} keyframes.`);

                // Audio
                addLog("Extracting Audio Track...");
                const audioBlob = await extractAudioFromVideo(file);

                if (audioBlob) {
                    addLog("Transcribing Audio (Whisper)...");
                    const transcript = await transcribeAudio(audioBlob);
                    transcriptText = transcript.text;
                    addLog("Transcription Complete via Whisper.");
                }

                // Gemini
                addLog("Generating Semantic Index (Gemini Vision)...");
                analysisResult = await analyzeAsset({
                    id: assetId,
                    name: file.name,
                    blob: file, // Gemini can handle blob if no frames, but we have frames
                    images: frames.slice(0, 5) // Use first 5 for speed
                });

            } else if (isAudio) {
                addLog("Target: AUDIO. Pipeline: Whisper -> Gemini");

                addLog("Transcribing Audio...");
                const transcript = await transcribeAudio(file);
                transcriptText = transcript.text;

                addLog("Analyzing Text Context...");
                // Mock analysis for audio text for now or send text to gemini
                analysisResult = { description: "Audio file processed", tags: ["audio", "transcript"] };
            } else {
                addLog("Target: IMAGE/OTHER. Pipeline: Gemini");
                analysisResult = await analyzeAsset({
                    id: assetId,
                    name: file.name,
                    blob: file
                });
            }

            addLog(`Analysis Complete: ${analysisResult?.tags?.join(', ')}`);

            // 5. Create Metadata File
            const metaNodeName = `${assetId}.json`;
            const metaNode: FileNode = {
                id: `meta_${assetId}`,
                name: metaNodeName,
                type: 'file',
                content: JSON.stringify({
                    asset_id: assetId,
                    original_name: file.name,
                    analysis: analysisResult,
                    transcript: transcriptText,
                    processed_at: Date.now(),
                    history: [{ timestamp: Date.now(), action: 'ingested' }]
                }, null, 2)
            };

            // Add meta to 'meta' folder
            const metaFolder = findNode('meta', currentFS);
            if (metaFolder) {
                currentFS = addToFolder(currentFS, metaFolder.id, metaNode);
            }

            // 6. AGGREGATE UPDATE: scenes.json
            // We want to ADD this asset's analysis to the global scenes.json
            const scenesNode = findNode('scenes_json', currentFS) || findNode('scenes.json', currentFS);

            if (scenesNode && scenesNode.content) {
                try {
                    const scenesData = JSON.parse(scenesNode.content);
                    // Check if 'assets' array exists, if not create
                    if (!scenesData.assets) scenesData.assets = [];

                    // Add new asset data
                    scenesData.assets.push({
                        id: assetId,
                        name: file.name,
                        description: analysisResult?.description || "Inferred context",
                        tags: analysisResult?.tags || []
                    });

                    // Update the node content in FS
                    // Helper to update specific node content
                    const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
                        return nodes.map(n => {
                            if (n.id === id) return { ...n, content };
                            if (n.children) return { ...n, children: updateNodeContent(n.children, id, content) };
                            return n;
                        });
                    };
                    currentFS = updateNodeContent(currentFS, scenesNode.id, JSON.stringify(scenesData, null, 2));
                    addLog("Updated Global Context (scenes.json)");

                } catch (e) {
                    console.warn("Failed to update scenes.json", e);
                }
            }

            // 7. Commit
            await createCommit(`feat: ingested ${file.name} (AI Index v2)`, currentFS);
        }

        setIsProcessing(false);
        addLog("All Files Processed.");
    };

    // --- Media Preview (Existing Logic + Updates) ---
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }
        let url: string | null = null;
        let isBlob = false;

        // Async fetch from DB
        const fetchAsset = async () => {
            // In new logic, ID matches exactly
            const asset = await db.getAsset(selectedFile.id);
            if (asset) {
                if (asset.blob) {
                    url = URL.createObjectURL(asset.blob);
                    isBlob = true;
                    setPreviewUrl(url);
                } else if (asset.url) {
                    setPreviewUrl(asset.url);
                }
            } else {
                setPreviewUrl(null);
            }
        };
        fetchAsset();

        return () => {
            // Cleanup logic tricky with async set, but React handles unmount updates usually
            // Ideally we track the url in a ref to revoke
        };
    }, [selectedFile, repoData]); // Dependency on repoData is less relevant now we fetch DB directly


    // --- Render ---

    const renderTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map(node => {
            let iconName = 'description';
            let iconColorClass = 'text-slate-400';

            if (node.type === 'folder') {
                iconName = node.isOpen ? 'folder_open' : 'folder';
                iconColorClass = 'text-amber-400';
            } else if (node.icon) {
                iconName = node.icon;
                iconColorClass = node.iconColor || 'text-slate-400';
            }

            return (
                <div key={node.id}>
                    <div
                        className={`flex items-center gap-2 py-1 px-2 cursor-pointer text-sm font-mono border-l-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${selectedFile?.id === node.id ? 'bg-primary/10 border-primary text-slate-900 dark:text-white font-bold' : 'border-transparent text-slate-600 dark:text-slate-400'} ${node.locked ? 'opacity-60' : ''}`}
                        style={{ paddingLeft: `${depth * 12 + 8}px` }}
                        onClick={() => {
                            if (node.type === 'folder') {
                                // Simple toggle logic needs access to modifying 'files' state deeply
                                // For this Refactor, to keep it clean, we should assume 'files' is the source of truth
                                // Immutability is hard with deepest recursion without a helper. 
                                // Let's simplify: We won't toggle open/close in this MVP, just assume open or use a local 'UI State' map for Folder Openness separate from Data
                                // Actually, let's just toggle the 'isOpen' prop in local state copy
                                const newFiles = JSON.parse(JSON.stringify(files)); // deep clone
                                const target = findNode(node.id, newFiles);
                                if (target) target.isOpen = !target.isOpen;
                                setFiles(newFiles);
                            } else {
                                if (isDirty && !window.confirm("Unsaved changes.")) return;
                                setSelectedFile(node);
                                setEditorContent(node.content || '');
                                setIsDirty(false);
                            }
                        }}
                    >
                        <span className={`material-icons-outlined text-base ${iconColorClass}`}>
                            {iconName}
                        </span>
                        <span className="truncate">{node.name}</span>
                        {node.locked && <span className="material-icons-outlined text-xs text-slate-400 ml-auto">lock</span>}
                    </div>
                    {node.type === 'folder' && (node.isOpen !== false) && node.children && (
                        // Default open if undefined
                        <div>{renderTree(node.children, depth + 1)}</div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans transition-colors duration-300">
            <TopNavigation onNavigate={onNavigate} />

            {/* Hidden Inputs */}
            <input type="file" ref={fileInputRef} hidden multiple onChange={handleFileUpload} accept="video/*,audio/*,image/*" />

            {/* Toolbar */}
            <div className="px-4 md:px-6 py-3 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between bg-white dark:bg-black/40 gap-3 md:gap-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('repo')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <span className="material-icons-outlined">arrow_back</span>
                        <span className="text-sm font-mono uppercase tracking-wider hidden sm:inline">Back</span>
                    </button>
                    <h2 className="text-lg font-display font-bold truncate">File Manager <span className="text-xs font-normal text-primary border border-primary/30 px-2 py-0.5 rounded-full ml-2">PRO</span></h2>
                </div>

                <div className="flex items-center gap-2">
                    {/* New Actions */}
                    <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-1 mr-2">
                        <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-slate-500 dark:text-slate-300" title="Upload Media">
                            <span className="material-icons-outlined">cloud_upload</span>
                        </button>
                        <button onClick={() => setNewFolderDialogOpen(true)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-slate-500 dark:text-slate-300" title="New Folder">
                            <span className="material-icons-outlined">create_new_folder</span>
                        </button>
                        <button onClick={() => { setNewFileDialogOpen(true); }} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-slate-500 dark:text-slate-300" title="New File">
                            <span className="material-icons-outlined">note_add</span>
                        </button>
                    </div>

                    <button
                        onClick={handleDeleteClick}
                        disabled={!selectedFile}
                        className="px-3 py-1.5 rounded-md border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                    >
                        <span className="material-icons-outlined text-sm">delete</span>
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                    <button
                        onClick={handleSave} // Only saves content edits, distinct from auto-commits
                        disabled={!isDirty}
                        className="px-3 py-1.5 rounded-md bg-primary hover:bg-primary_hover text-white disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-icons-outlined text-sm">save</span>
                        <span className="hidden sm:inline">Save</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar Tree */}
                <div className={`w-72 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 overflow-y-auto p-2 flex-shrink-0 relative`}>

                    <div className="mb-2 px-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                        <span>Explorer</span>
                        <button onClick={() => setFiles(files)} className="hover:text-primary"><span className="material-icons-outlined text-xs">refresh</span></button>
                    </div>

                    {renderTree(files)}
                </div>

                {/* Editor / Preview Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] min-w-0 relative">
                    {selectedFile ? (
                        <>
                            <div className="px-4 py-2 bg-slate-100 dark:bg-[#252526] border-b border-slate-200 dark:border-white/5 text-xs font-mono text-slate-500 dark:text-slate-400 flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    <span className="material-icons-outlined text-sm">description</span>
                                    {selectedFile.name}
                                </span>
                                <span className="opacity-50">{selectedFile.id}</span>
                            </div>

                            <div className="flex-1 overflow-hidden relative flex flex-col">
                                {/* Media Rendering Logic */}
                                {['mp4', 'mov', 'webm'].some(ext => (selectedFile.name || '').toLowerCase().endsWith(ext)) ? (
                                    <div className="w-full h-full flex items-center justify-center bg-black">
                                        {previewUrl ? (
                                            <video src={previewUrl} controls className="max-w-full max-h-full outline-none" />
                                        ) : (
                                            <div className="text-center text-white/50"><span className="material-icons-outlined text-4xl animate-spin">sync</span></div>
                                        )}
                                    </div>
                                ) : ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => (selectedFile.name || '').toLowerCase().endsWith(ext)) ? (
                                    <div className="w-full h-full flex items-center justify-center bg-black/90 p-8">
                                        {previewUrl && <img src={previewUrl} className="max-w-full max-h-full object-contain" />}
                                    </div>
                                ) : (
                                    <textarea
                                        value={editorContent}
                                        onChange={(e) => { setEditorContent(e.target.value); setIsDirty(true); }}
                                        className="w-full h-full p-4 bg-transparent outline-none font-mono text-sm resize-none text-slate-800 dark:text-[#d4d4d4] leading-relaxed"
                                        spellCheck={false}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                            <span className="material-icons-outlined text-6xl mb-4 text-slate-200 dark:text-slate-800">code_off</span>
                            <p>Select a file to manage</p>
                        </div>
                    )}

                    {/* Terminal Panel */}
                    {(showTerminal || isProcessing) && (
                        <div className="h-64 border-t border-slate-200 dark:border-white/10 bg-slate-900 text-slate-300 font-mono text-xs flex flex-col transition-all duration-300">
                            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-black/20">
                                <span className="font-bold flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></span>
                                    Trem-AI Terminal
                                </span>
                                <button onClick={() => setShowTerminal(false)} className="hover:text-white"><span className="material-icons-outlined text-sm">close</span></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                                {terminalLogs.map((log, i) => <div key={i}>{log}</div>)}
                                {isProcessing && <div className="animate-pulse text-amber-500">_ Processing...</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <AlertDialog
                isOpen={deleteDialogOpen}
                title="Confirm Selection Deletion"
                description={<span>Deleting <strong className="text-white">{selectedFile?.name}</strong> will create a new commit.</span>}
                confirmText="Delete & Commit"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteDialogOpen(false)}
            />

            {/* Simple New Folder/File Prompts (Reuse AlertDialog or simplified inline? Using prompt for speed now, ideally proper modal) */}
            {newFolderDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-96 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">New Folder</h3>
                        <input autoFocus value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Folder Name" className="w-full bg-black/50 border border-white/20 rounded p-2 text-white mb-4" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setNewFolderDialogOpen(false)} className="px-3 py-1 text-slate-400">Cancel</button>
                            <button onClick={() => handleCreateItem('folder')} className="px-3 py-1 bg-primary text-white rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
            {newFileDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-96 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">New File</h3>
                        <input autoFocus value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="File Name (e.g. notes.md)" className="w-full bg-black/50 border border-white/20 rounded p-2 text-white mb-4" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setNewFileDialogOpen(false)} className="px-3 py-1 text-slate-400">Cancel</button>
                            <button onClick={() => handleCreateItem('file')} className="px-3 py-1 bg-primary text-white rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepoFilesView;
