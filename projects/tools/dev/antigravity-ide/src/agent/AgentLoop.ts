import { generateAIResponse, AIConfig, Message } from './LocalAI';

export interface FileItem {
  path: string;
  name: string;
  isDir: boolean;
  content?: string;
  children?: string[]; // paths of children
}

export interface AgentStep {
  id: string;
  timestamp: string;
  type: 'thinking' | 'tool_call' | 'tool_output' | 'done' | 'error';
  title: string;
  description: string;
  toolName?: string;
  toolArgs?: string;
}

export interface WorkspaceState {
  files: Record<string, FileItem>;
  openFilePath: string | null;
  history: AgentStep[];
  isThinking: boolean;
}

const AGENT_SYSTEM_PROMPT = `You are Antigravity 2.0, a high-performance agentic coding assistant.
You can read/write files and execute workspace tasks.
When the user asks you to do something, you must reason step-by-step and decide which tools to call.

You have access to the following tools:
1. READ_FILE: {"path": "filename"}
2. WRITE_FILE: {"path": "filename", "content": "text"}
3. LIST_DIR: {"path": "directory"}
4. RUN_COMMAND: {"command": "npm run dev", "cwd": "path"}

You must format your responses in strict JSON format containing a list of actions or thinking:
{
  "thinking": "Your current step-by-step thoughts",
  "toolCall": {
    "name": "READ_FILE" | "WRITE_FILE" | "LIST_DIR" | "RUN_COMMAND",
    "arguments": { ... }
  },
  "finalAnswer": "Explanation to the user when finished (leave null if still working)"
}`;

export async function runAgentStep(
  config: AIConfig,
  userPrompt: string,
  state: WorkspaceState,
  onUpdate: (step: AgentStep, newState: WorkspaceState) => void,
  executeTool: (name: string, args: any) => Promise<string>
): Promise<void> {
  const steps = [...state.history];
  
  // 1. Thinking step
  const thinkingStep: AgentStep = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    type: 'thinking',
    title: 'Thinking...',
    description: 'Analyzing workspace files and planning implementation strategy.'
  };
  steps.push(thinkingStep);
  onUpdate(thinkingStep, { ...state, history: steps, isThinking: true });

  try {
    // Collect context
    const fileSummary = Object.keys(state.files).map(p => `- ${p} (${state.files[p].isDir ? 'dir' : 'file'})`).join('\n');
    const conversationHistory: Message[] = [
      {
        role: 'user',
        content: `Workspace files:\n${fileSummary}\n\nActive File: ${state.openFilePath || 'None'}\n\nTask: ${userPrompt}\n\nExecute the next action.`
      }
    ];

    const aiResponse = await generateAIResponse(config, conversationHistory, AGENT_SYSTEM_PROMPT);
    let parsedResponse;
    try {
      // Look for JSON block
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsedResponse = JSON.parse(aiResponse.substring(jsonStart, jsonEnd + 1));
      } else {
        parsedResponse = JSON.parse(aiResponse);
      }
    } catch (e) {
      // Fallback
      parsedResponse = {
        thinking: aiResponse,
        toolCall: null,
        finalAnswer: "I've processed your request but had trouble formatting the tool calls. " + aiResponse
      };
    }

    // Update thinking step description with agent thoughts
    thinkingStep.description = parsedResponse.thinking || "Finished analyzing workspace.";
    onUpdate(thinkingStep, { ...state, history: steps });

    // 2. Tool Call step if any
    if (parsedResponse.toolCall) {
      const toolCallStep: AgentStep = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type: 'tool_call',
        title: `Executing ${parsedResponse.toolCall.name}`,
        description: `Running with args: ${JSON.stringify(parsedResponse.toolCall.arguments)}`,
        toolName: parsedResponse.toolCall.name,
        toolArgs: JSON.stringify(parsedResponse.toolCall.arguments)
      };
      steps.push(toolCallStep);
      onUpdate(toolCallStep, { ...state, history: steps });

      // Execute tool
      const toolOutput = await executeTool(parsedResponse.toolCall.name, parsedResponse.toolCall.arguments);
      
      const toolOutputStep: AgentStep = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type: 'tool_output',
        title: `Tool Output - ${parsedResponse.toolCall.name}`,
        description: toolOutput.substring(0, 150) + (toolOutput.length > 150 ? '...' : '')
      };
      steps.push(toolOutputStep);
      onUpdate(toolOutputStep, { ...state, history: steps, isThinking: false });

      // Run another auto step recursively if not completed
      if (!parsedResponse.finalAnswer) {
        setTimeout(() => {
          runAgentStep(config, userPrompt, { ...state, history: steps }, onUpdate, executeTool);
        }, 1200);
      }
    } else if (parsedResponse.finalAnswer) {
      // Done step
      const doneStep: AgentStep = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type: 'done',
        title: 'Task Completed',
        description: parsedResponse.finalAnswer
      };
      steps.push(doneStep);
      onUpdate(doneStep, { ...state, history: steps, isThinking: false });
    }

  } catch (err: any) {
    const errorStep: AgentStep = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type: 'error',
      title: 'Execution Error',
      description: err.message || 'An unexpected error occurred during execution.'
    };
    steps.push(errorStep);
    onUpdate(errorStep, { ...state, history: steps, isThinking: false });
  }
}
