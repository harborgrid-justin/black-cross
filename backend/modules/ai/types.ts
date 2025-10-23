/**
 * AI Module - Type Definitions
 * Adapted from OpenCTI Platform
 */

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE_OPENAI = 'azure_openai',
  CUSTOM = 'custom'
}

export interface LLMConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

export enum AIOperation {
  FIX_SPELLING = 'fix_spelling',
  MAKE_SHORTER = 'make_shorter',
  MAKE_LONGER = 'make_longer',
  CHANGE_TONE = 'change_tone',
  SUMMARIZE = 'summarize',
  GENERATE_REPORT = 'generate_report',
  ANALYZE_THREAT = 'analyze_threat',
  EXTRACT_IOCS = 'extract_iocs',
  NATURAL_LANGUAGE_QUERY = 'natural_language_query'
}

export enum ContentFormat {
  TEXT = 'text',
  MARKDOWN = 'markdown',
  HTML = 'html',
  JSON = 'json'
}

export enum ContentTone {
  PROFESSIONAL = 'professional',
  TECHNICAL = 'technical',
  EXECUTIVE = 'executive',
  CASUAL = 'casual'
}

export interface AIUsageLog {
  id: string;
  user_id: string;
  operation: AIOperation;
  provider: AIProvider;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost?: number;
  duration_ms: number;
  created_at: Date;
}
