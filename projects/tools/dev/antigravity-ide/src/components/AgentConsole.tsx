import React, { useRef, useEffect } from 'react';
import { Send, Cpu, CheckCircle2, AlertTriangle, Terminal, Eye, Play, Sparkles } from 'lucide-react';
import { AgentStep } from '../agent/AgentLoop';

interface AgentConsoleProps {
  history: AgentStep[];
  isThinking: boolean;
  prompt: string;
  setPrompt: (p: string) => void;
  onSubmit: () => void;
}

export default function AgentConsole({ history, isThinking, prompt, setPrompt, onSubmit }: AgentConsoleProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when history or thinking updates
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history, isThinking]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-[var(--console-width)] bg-[#111113] border-l border-[#212124] flex flex-col h-full overflow-hidden">
      
      {/* Console Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#212124]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00ffcc]" />
          <span className="text-xs font-semibold tracking-wide uppercase text-[#f3f3f5]">Agent Terminal</span>
        </div>
        {isThinking && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00ffcc]/10 text-[#00ffcc] text-[10px] font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-ping" />
            <span>AGENT RUNNING</span>
          </div>
        )}
      </div>

      {/* Terminal History Log */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono text-[11px] leading-relaxed scroll-smooth"
      >
        {history.map((step) => {
          const isUser = step.type === 'tool_call' && step.title === 'User Instruction';
          
          return (
            <div 
              key={step.id} 
              className={`p-3 rounded border transition-all ${
                isUser
                  ? 'bg-[#16161a]/60 border-[#212124] border-l-2 border-l-[#8c8c99]'
                  : step.type === 'thinking'
                  ? 'bg-[#1d1d23]/40 border-[#323238] border-l-2 border-l-[#00ffcc]'
                  : step.type === 'error'
                  ? 'bg-[#ff453a]/5 border-[#ff453a]/25 text-[#ff453a]'
                  : step.type === 'done'
                  ? 'bg-[#00ff66]/5 border-[#00ff66]/25 border-l-2 border-l-[#00ff66]'
                  : 'bg-[#16161a] border-[#212124]'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between mb-1.5 text-[10px] text-[#52525b]">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  {step.type === 'thinking' && <Cpu className="w-3.5 h-3.5 text-[#00ffcc]" />}
                  {step.type === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />}
                  {step.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-[#ff453a]" />}
                  {step.title}
                </span>
                <span>{step.timestamp}</span>
              </div>

              {/* Step Body */}
              <p className={`whitespace-pre-wrap ${isUser ? 'text-[#f3f3f5]' : 'text-[#8c8c99]'}`}>
                {step.description}
              </p>

              {/* Action tags if any */}
              {step.toolName && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#212124] text-[#00ffcc] font-mono uppercase">
                    {step.toolName}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Streaming Thinking block */}
        {isThinking && (
          <div className="p-3 rounded border bg-[#1d1d23]/30 border-[#212124] flex items-center gap-2 text-[#8c8c99]">
            <Cpu className="w-4 h-4 text-[#00ffcc] animate-spin" />
            <span>Agent is typing thoughts...</span>
            <span className="terminal-cursor" />
          </div>
        )}
      </div>

      {/* Terminal Input Bar */}
      <div className="p-3 border-t border-[#212124] bg-[#111113] flex flex-col gap-2">
        <div className="flex gap-2">
          <textarea
            placeholder="Type your instruction... (e.g. 'Add an API endpoint to count lines')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isThinking}
            className="flex-1 bg-[#0a0a0b] border border-[#212124] rounded-md px-3 py-2 text-xs text-[#f3f3f5] font-sans placeholder-[#52525b] focus:outline-none focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc]/35 min-h-[60px] max-h-[120px] resize-none disabled:opacity-60 transition-all"
          />
          <button 
            onClick={onSubmit}
            disabled={isThinking || !prompt.trim()}
            className="w-10 flex items-center justify-center rounded-md bg-[#00ffcc] hover:bg-[#00b390] text-[#0a0a0b] disabled:bg-[#16161a] disabled:border disabled:border-[#212124] disabled:text-[#52525b] transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[9px] text-[#52525b] font-mono px-0.5">
          <span>SHIFT + ENTER FOR NEW LINE</span>
          <span>ANTIGRAVITY v2.0 ACTIVE</span>
        </div>
      </div>

    </div>
  );
}
