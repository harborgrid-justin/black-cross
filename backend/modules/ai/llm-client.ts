/**
 * LLM Client - Multi-Provider Support
 * Adapted from OpenCTI Platform
 */

import axios, { AxiosInstance } from 'axios';
import type { LLMConfig, LLMRequest, LLMResponse, AIProvider } from './types';

export class LLMClient {
  private config: LLMConfig;
  private axiosInstance: AxiosInstance;

  constructor(config: LLMConfig) {
    this.config = {
      maxTokens: 2000,
      temperature: 0.7,
      timeout: 30000,
      ...config
    };

    this.axiosInstance = axios.create({
      timeout: this.config.timeout
    });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      let response: LLMResponse;

      switch (this.config.provider) {
        case 'openai':
          response = await this.callOpenAI(request);
          break;
        case 'anthropic':
          response = await this.callAnthropic(request);
          break;
        case 'azure_openai':
          response = await this.callAzureOpenAI(request);
          break;
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }

      const duration = Date.now() - startTime;
      console.log(`AI request completed in ${duration}ms`);

      return response;
    } catch (error: any) {
      console.error('AI request failed:', error.message);
      throw new Error(`AI request failed: ${error.message}`);
    }
  }

  private async callOpenAI(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.axiosInstance.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.config.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt }
        ],
        temperature: request.temperature ?? this.config.temperature,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
      },
      model: response.data.model,
      finishReason: response.data.choices[0].finish_reason
    };
  }

  private async callAnthropic(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.axiosInstance.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.config.model,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        system: request.systemPrompt,
        messages: [
          { role: 'user', content: request.userPrompt }
        ]
      },
      {
        headers: {
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.content[0].text,
      usage: {
        promptTokens: response.data.usage.input_tokens,
        completionTokens: response.data.usage.output_tokens,
        totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
      },
      model: response.data.model,
      finishReason: response.data.stop_reason
    };
  }

  private async callAzureOpenAI(request: LLMRequest): Promise<LLMResponse> {
    if (!this.config.endpoint) {
      throw new Error('Azure OpenAI endpoint is required');
    }

    const response = await this.axiosInstance.post(
      `${this.config.endpoint}/openai/deployments/${this.config.model}/chat/completions?api-version=2023-05-15`,
      {
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt }
        ],
        temperature: request.temperature ?? this.config.temperature,
        max_tokens: request.maxTokens ?? this.config.maxTokens
      },
      {
        headers: {
          'api-key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
      },
      model: this.config.model,
      finishReason: response.data.choices[0].finish_reason
    };
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

/**
 * Factory function to create LLM client from environment
 */
export function createLLMClientFromEnv(): LLMClient | null {
  const provider = (process.env.AI_PROVIDER || 'openai') as AIProvider;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4';
  const endpoint = process.env.AI_ENDPOINT;

  if (!apiKey) {
    console.warn('AI_API_KEY not configured, AI features will be disabled');
    return null;
  }

  return new LLMClient({
    provider,
    apiKey,
    model,
    endpoint,
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.AI_TIMEOUT_MS || '30000')
  });
}
