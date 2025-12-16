import React, { useState, useEffect } from 'react';
import { Code, Eye, RefreshCw, Copy, Check, Download, File, Folder } from 'lucide-react';
import { GeneratedProject, ProjectFile } from '../types';
import JSZip from 'jszip';

interface PreviewAreaProps {
  project: GeneratedProject | null;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ project }) => {
  const [mode, setMode] = useState<'preview' | 'code'>('preview');
  const [iframeKey, setIframeKey] = useState(0); 
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  useEffect(() => {
    // When project changes, reset to preview mode and reload iframe
    if (project) {
        setMode('preview');
        setIframeKey(prev => prev + 1);
        // Default to showing first file or index.html if available in code view
        const mainFile = project.files.find(f => f.path.endsWith('App.jsx') || f.path.endsWith('index.html')) || project.files[0];
        setSelectedFile(mainFile);
    }
  }, [project]);

  const handleCopy = () => {
    if (mode === 'preview') {
        // Copy the preview HTML
        if (!project?.preview) return;
        navigator.clipboard.writeText(project.preview);
    } else {
        // Copy the selected file content
        if (!selectedFile) return;
        navigator.clipboard.writeText(selectedFile.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!project) return;
    const zip = new JSZip();
    
    // Add all files to the zip
    project.files.forEach(file => {
        zip.file(file.path, file.content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.projectName.replace(/\s+/g, '-').toLowerCase()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!project) {
    return (
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center text-zinc-600 p-8 border-l border-zinc-800">
        <div className="w-24 h-24 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800 animate-pulse">
            <Code size={40} className="opacity-50" />
        </div>
        <h3 className="text-xl font-medium text-zinc-400 mb-2">No Project Loaded</h3>
        <p className="text-sm text-center max-w-sm">
          Send a prompt to generate a full React project.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 border-l border-zinc-800 h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
                onClick={() => setMode('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'preview'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
                <Eye size={14} />
                Preview
            </button>
            <button
                onClick={() => setMode('code')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'code'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
                <Code size={14} />
                Code
            </button>
            </div>
            <span className="text-xs font-mono text-zinc-500 hidden md:block">
                {project.projectName}
            </span>
        </div>

        <div className="flex items-center gap-2">
           <button
            onClick={() => setIframeKey(prev => prev + 1)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title="Reload Preview"
            hidden={mode !== 'preview'}
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors border border-transparent hover:border-zinc-700"
            title={mode === 'preview' ? "Copy Preview HTML" : "Copy File Content"}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-[#0d0d0d] flex overflow-hidden">
        {mode === 'preview' ? (
          <iframe
            key={iframeKey}
            title="App Preview"
            srcDoc={project.preview}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          />
        ) : (
          <>
            {/* File Explorer Sidebar */}
            <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto">
                <div className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Explorer</div>
                <div className="flex-1">
                    {project.files.map((file) => (
                        <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-xs text-left font-mono border-l-2 transition-colors ${
                                selectedFile?.path === file.path
                                    ? 'bg-zinc-800 text-blue-400 border-blue-500'
                                    : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-zinc-200'
                            }`}
                        >
                            <File size={14} className="shrink-0 opacity-70" />
                            <span className="truncate">{file.path}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Code Editor View */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-zinc-950">
                {selectedFile ? (
                    <div className="min-w-full">
                        <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 px-4 py-2">
                             <span className="text-xs font-mono text-zinc-400">{selectedFile.path}</span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre overflow-x-auto">
                            <code>{selectedFile.content}</code>
                        </pre>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                        Select a file to view code
                    </div>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};