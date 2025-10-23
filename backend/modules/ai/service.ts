/**
 * AI Service - Content Generation and Analysis
 * Adapted from OpenCTI Platform
 */

import { LLMClient, createLLMClientFromEnv } from './llm-client';
import type { ContentFormat, ContentTone, AIOperation, AIUsageLog } from './types';
import type { User } from '../../models/User';

const SYSTEM_PROMPT = 'You are an assistant helping cyber threat intelligence analysts to generate text about cyber threat intelligence information or from a cyber threat intelligence knowledge graph based on the STIX 2.1 model.';

export class AIService {
  private client: LLMClient | null;
  private usageLogs: AIUsageLog[] = [];

  constructor(client?: LLMClient) {
    this.client = client || createLLMClientFromEnv();
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Fix spelling and grammar in content
   */
  async fixSpelling(
    content: string,
    format: ContentFormat = ContentFormat.TEXT,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    if (content.length < 5) {
      throw new Error('Content is too short');
    }

    const prompt = `
# Instructions
- Examine the provided text for any spelling mistakes and correct them accordingly in the original language of the text.
- Ensure that all words are accurately spelled and that the grammar is correct.
- If no mistake is detected, just return the original text without anything else.
- Do NOT change the length of the text.
- Your response should match the provided content format which is ${format}. Be sure to respect this format and to NOT output anything else than the format and the intended content.

# Content
${content}
    `;

    return await this.executeAI(AIOperation.FIX_SPELLING, prompt, user);
  }

  /**
   * Make content shorter
   */
  async makeShorter(
    content: string,
    format: ContentFormat = ContentFormat.TEXT,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    if (content.length < 5) {
      throw new Error('Content is too short');
    }

    const prompt = `
# Instructions
- Examine the provided text related to cybersecurity and cyber threat intelligence and make it shorter by dividing by 2 the size/length of the text or the number of paragraphs.
- Make it shorter by dividing by 2 the number of lines but you should keep the main ideas and concepts as well as original language of the text.
- Do NOT summarize nor enumerate points.
- Ensure that all words are accurately spelled and that the grammar is correct.
- Your response should match the provided content format which is ${format}. Be sure to respect this format and to NOT output anything else than the format.

# Content
${content}
    `;

    return await this.executeAI(AIOperation.MAKE_SHORTER, prompt, user);
  }

  /**
   * Make content longer
   */
  async makeLonger(
    content: string,
    format: ContentFormat = ContentFormat.TEXT,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    if (content.length < 5) {
      throw new Error('Content is too short');
    }

    const prompt = `
# Instructions
- Examine the provided text related to cybersecurity and cyber threat intelligence and make it longer by adding relevant details and expanding on the key points.
- Double the length while maintaining the original meaning and style.
- Add technical details, examples, or elaboration where appropriate.
- Ensure that all words are accurately spelled and that the grammar is correct.
- Your response should match the provided content format which is ${format}.

# Content
${content}
    `;

    return await this.executeAI(AIOperation.MAKE_LONGER, prompt, user);
  }

  /**
   * Change the tone of content
   */
  async changeTone(
    content: string,
    tone: ContentTone,
    format: ContentFormat = ContentFormat.TEXT,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    const prompt = `
# Instructions
- Rewrite the following cyber threat intelligence text in a ${tone} tone.
- Maintain all the factual information and key points.
- Adjust the language style and vocabulary to match the ${tone} tone.
- Your response should match the provided content format which is ${format}.

# Content
${content}
    `;

    return await this.executeAI(AIOperation.CHANGE_TONE, prompt, user);
  }

  /**
   * Summarize content
   */
  async summarize(
    content: string,
    format: ContentFormat = ContentFormat.TEXT,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    const prompt = `
# Instructions
- Create a concise summary of the following cyber threat intelligence content.
- Extract the most important points and key findings.
- Keep the summary to about 20-30% of the original length.
- Maintain technical accuracy and all critical details.
- Your response should match the provided content format which is ${format}.

# Content
${content}
    `;

    return await this.executeAI(AIOperation.SUMMARIZE, prompt, user);
  }

  /**
   * Generate a threat intelligence report
   */
  async generateReport(
    data: {
      title: string;
      threats?: any[];
      incidents?: any[];
      vulnerabilities?: any[];
      iocs?: any[];
    },
    tone: ContentTone = ContentTone.PROFESSIONAL,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    const prompt = `
# Instructions
- Generate a comprehensive cyber threat intelligence report in a ${tone} tone.
- Include an executive summary, findings, threat analysis, and recommendations.
- Use the provided data to create the report.
- Ensure the report is well-structured and professional.
- Output in markdown format.

# Data
${JSON.stringify(data, null, 2)}
    `;

    return await this.executeAI(AIOperation.GENERATE_REPORT, prompt, user);
  }

  /**
   * Analyze a threat
   */
  async analyzeThreat(
    threatData: any,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    const prompt = `
# Instructions
- Analyze the following cyber threat intelligence data.
- Assess the threat level and potential impact.
- Identify key indicators of compromise (IOCs).
- Suggest mitigation strategies and defensive measures.
- Provide a risk assessment.

# Threat Data
${JSON.stringify(threatData, null, 2)}
    `;

    return await this.executeAI(AIOperation.ANALYZE_THREAT, prompt, user);
  }

  /**
   * Extract IOCs from text
   */
  async extractIOCs(
    text: string,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    const prompt = `
# Instructions
- Extract all Indicators of Compromise (IOCs) from the following text.
- Identify IP addresses, domains, URLs, file hashes, email addresses, etc.
- Format the output as JSON with categories.
- Include confidence levels for each IOC.

# Text
${text}
    `;

    return await this.executeAI(AIOperation.EXTRACT_IOCS, prompt, user);
  }

  /**
   * Execute AI request and log usage
   */
  private async executeAI(
    operation: AIOperation,
    userPrompt: string,
    user?: User
  ): Promise<string> {
    if (!this.client) {
      throw new Error('AI service not configured');
    }

    const startTime = Date.now();

    const response = await this.client.complete({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt
    });

    const duration = Date.now() - startTime;

    // Log usage
    if (user) {
      const usageLog: AIUsageLog = {
        id: `${Date.now()}-${Math.random()}`,
        user_id: user.id,
        operation,
        provider: this.client.getConfig().provider,
        model: response.model,
        prompt_tokens: response.usage.promptTokens,
        completion_tokens: response.usage.completionTokens,
        total_tokens: response.usage.totalTokens,
        duration_ms: duration,
        created_at: new Date()
      };

      this.usageLogs.push(usageLog);
      // TODO: Save to database
    }

    return response.text;
  }

  /**
   * Get usage statistics for a user
   */
  getUserUsage(userId: string, days: number = 30): AIUsageLog[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.usageLogs.filter(
      log => log.user_id === userId && log.created_at >= cutoffDate
    );
  }

  /**
   * Get total token usage for a user
   */
  getUserTokenUsage(userId: string, days: number = 30): number {
    const logs = this.getUserUsage(userId, days);
    return logs.reduce((sum, log) => sum + log.total_tokens, 0);
  }
}

/**
 * Singleton instance
 */
export const aiService = new AIService();
