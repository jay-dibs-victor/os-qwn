/**
 * LLM Factory — Adaptive provider pattern.
 *
 * Switch between LLM backends by setting the LLM_PROVIDER environment variable:
 *   LLM_PROVIDER=ollama     → local Ollama (default, no API key needed)
 *   LLM_PROVIDER=openai     → OpenAI (requires OPENAI_API_KEY)
 *   LLM_PROVIDER=anthropic  → Anthropic Claude (requires ANTHROPIC_API_KEY)
 *   LLM_PROVIDER=groq       → Groq (requires GROQ_API_KEY)
 *
 * All providers return a LangChain BaseChatModel, making them interchangeable
 * throughout the system with zero changes to the agent or tool layer.
 */

import { BaseChatModel } from '@langchain/core/language_models/chat_models';

// ─── Provider Enum ────────────────────────────────────────────────────────────

export enum LLMProvider {
  OLLAMA    = 'ollama',
  OPENAI    = 'openai',
  ANTHROPIC = 'anthropic',
  GROQ      = 'groq',
}

// ─── Provider Config ─────────────────────────────────────────────────────────

interface LLMConfig {
  provider: LLMProvider;
  model?: string;
  temperature?: number;
  baseUrl?: string;
}

function resolveConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || LLMProvider.OLLAMA) as LLMProvider;

  const defaults: Record<LLMProvider, Partial<LLMConfig>> = {
    [LLMProvider.OLLAMA]: {
      model:    process.env.OLLAMA_MODEL   || 'llama3',
      baseUrl:  process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      temperature: 0,
    },
    [LLMProvider.OPENAI]: {
      model:    process.env.OPENAI_MODEL   || 'gpt-4o-mini',
      temperature: 0,
    },
    [LLMProvider.ANTHROPIC]: {
      model:    process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      temperature: 0,
    },
    [LLMProvider.GROQ]: {
      model:    process.env.GROQ_MODEL     || 'llama3-8b-8192',
      temperature: 0,
    },
  };

  return { provider, ...defaults[provider] };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export class LLMFactory {
  private static instance: BaseChatModel | null = null;

  /**
   * Returns a singleton LLM instance for the configured provider.
   * Call `LLMFactory.reset()` to force re-instantiation (e.g. in tests).
   */
  static async create(config?: Partial<LLMConfig>): Promise<BaseChatModel> {
    if (this.instance) return this.instance;

    const resolved = { ...resolveConfig(), ...config };

    console.log(`[LLMFactory] Using provider: ${resolved.provider} | model: ${resolved.model}`);

    switch (resolved.provider) {
      case LLMProvider.OLLAMA:
        this.instance = await this.createOllama(resolved);
        break;

      case LLMProvider.OPENAI:
        this.instance = await this.createOpenAI(resolved);
        break;

      case LLMProvider.ANTHROPIC:
        this.instance = await this.createAnthropic(resolved);
        break;

      case LLMProvider.GROQ:
        this.instance = await this.createGroq(resolved);
        break;

      default:
        console.warn(`[LLMFactory] Unknown provider "${resolved.provider}", falling back to Ollama`);
        this.instance = await this.createOllama(resolved);
    }

    return this.instance;
  }

  static reset() {
    this.instance = null;
  }

  // ─── Provider Adapters ──────────────────────────────────────────────────────

  private static async createOllama(config: LLMConfig): Promise<BaseChatModel> {
    const { ChatOllama } = await import('@langchain/ollama');
    return new ChatOllama({
      baseUrl: config.baseUrl,
      model:   config.model!,
      temperature: config.temperature ?? 0,
    }) as any;
  }

  private static async createOpenAI(config: LLMConfig): Promise<BaseChatModel> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('[LLMFactory] OPENAI_API_KEY is required for the OpenAI provider.');
    }
    const { ChatOpenAI } = await import('@langchain/openai');
    return new ChatOpenAI({
      modelName:   config.model,
      temperature: config.temperature ?? 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    }) as any;
  }

  private static async createAnthropic(config: LLMConfig): Promise<BaseChatModel> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('[LLMFactory] ANTHROPIC_API_KEY is required for the Anthropic provider.');
    }
    const { ChatAnthropic } = await import('@langchain/anthropic');
    return new ChatAnthropic({
      modelName:    config.model,
      temperature:  config.temperature ?? 0,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    }) as any;
  }

  private static async createGroq(config: LLMConfig): Promise<BaseChatModel> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('[LLMFactory] GROQ_API_KEY is required for the Groq provider.');
    }
    // Groq uses the OpenAI-compatible SDK
    const { ChatOpenAI } = await import('@langchain/openai');
    return new ChatOpenAI({
      modelName:   config.model,
      temperature: config.temperature ?? 0,
      openAIApiKey: process.env.GROQ_API_KEY,
      configuration: {
        baseURL: 'https://api.groq.com/openai/v1',
      },
    }) as any;
  }
}
