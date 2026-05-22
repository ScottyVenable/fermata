import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, File, Play, Send, ShieldAlert, Cpu, Settings as SettingsIcon, 
  Smartphone, Monitor, RefreshCw, Layers, CheckCircle2, ChevronRight, X, Sparkles, Code
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import AgentConsole from './components/AgentConsole';
import Settings from './components/Settings';
import { FileItem, WorkspaceState, AgentStep, runAgentStep } from './agent/AgentLoop';
import { DEFAULT_CONFIG, AIConfig, checkAIConnection } from './agent/LocalAI';

// Initial Mock Files for Out-of-the-box experience
const INITIAL_FILES: Record<string, FileItem> = {
  'root': { path: 'root', name: 'my-project', isDir: true, children: ['package.json', 'index.js', 'README.md'] },
  'package.json': {
    path: 'package.json',
    name: 'package.json',
    isDir: false,
    content: `{
  "name": "vibe-project",
  "version": "1.0.0",
  "description": "An AI vibe-coded project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {}
}`
  },
  'index.js': {
    path: 'index.js',
    name: 'index.js',
    isDir: false,
    content: `// Dynamic generative server
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: "alive",
    timestamp: new Date(),
    agent: "Antigravity 2.0"
  }));
});

server.listen(3000, () => {
  console.log('Server is spinning on port 3000');
});`
  },
  'README.md': {
    path: 'README.md',
    name: 'README.md',
    isDir: false,
    content: `# Vibe Project

This is a sandbox created and managed by the **Antigravity IDE 2.0** Agent.
Type a prompt in the chat console to ask the agent to add code, build features, or debug this project!

## Commands
- \`npm start\` - Spin up the http api server.
`
  }
};

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    files: INITIAL_FILES,
    openFilePath: 'README.md',
    history: [
      {
        id: 'welcome',
        timestamp: new Date().toLocaleTimeString(),
        type: 'done',
        title: 'Antigravity IDE Ready',
        description: 'Synchronized with local environment. Connect Ollama or LM Studio in settings to start coding!'
      }
    ],
    isThinking: false
  });

  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [isAiConnected, setIsAiConnected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Connection / Peer Syncing State
  const [peerIp, setPeerIp] = useState('192.168.1.142');
  const [syncStatus, setSyncStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [peerDevice, setPeerDevice] = useState<'mobile' | 'desktop' | null>(null);
  
  // Simulated server loop for Android peer pairing
  useEffect(() => {
    // Attempt auto connection checks on start
    checkAIConnection(aiConfig).then(setIsAiConnected);
  }, [aiConfig]);

  const toggleSync = () => {
    if (syncStatus === 'disconnected') {
      setSyncStatus('connecting');
      setTimeout(() => {
        setSyncStatus('connected');
        setPeerDevice('mobile'); // Simulate connecting to Pixel 10 Pro companion app
        // Add pairing notification log
        const syncLog: AgentStep = {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'tool_output',
          title: 'Peer Pair Successful',
          description: 'Successfully paired with Scott\'s Pixel 10 Pro Companion. Remote code synchronization active.'
        };
        setWorkspace(w => ({
          ...w,
          history: [...w.history, syncLog]
        }));
      }, 1500);
    } else {
      setSyncStatus('disconnected');
      setPeerDevice(null);
    }
  };

  const executeAgentTask = () => {
    if (!prompt.trim()) return;
    
    // Append user chat message
    const userStep: AgentStep = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'tool_call',
      title: 'User Instruction',
      description: prompt
    };
    
    const updatedHistory = [...workspace.history, userStep];
    const initialPrompt = prompt;
    setPrompt('');
    
    runAgentStep(
      aiConfig,
      initialPrompt,
      { ...workspace, history: updatedHistory },
      (step, newState) => {
        setWorkspace(newState);
      },
      async (toolName, args) => {
        // Execute tool logic
        if (toolName === 'READ_FILE') {
          const file = workspace.files[args.path];
          return file ? file.content || '' : `Error: File ${args.path} not found.`;
        }
        
        if (toolName === 'WRITE_FILE') {
          // Update file in local state
          setWorkspace(prev => {
            const nextFiles = { ...prev.files };
            const exists = !!nextFiles[args.path];
            nextFiles[args.path] = {
              path: args.path,
              name: args.path,
              isDir: false,
              content: args.content
            };
            if (!exists) {
              // Add to root children if it is a new file
              const rootDir = nextFiles['root'];
              if (rootDir && rootDir.children && !rootDir.children.includes(args.path)) {
                rootDir.children = [...rootDir.children, args.path];
              }
            }
            return {
              ...prev,
              files: nextFiles,
              openFilePath: args.path // Auto focus the modified file
            };
          });
          return `Success: File ${args.path} written successfully.`;
        }
        
        if (toolName === 'LIST_DIR') {
          return Object.keys(workspace.files).join('\n');
        }
        
        if (toolName === 'RUN_COMMAND') {
          return `Success: Executed command "${args.command}" inside "${args.cwd || './'}". Output: process finished.`;
        }

        return `Unknown tool ${toolName}`;
      }
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b] text-[#f3f3f5] select-none">
      
      {/* Premium Header */}
      <header className="flex items-center justify-between px-6 border-b border-[#212124] bg-[#111113]" style={{ height: 'var(--header-height)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#00ffcc]/10 border border-[#00ffcc]/30">
            <Sparkles className="w-4 h-4 text-[#00ffcc]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              ANTIGRAVITY <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#212124] text-[#8c8c99]">v2.0</span>
            </h1>
          </div>
        </div>

        {/* Sync & Connections Indicators */}
        <div className="flex items-center gap-4 text-sm">
          {/* Peer Sync Connector */}
          <div 
            onClick={toggleSync}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer transition-all duration-300 ${
              syncStatus === 'connected' 
                ? 'bg-[#00ffcc]/10 border-[#00ffcc]/40 text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.05)]' 
                : syncStatus === 'connecting'
                ? 'bg-[#ffd60a]/10 border-[#ffd60a]/40 text-[#ffd60a]'
                : 'bg-[#16161a] border-[#212124] text-[#8c8c99] hover:border-[#323238]'
            }`}
          >
            <Smartphone className={`w-4 h-4 ${syncStatus === 'connecting' ? 'animate-pulse' : ''}`} />
            <span className="font-mono text-xs">
              {syncStatus === 'connected' ? 'Pixel 10 Sync Active' : syncStatus === 'connecting' ? 'Pairing...' : 'Sync Mobile'}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'connected' ? 'bg-[#00ffcc]' : syncStatus === 'connecting' ? 'bg-[#ffd60a]' : 'bg-[#52525b]'}`} />
          </div>

          {/* AI Connector Indicator */}
          <div 
            onClick={() => setShowSettings(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer hover:border-opacity-80 transition-all ${
              isAiConnected 
                ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]' 
                : 'bg-[#ff453a]/10 border-[#ff453a]/40 text-[#ff453a]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">{aiConfig.provider}</span>
            <span className="text-xs text-[#8c8c99]">({isAiConnected ? 'Connected' : 'Offline'})</span>
          </div>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded border border-[#212124] hover:bg-[#1d1d23] hover:border-[#323238] transition-all text-[#8c8c99] hover:text-[#f3f3f5]"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <Sidebar 
          files={workspace.files}
          openFilePath={workspace.openFilePath}
          onOpenFile={(path) => setWorkspace(prev => ({ ...prev, openFilePath: path }))}
          onCreateFile={(name) => {
            const path = name;
            setWorkspace(prev => {
              const nextFiles = { ...prev.files };
              nextFiles[path] = { path, name, isDir: false, content: '// Write code here' };
              const root = nextFiles['root'];
              if (root && root.children && !root.children.includes(path)) {
                root.children = [...root.children, path];
              }
              return { ...prev, files: nextFiles, openFilePath: path };
            });
          }}
        />

        {/* Center - Workspace/Code Editor */}
        <div className="flex-1 flex flex-col border-r border-[#212124] bg-[#0a0a0b] relative">
          {workspace.openFilePath ? (
            <Editor 
              filePath={workspace.openFilePath}
              content={workspace.files[workspace.openFilePath]?.content || ''}
              onSave={(content) => {
                setWorkspace(prev => {
                  const nextFiles = { ...prev.files };
                  if (nextFiles[prev.openFilePath || '']) {
                    nextFiles[prev.openFilePath || ''] = {
                      ...nextFiles[prev.openFilePath || ''],
                      content
                    };
                  }
                  return { ...prev, files: nextFiles };
                });
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#52525b] gap-4">
              <Code className="w-12 h-12 stroke-[1]" />
              <p className="text-sm">Select a file from the explorer or prompt the agent to create one.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Agent Chat & Terminal */}
        <AgentConsole 
          history={workspace.history}
          isThinking={workspace.isThinking}
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={executeAgentTask}
        />
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <Settings 
          config={aiConfig}
          setConfig={(c) => {
            setAiConfig(c);
            checkAIConnection(c).then(setIsAiConnected);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

    </div>
  );
}
