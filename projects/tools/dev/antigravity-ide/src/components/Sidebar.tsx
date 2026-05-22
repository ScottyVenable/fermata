import React, { useState } from 'react';
import { Folder, File, Plus, ChevronDown, ChevronRight, Sparkles, FolderPlus } from 'lucide-react';
import { FileItem } from '../agent/AgentLoop';

interface SidebarProps {
  files: Record<string, FileItem>;
  openFilePath: string | null;
  onOpenFile: (path: string) => void;
  onCreateFile: (name: string) => void;
}

export default function Sidebar({ files, openFilePath, onOpenFile, onCreateFile }: SidebarProps) {
  const [showInput, setShowInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  
  const root = files['root'];
  const children = root?.children || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setShowInput(false);
    }
  };

  return (
    <div className="w-[var(--sidebar-width)] bg-[#111113] border-r border-[#212124] flex flex-col h-full">
      {/* Workspace Title */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#212124]">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-[#8c8c99]" />
          <span className="text-xs font-semibold tracking-wide uppercase text-[#8c8c99]">Explorer</span>
        </div>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="p-1 rounded hover:bg-[#1d1d23] text-[#8c8c99] hover:text-[#f3f3f5] transition-all"
          title="New File"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* New File Input */}
      {showInput && (
        <form onSubmit={handleCreate} className="p-3 border-b border-[#212124] bg-[#0a0a0b]">
          <input 
            type="text"
            placeholder="file.js, README.md..."
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full bg-[#111113] border border-[#212124] rounded px-2.5 py-1 text-xs text-[#f3f3f5] font-mono focus:outline-none focus:border-[#00ffcc] transition-all"
            autoFocus
          />
        </form>
      )}

      {/* Explorer Tree */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {/* Project directory node */}
        <div className="flex items-center gap-1.5 py-1.5 px-2 text-[#f3f3f5] font-sans font-medium">
          <ChevronDown className="w-3.5 h-3.5 text-[#52525b]" />
          <Folder className="w-4 h-4 text-[#00ffcc]" />
          <span>my-project</span>
        </div>

        {/* Child items */}
        <div className="pl-6 border-l border-[#212124] ml-3.5 flex flex-col gap-0.5">
          {children.map(path => {
            const file = files[path];
            if (!file) return null;
            const isSelected = openFilePath === path;

            return (
              <div 
                key={path}
                onClick={() => onOpenFile(path)}
                className={`flex items-center gap-2 py-1.5 px-2.5 rounded cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? 'bg-[#1d1d23] text-[#00ffcc] border-l-2 border-[#00ffcc]' 
                    : 'text-[#8c8c99] hover:bg-[#16161a] hover:text-[#f3f3f5]'
                }`}
              >
                <File className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00ffcc]' : 'text-[#52525b]'}`} />
                <span className="truncate">{file.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-3 border-t border-[#212124] bg-[#0a0a0b] flex items-center justify-between text-[10px] text-[#52525b] font-mono">
        <span>VIBE LAYER: ON</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" />
          <span className="text-[#00ff66]">SECURE</span>
        </div>
      </div>
    </div>
  );
}
