export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIConfig {
  provider: 'ollama' | 'lmstudio' | 'gemini';
  ollamaUrl: string;
  lmstudioUrl: string;
  geminiApiKey: string;
  model: string;
}

export const DEFAULT_CONFIG: AIConfig = {
  provider: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  lmstudioUrl: 'http://localhost:1234',
  geminiApiKey: '',
  model: 'qwen2.5-coder:7b'
};

export async function checkAIConnection(config: AIConfig): Promise<boolean> {
  try {
    if (config.provider === 'ollama') {
      const res = await fetch(`${config.ollamaUrl}/api/tags`);
      return res.ok;
    } else if (config.provider === 'lmstudio') {
      const res = await fetch(`${config.lmstudioUrl}/v1/models`);
      return res.ok;
    } else if (config.provider === 'gemini') {
      return config.geminiApiKey.length > 5;
    }
    return false;
  } catch (e) {
    console.error("AI connection failed", e);
    return false;
  }
}

export async function fetchAvailableModels(config: AIConfig): Promise<string[]> {
  try {
    if (config.provider === 'ollama') {
      const res = await fetch(`${config.ollamaUrl}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        return data.models.map((m: any) => m.name);
      }
    } else if (config.provider === 'lmstudio') {
      const res = await fetch(`${config.lmstudioUrl}/v1/models`);
      if (res.ok) {
        const data = await res.json();
        return data.data.map((m: any) => m.id);
      }
    } else if (config.provider === 'gemini') {
      return ['gemini-2.5-flash', 'gemini-2.5-pro'];
    }
  } catch (e) {
    console.error("Failed to fetch models", e);
  }
  return [];
}

export async function generateAIResponse(
  config: AIConfig,
  messages: Message[],
  systemPrompt?: string
): Promise<string> {
  const formattedMessages = [...messages];
  if (systemPrompt) {
    formattedMessages.unshift({ role: 'system', content: systemPrompt });
  }

  if (config.provider === 'ollama') {
    const response = await fetch(`${config.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: formattedMessages,
        stream: false
      })
    });
    if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
    const data = await response.json();
    return data.message.content;
  } 
  
  if (config.provider === 'lmstudio') {
    const response = await fetch(`${config.lmstudioUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: formattedMessages,
        stream: false
      })
    });
    if (!response.ok) throw new Error(`LM Studio error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  if (config.provider === 'gemini') {
    const apiKey = config.geminiApiKey;
    if (!apiKey) throw new Error("Gemini API key is required");
    
    // Map roles to gemini model contents
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );
    if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Unsupported AI Provider selected");
}
