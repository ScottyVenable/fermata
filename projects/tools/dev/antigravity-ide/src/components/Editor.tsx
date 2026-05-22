import React, { useState, useEffect } from 'react';
import { Save, Code, CheckCircle, HelpCircle, Eye } from 'lucide-react';

interface EditorProps {
  filePath: string;
  content: string;
  onSave: (content: string) => void;
}

export default function Editor({ filePath, content, onSave }: EditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [isSaved, setIsSaved] = useState(true);

  // Sync state when file switches
  useEffect(() => {
    setLocalContent(content);
    setIsSaved(true);
  }, [filePath, content]);

  const handleSave = () => {
    onSave(localContent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(true), 2000);
  };

  const lineCount = localContent.split('\n').length;
  const wordCount = localContent.split(/\s+/).filter(Boolean).length;
  const charCount = localContent.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0b] text-[#f3f3f5]">
      
      {/* Editor Tab Bar */}
      <div className="flex items-center justify-between px-4 bg-[#111113] border-b border-[#212124]" style={{ height: '40px' }}>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 text-xs border-r border-[#212124] bg-[#0a0a0b] text-[#00ffcc] font-mono border-t border-t-[#00ffcc] flex items-center gap-2">
            <span>{filePath}</span>
            {!isSaved && <div className="w-1.5 h-1.5 rounded-full bg-[#ffd60a]" />}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={isSaved}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all ${
              isSaved 
                ? 'bg-[#16161a] border border-[#212124] text-[#52525b] cursor-default'
                : 'bg-[#00ffcc] hover:bg-[#00b390] text-[#0a0a0b] font-medium shadow-[0_0_8px_var(--accent-glow)]'
            }`}
          >
            {isSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Text Area */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs leading-relaxed">
        {/* Line Numbers */}
        <div className="py-4 px-3 bg-[#111113]/40 border-r border-[#212124] text-[#52525b] text-right select-none font-mono" style={{ width: '45px' }}>
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-5">{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={localContent}
          onChange={(e) => {
            setLocalContent(e.target.value);
            setIsSaved(false);
          }}
          className="flex-1 p-4 bg-transparent resize-none border-none outline-none text-[#f3f3f5] font-mono leading-5 overflow-y-auto"
          spellCheck={false}
          style={{ height: '100%', tabSize: 2 }}
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-[#111113] border-t border-[#212124] flex items-center justify-between text-[11px] text-[#52525b] font-mono">
        <div className="flex items-center gap-4">
          <span>LINES: {lineCount}</span>
          <span>WORDS: {wordCount}</span>
          <span>CHARS: {charCount}</span>
        </div>
        <div>
          <span>UTF-8</span>
        </div>
      </div>

    </div>
  );
}
