/**
 * AI Agent — the core intelligence of the OS.
 *
 * Builds a LangChain tool-calling agent backed by the configured LLM provider.
 * Maintains conversation context per session via BufferMemory.
 * Publishes `os.ai.command.processed` events after each successful response.
 */
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { LLMFactory } from './llm.factory';
import { buildToolRegistry } from './tools/tool.registry';
import { getMemory } from './memory';
import { OSPublisher } from '../events/publisher';
import { OSEvent } from '../events/event.schemas';

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are AIOS — an AI Operating System assistant for a mobility and logistics platform.
You help users book rides, track shipments, search for flights, and get platform status.

You have access to the following tools:
{tools}

Tool names: {tool_names}

Rules:
- Always use a tool when the user's intent matches one. Never make up data.
- For ride requests, extract origin and destination carefully. Ask if unclear.
- For flight searches, always ask for the date if not provided.
- For shipment tracking, ask for the tracking number if not provided.
- Respond concisely and helpfully. Do not expose raw JSON to users — summarise results.
- If a tool returns an error, apologise and explain what went wrong.

Format your response as:
\`\`\`json
{{
  "action": "tool_name or Final Answer",
  "action_input": {{...input...}} or "final response string"
}}
\`\`\`
`.trim();

// ─── Agent Factory ────────────────────────────────────────────────────────────

let agentExecutor: AgentExecutor | null = null;

async function getAgentExecutor(): Promise<AgentExecutor> {
  if (agentExecutor) return agentExecutor;

  const llm   = await LLMFactory.create();
  const tools = buildToolRegistry();

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);

  const agent = await createStructuredChatAgent({ llm, tools, prompt });

  agentExecutor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    verbose: process.env.NODE_ENV !== 'production',
    handleParsingErrors: true,
    maxIterations: 5,
  });

  return agentExecutor;
}

// ─── Public Interface ─────────────────────────────────────────────────────────

export interface AgentInput {
  sessionId: string;
  userId: string;
  message: string;
}

export interface AgentOutput {
  sessionId: string;
  userId: string;
  response: string;
  intent?: string;
  toolsUsed?: string[];
  tokensUsed?: number;
}

export async function runAgent(input: AgentInput): Promise<AgentOutput> {
  const executor = await getAgentExecutor();
  const memory   = getMemory(input.sessionId);

  const memoryVars = await memory.loadMemoryVariables({});

  const result = await executor.invoke({
    input:        input.message,
    chat_history: memoryVars.chat_history || [],
    userId:       input.userId,   // available to tools via context
  });

  // Persist exchange in memory
  await memory.saveContext(
    { input: input.message },
    { output: result.output }
  );

  // Extract tools used from intermediate steps
  const toolsUsed: string[] = (result.intermediateSteps || [])
    .map((step: any) => step?.action?.tool)
    .filter(Boolean);

  // Publish result event
  await OSPublisher.publish(OSEvent.AI_COMMAND_PROCESSED, {
    sessionId: input.sessionId,
    userId:    input.userId,
    intent:    toolsUsed[0] || 'general_query',
    action:    toolsUsed.join(', ') || 'none',
    result:    { response: result.output },
    timestamp: new Date(),
  });

  return {
    sessionId:  input.sessionId,
    userId:     input.userId,
    response:   result.output,
    intent:     toolsUsed[0] || 'general_query',
    toolsUsed,
  };
}
