import React, { useState, useEffect } from 'react';
import { X, Save, Cpu, Settings as SettingsIcon, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { AIConfig, fetchAvailableModels } from '../agent/LocalAI';

interface SettingsProps {
  config: AIConfig;
  setConfig: (c: AIConfig) => void;
  onClose: () => void;
}

export default function Settings({ config, setConfig, onClose }: SettingsProps) {
  const [provider, setProvider] = useState(config.provider);
  const [ollamaUrl, setOllamaUrl] = useState(config.ollamaUrl);
  const [lmstudioUrl, setLmstudioUrl] = useState(config.lmstudioUrl);
  const [geminiApiKey, setGeminiApiKey] = useState(config.geminiApiKey);
  const [model, setModel] = useState(config.model);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch models whenever provider or connection parameters change
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      const models = await fetchAvailableModels({
        provider,
        ollamaUrl,
        lmstudioUrl,
        geminiApiKey,
        model
      });
      setAvailableModels(models);
      if (models.length > 0 && !models.includes(model)) {
        setModel(models[0]);
      }
      setLoadingModels(false);
    };
    loadModels();
  }, [provider, ollamaUrl, lmstudioUrl, geminiApiKey]);

  const handleSave = () => {
    setConfig({
      provider,
      ollamaUrl,
      lmstudioUrl,
      geminiApiKey,
      model
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0b]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-[#111113] border border-[#212124] rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#212124] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-[#00ffcc]" />
            <h2 className="text-sm font-semibold tracking-wide uppercase">AI Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-[#1d1d23] text-[#52525b] hover:text-[#f3f3f5] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 font-sans text-xs">
          
          {/* Provider Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[#8c8c99] font-medium">AI Provider</span>
            <div className="grid grid-cols-3 gap-2">
              {(['ollama', 'lmstudio', 'gemini'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => {
                    setProvider(p);
                    if (p === 'gemini') setModel('gemini-2.5-flash');
                  }}
                  className={`py-2 px-3 rounded border text-center font-mono capitalize transition-all ${
                    provider === p
                      ? 'bg-[#00ffcc]/10 border-[#00ffcc] text-[#00ffcc]'
                      : 'bg-[#16161a] border-[#212124] text-[#8c8c99] hover:bg-[#1d1d23]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Input */}
          {provider === 'ollama' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[#8c8c99] font-medium">Ollama Endpoint URL</span>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full bg-[#16161a] border border-[#212124] rounded-md px-3 py-2 font-mono text-[#f3f3f5] focus:outline-none focus:border-[#00ffcc]"
              />
            </div>
          )}

          {provider === 'lmstudio' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[#8c8c99] font-medium">LM Studio Endpoint URL</span>
              <input
                type="text"
                value={lmstudioUrl}
                onChange={(e) => setLmstudioUrl(e.target.value)}
                className="w-full bg-[#16161a] border border-[#212124] rounded-md px-3 py-2 font-mono text-[#f3f3f5] focus:outline-none focus:border-[#00ffcc]"
              />
            </div>
          )}

          {provider === 'gemini' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[#8c8c99] font-medium flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-[#ffd60a]" /> Gemini API Key
              </span>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-[#16161a] border border-[#212124] rounded-md px-3 py-2 font-mono text-[#f3f3f5] focus:outline-none focus:border-[#00ffcc]"
              />
            </div>
          )}

          {/* Model Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[#8c8c99] font-medium">Select Model</span>
            {loadingModels ? (
              <div className="w-full bg-[#16161a] border border-[#212124] rounded-md px-3 py-2 text-[#52525b] font-mono animate-pulse">
                Fetching models...
              </div>
            ) : availableModels.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#16161a] border border-[#212124] rounded-md px-3 py-2 text-[#f3f3f5] font-mono focus:outline-none focus:border-[#00ffcc]"
              >
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-[#ff453a]/5 border border-[#ff453a]/25 text-[#ff453a] rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>No models found. Ensure local LLM server is active and CORS is enabled.</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-[#212124] bg-[#16161a] flex items-center justify-end gap-2">
          <button 
            onClick={onClose}
            className="py-1.5 px-4 rounded border border-[#212124] hover:bg-[#1d1d23] text-[#8c8c99] hover:text-[#f3f3f5] transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="py-1.5 px-4 rounded bg-[#00ffcc] hover:bg-[#00b390] text-[#0a0a0b] font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_var(--accent-glow)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
}
