/**
 * AI Service - Content Generation and Analysis
 *
 * Provides AI-powered content manipulation and threat intelligence analysis capabilities
 * using Large Language Models (LLMs). This service supports multiple operations including
 * spell checking, content summarization, tone adjustment, threat analysis, and IOC extraction.
 *
 * Adapted from OpenCTI Platform with enhancements for cyber threat intelligence workflows.
 *
 * @module AIService
 */

import { LLMClient, createLLMClientFromEnv } from './llm-client';
import { ContentFormat, ContentTone, AIOperation } from './types';
import type { AIUsageLog } from './types';
import User from '../../models/User';

/**
 * System prompt that establishes the AI assistant's role and expertise domain.
 * This prompt is prepended to all AI operations to ensure context-aware responses
 * focused on cyber threat intelligence and STIX 2.1 model compliance.
 *
 * @constant {string}
 */
const SYSTEM_PROMPT = 'You are an assistant helping cyber threat intelligence analysts to generate text about cyber threat intelligence information or from a cyber threat intelligence knowledge graph based on the STIX 2.1 model.';

/**
 * AI Service for content generation, manipulation, and threat intelligence analysis.
 *
 * This service provides a comprehensive suite of AI-powered operations for cyber threat
 * intelligence workflows, including content editing, threat analysis, IOC extraction,
 * and report generation. It integrates with various LLM providers (OpenAI, Anthropic,
 * Mistral, LocalAI) and tracks usage metrics for monitoring and billing purposes.
 *
 * Features:
 * - Content manipulation (spelling fixes, length adjustments, tone changes)
 * - Threat intelligence analysis and risk assessment
 * - Indicator of Compromise (IOC) extraction from unstructured text
 * - Automated report generation
 * - Usage tracking and analytics
 *
 * @class AIService
 * @example
 * ```typescript
 * const aiService = new AIService();
 *
 * if (aiService.isAvailable()) {
 *   const corrected = await aiService.fixSpelling(
 *     'Ths is a thret report',
 *     ContentFormat.TEXT,
 *     currentUser
 *   );
 *   console.log(corrected); // "This is a threat report"
 * }
 * ```
 */
export class AIService {
  /**
   * LLM client instance for making AI completion requests.
   * Null if AI service is not configured or unavailable.
   *
   * @private
   * @type {LLMClient | null}
   */
  private client: LLMClient | null;

  /**
   * In-memory log of AI operations for usage tracking and analytics.
   * TODO: Persist to database for long-term storage and reporting.
   *
   * @private
   * @type {AIUsageLog[]}
   */
  private usageLogs: AIUsageLog[] = [];

  /**
   * Creates an instance of AIService.
   *
   * If no client is provided, attempts to create one from environment variables.
   * The service will be unavailable if client creation fails (missing API keys, etc.).
   *
   * @param {LLMClient} [client] - Optional pre-configured LLM client instance
   *
   * @example
   * ```typescript
   * // Create with default environment configuration
   * const service = new AIService();
   *
   * // Create with custom client
   * const customClient = new LLMClient({ provider: 'openai', apiKey: 'sk-...' });
   * const customService = new AIService(customClient);
   * ```
   */
  constructor(client?: LLMClient) {
    this.client = client || createLLMClientFromEnv();
  }

  /**
   * Checks if the AI service is available and ready to process requests.
   *
   * Returns false if the LLM client could not be initialized (e.g., missing
   * API keys or invalid configuration). Always check availability before
   * calling AI operations to avoid runtime errors.
   *
   * @returns {boolean} True if AI service is configured and available, false otherwise
   *
   * @example
   * ```typescript
   * if (!aiService.isAvailable()) {
   *   throw new Error('AI service not configured - check environment variables');
   * }
   * ```
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Corrects spelling and grammar mistakes in cyber threat intelligence content.
   *
   * This operation examines the provided text for spelling errors and grammatical issues,
   * correcting them while preserving the original language, tone, and length. If no
   * mistakes are detected, the original content is returned unchanged. The AI maintains
   * the specified format (text, markdown, HTML, etc.) and does not add extra commentary.
   *
   * @param {string} content - The text content to fix (minimum 5 characters)
   * @param {ContentFormat} [format=ContentFormat.TEXT] - Output format to maintain
   * @param {User} [user] - Optional user for usage tracking and analytics
   * @returns {Promise<string>} The corrected content with fixed spelling and grammar
   * @throws {Error} If AI service is not configured
   * @throws {Error} If content is shorter than 5 characters
   *
   * @example
   * ```typescript
   * const content = 'Teh APT28 grup has ben activ since 2007.';
   * const fixed = await aiService.fixSpelling(content, ContentFormat.TEXT);
   * console.log(fixed); // "The APT28 group has been active since 2007."
   * ```
   *
   * @example
   * ```typescript
   * // With markdown format
   * const markdown = '# Thret Report\n\nTeh attack occured on **Decembar** 1st.';
   * const fixed = await aiService.fixSpelling(markdown, ContentFormat.MARKDOWN, user);
   * // Returns: "# Threat Report\n\nThe attack occurred on **December** 1st."
   * ```
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
   * Condenses content to approximately half its original length.
   *
   * Reduces cybersecurity and threat intelligence text by approximately 50% while
   * preserving the main ideas, concepts, and original language. Unlike summarization,
   * this operation maintains the original writing style and narrative flow without
   * converting content into enumerated points or bullet lists.
   *
   * @param {string} content - The text content to condense (minimum 5 characters)
   * @param {ContentFormat} [format=ContentFormat.TEXT] - Output format to maintain
   * @param {User} [user] - Optional user for usage tracking and analytics
   * @returns {Promise<string>} The condensed content at approximately half the original length
   * @throws {Error} If AI service is not configured
   * @throws {Error} If content is shorter than 5 characters
   *
   * @example
   * ```typescript
   * const longReport = `
   *   The threat actor APT28, also known as Fancy Bear, has been conducting
   *   sophisticated cyber espionage campaigns since 2007. They primarily target
   *   government, military, and security organizations across Europe and North America.
   *   Their tactics include spear-phishing, zero-day exploits, and custom malware.
   * `;
   * const shorter = await aiService.makeShorter(longReport);
   * // Returns condensed version maintaining key facts but at half the length
   * ```
   *
   * @remarks
   * This operation differs from {@link summarize} by maintaining the original prose
   * style rather than creating an executive summary. Use this when you need concise
   * content that retains the original document structure and tone.
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
   * Expands content to approximately double its original length.
   *
   * Enriches cybersecurity and threat intelligence text by adding relevant technical
   * details, examples, and elaboration while maintaining the original meaning and style.
   * The expansion focuses on providing deeper insights, additional context, and more
   * comprehensive explanations without introducing unrelated information.
   *
   * @param {string} content - The text content to expand (minimum 5 characters)
   * @param {ContentFormat} [format=ContentFormat.TEXT] - Output format to maintain
   * @param {User} [user] - Optional user for usage tracking and analytics
   * @returns {Promise<string>} The expanded content at approximately double the original length
   * @throws {Error} If AI service is not configured
   * @throws {Error} If content is shorter than 5 characters
   *
   * @example
   * ```typescript
   * const brief = 'APT28 uses spear-phishing and zero-day exploits.';
   * const expanded = await aiService.makeLonger(brief);
   * // Returns: "APT28, a sophisticated threat actor group attributed to Russian
   * // intelligence services, employs advanced spear-phishing campaigns that target
   * // high-value individuals with socially engineered emails. They complement these
   * // attacks with zero-day exploits, leveraging previously unknown vulnerabilities
   * // to bypass traditional security defenses..."
   * ```
   *
   * @remarks
   * Use this operation when you need to add depth and detail to brief reports,
   * executive summaries, or preliminary findings. The AI will add relevant technical
   * context and examples appropriate for threat intelligence documentation.
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
   * Adjusts the tone and writing style of threat intelligence content.
   *
   * Rewrites cyber threat intelligence text to match a specified tone (professional,
   * technical, casual, formal, etc.) while preserving all factual information and key
   * points. This operation adjusts language style, vocabulary, and presentation without
   * altering the underlying facts or technical accuracy.
   *
   * @param {string} content - The text content to rewrite
   * @param {ContentTone} tone - The desired tone (e.g., PROFESSIONAL, TECHNICAL, CASUAL)
   * @param {ContentFormat} [format=ContentFormat.TEXT] - Output format to maintain
   * @param {User} [user] - Optional user for usage tracking and analytics
   * @returns {Promise<string>} The rewritten content in the specified tone
   * @throws {Error} If AI service is not configured
   *
   * @example
   * ```typescript
   * const technical = 'The adversary leveraged CVE-2024-1234 to achieve RCE.';
   * const casual = await aiService.changeTone(
   *   technical,
   *   ContentTone.CASUAL,
   *   ContentFormat.TEXT
   * );
   * // Returns: "The attacker used a security flaw (CVE-2024-1234) to run
   * // code remotely on the target system."
   * ```
   *
   * @example
   * ```typescript
   * // Convert to formal executive summary tone
   * const finding = 'We found a bunch of IOCs pointing to APT28.';
   * const formal = await aiService.changeTone(finding, ContentTone.FORMAL);
   * // Returns: "Analysis identified multiple indicators of compromise
   * // attributed to the APT28 threat actor group."
   * ```
   *
   * @see {@link ContentTone} for available tone options
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
   * Creates a concise executive summary of threat intelligence content.
   *
   * Distills cyber threat intelligence text into a focused summary containing the most
   * important points and key findings. The summary is approximately 20-30% of the
   * original length while maintaining technical accuracy and all critical details.
   * Unlike {@link makeShorter}, this operation produces a standalone summary rather
   * than a condensed version of the original prose.
   *
   * @param {string} content - The text content to summarize
   * @param {ContentFormat} [format=ContentFormat.TEXT] - Output format for the summary
   * @param {User} [user] - Optional user for usage tracking and analytics
   * @returns {Promise<string>} A concise summary of the original content
   * @throws {Error} If AI service is not configured
   *
   * @example
   * ```typescript
   * const report = `
   *   [Long threat intelligence report with multiple sections about APT28's
   *   campaign, including detailed technical analysis, IOCs, TTPs, and timeline...]
   * `;
   * const summary = await aiService.summarize(report, ContentFormat.MARKDOWN);
   * // Returns: "## Executive Summary\n\nAPT28 conducted a sophisticated campaign
   * // targeting European government entities. Key findings include 15 IOCs,
   * // exploitation of CVE-2024-1234, and attribution to Russian intelligence..."
   * ```
   *
   * @remarks
   * Ideal for creating executive summaries, digest reports, or quick briefings.
   * The output is designed to stand alone and provide decision-makers with
   * essential information without requiring the full detailed report.
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
   * Generates a comprehensive threat intelligence report from structured data.
   *
   * Creates a professional threat intelligence report that includes an executive summary,
   * detailed findings, threat analysis, and actionable recommendations. The report
   * synthesizes information from multiple data sources (threats, incidents, vulnerabilities,
   * IOCs) into a cohesive, well-structured document formatted in markdown.
   *
   * @param {Object} data - Structured data to include in the report
   * @param {string} data.title - Report title
   * @param {any[]} [data.threats] - Threat actor profiles and campaigns
   * @param {any[]} [data.incidents] - Security incidents and breaches
   * @param {any[]} [data.vulnerabilities] - Identified vulnerabilities
   * @param {any[]} [data.iocs] - Indicators of Compromise
   * @param {ContentTone} [tone=ContentTone.PROFESSIONAL] - Report tone and style
   * @param {User} [user] - Optional user for usage tracking and analytics
   * @returns {Promise<string>} A comprehensive markdown-formatted threat intelligence report
   * @throws {Error} If AI service is not configured
   *
   * @example
   * ```typescript
   * const reportData = {
   *   title: 'Q4 2024 Threat Intelligence Report',
   *   threats: [
   *     { name: 'APT28', activity: 'High', targets: ['Government', 'Military'] }
   *   ],
   *   incidents: [
   *     { date: '2024-12-01', severity: 'Critical', affected: 'Agency X' }
   *   ],
   *   vulnerabilities: [
   *     { cve: 'CVE-2024-1234', cvss: 9.8, status: 'Unpatched' }
   *   ],
   *   iocs: [
   *     { type: 'domain', value: 'evil.com', confidence: 'High' }
   *   ]
   * };
   *
   * const report = await aiService.generateReport(reportData, ContentTone.FORMAL, user);
   * // Returns a comprehensive markdown report with sections for executive summary,
   * // threat landscape, incident analysis, vulnerability assessment, IOC listings,
   * // and strategic recommendations
   * ```
   *
   * @remarks
   * The generated report follows industry-standard threat intelligence reporting
   * formats and includes appropriate sections based on the provided data. Empty
   * data arrays will result in those sections being omitted from the final report.
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
   * Performs comprehensive threat analysis and risk assessment.
   *
   * Analyzes cyber threat intelligence data to assess threat level, potential impact,
   * and business risk. The analysis identifies key indicators of compromise (IOCs),
   * evaluates tactics, techniques, and procedures (TTPs), and provides actionable
   * mitigation strategies and defensive measures tailored to the threat profile.
   *
   * @param {any} threatData - Structured or semi-structured threat data (STIX objects, raw intel, etc.)
   * @param {User} [user] - Optional user for usage tracking and analytics
   * @returns {Promise<string>} Detailed threat analysis including risk assessment and recommendations
   * @throws {Error} If AI service is not configured
   *
   * @example
   * ```typescript
   * const threat = {
   *   actor: 'APT28',
   *   campaign: 'Operation XYZ',
   *   ttps: ['T1566.001', 'T1190', 'T1059.001'],
   *   targets: ['Government', 'Defense contractors'],
   *   observed: '2024-12-01',
   *   indicators: [
   *     { type: 'domain', value: 'malicious.com' },
   *     { type: 'ip', value: '192.0.2.1' }
   *   ]
   * };
   *
   * const analysis = await aiService.analyzeThreat(threat, user);
   * // Returns comprehensive analysis including:
   * // - Threat level assessment (Critical/High/Medium/Low)
   * // - Potential impact to organization
   * // - IOC analysis and validation
   * // - TTP breakdown and detection strategies
   * // - Mitigation recommendations prioritized by effectiveness
   * // - Risk score and business impact assessment
   * ```
   *
   * @remarks
   * The analysis incorporates MITRE ATT&CK framework TTPs, STIX 2.1 standards,
   * and industry best practices. Results can be used for threat briefings,
   * security posture assessments, or incident response planning.
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
   * Extracts Indicators of Compromise (IOCs) from unstructured text.
   *
   * Analyzes free-form text (threat reports, incident notes, emails, etc.) to identify
   * and extract cyber threat indicators including IP addresses, domains, URLs, file
   * hashes, email addresses, registry keys, and other artifacts. Results are formatted
   * as structured JSON with IOC categorization and confidence levels for each indicator.
   *
   * @param {string} text - Unstructured text containing potential IOCs
   * @param {User} [user] - Optional user for usage tracking and analytics
   * @returns {Promise<string>} JSON-formatted IOC extraction results with confidence levels
   * @throws {Error} If AI service is not configured
   *
   * @example
   * ```typescript
   * const report = `
   *   We observed traffic to 192.0.2.45 and malicious.example.com.
   *   The malware dropped a file with SHA256 hash
   *   a1b2c3d4e5f6... and connected to C2 server at https://evil.net/callback.
   *   Phishing emails originated from attacker@badguy.com.
   * `;
   *
   * const iocs = await aiService.extractIOCs(report, user);
   * // Returns JSON structure:
   * // {
   * //   "ip_addresses": [
   * //     { "value": "192.0.2.45", "confidence": "high" }
   * //   ],
   * //   "domains": [
   * //     { "value": "malicious.example.com", "confidence": "high" },
   * //     { "value": "evil.net", "confidence": "high" }
   * //   ],
   * //   "urls": [
   * //     { "value": "https://evil.net/callback", "confidence": "high" }
   * //   ],
   * //   "file_hashes": [
   * //     { "type": "SHA256", "value": "a1b2c3d4e5f6...", "confidence": "high" }
   * //   ],
   * //   "email_addresses": [
   * //     { "value": "attacker@badguy.com", "confidence": "medium" }
   * //   ]
   * // }
   * ```
   *
   * @remarks
   * The extraction uses pattern recognition and context analysis to identify IOCs
   * and assess their validity. Confidence levels indicate the likelihood that the
   * identified value is a genuine threat indicator vs. a false positive. The JSON
   * output can be directly ingested into SIEM, TIP, or other security platforms.
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
   * Executes an AI operation and tracks usage metrics.
   *
   * This private method serves as the central execution point for all AI operations.
   * It handles LLM client communication, measures performance, and logs detailed usage
   * statistics for monitoring, billing, and analytics purposes. The system prompt is
   * automatically prepended to establish the threat intelligence context.
   *
   * @private
   * @param {AIOperation} operation - The type of AI operation being performed
   * @param {string} userPrompt - The user-specific prompt with instructions and content
   * @param {User} [user] - Optional user for attribution and usage tracking
   * @returns {Promise<string>} The AI-generated text response
   * @throws {Error} If AI service is not configured
   * @throws {Error} If LLM API call fails (rate limits, authentication, network errors, etc.)
   *
   * @remarks
   * Usage logs are currently stored in-memory and should be persisted to the database
   * for production use. The TODO comment indicates this planned enhancement for
   * long-term storage, analytics dashboards, and billing integration.
   *
   * Performance timing includes the complete round-trip latency from API request
   * to response receipt, which is useful for monitoring LLM provider SLAs and
   * optimizing user experience.
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
   * Retrieves AI usage logs for a specific user within a time window.
   *
   * Queries the in-memory usage log collection to return all AI operations performed
   * by the specified user within the given time period. This is useful for generating
   * usage reports, tracking user activity, and analyzing AI feature adoption.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {number} [days=30] - Number of days to look back (default: 30 days)
   * @returns {AIUsageLog[]} Array of usage log entries for the user within the time window
   *
   * @example
   * ```typescript
   * // Get last 7 days of usage
   * const recentUsage = aiService.getUserUsage('user-123', 7);
   * console.log(`Operations performed: ${recentUsage.length}`);
   *
   * // Analyze operation types
   * const operations = recentUsage.map(log => log.operation);
   * const mostUsed = operations.reduce((acc, op) => {
   *   acc[op] = (acc[op] || 0) + 1;
   *   return acc;
   * }, {});
   * ```
   *
   * @remarks
   * In the current implementation, logs are stored in-memory and will be lost on
   * service restart. Production deployments should persist logs to a database for
   * accurate historical reporting and compliance requirements.
   *
   * @see {@link getUserTokenUsage} for aggregated token consumption metrics
   */
  getUserUsage(userId: string, days: number = 30): AIUsageLog[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.usageLogs.filter(
      log => log.user_id === userId && log.created_at >= cutoffDate
    );
  }

  /**
   * Calculates total token consumption for a user within a time window.
   *
   * Aggregates token usage across all AI operations for billing and quota management
   * purposes. This metric is essential for cost tracking, especially with token-based
   * LLM pricing models from providers like OpenAI, Anthropic, and others.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {number} [days=30] - Number of days to look back (default: 30 days)
   * @returns {number} Total number of tokens consumed (prompt + completion) by the user
   *
   * @example
   * ```typescript
   * // Check if user is approaching quota limit
   * const monthlyTokens = aiService.getUserTokenUsage('user-123', 30);
   * const QUOTA_LIMIT = 1_000_000; // 1M tokens per month
   *
   * if (monthlyTokens > QUOTA_LIMIT * 0.9) {
   *   console.warn(`User approaching quota limit: ${monthlyTokens}/${QUOTA_LIMIT}`);
   * }
   *
   * // Calculate approximate cost (example rates)
   * const COST_PER_1K_TOKENS = 0.002; // $0.002 per 1K tokens
   * const estimatedCost = (monthlyTokens / 1000) * COST_PER_1K_TOKENS;
   * console.log(`Estimated monthly cost: $${estimatedCost.toFixed(2)}`);
   * ```
   *
   * @remarks
   * Token counts include both prompt tokens (input) and completion tokens (output).
   * Different LLM providers may have different pricing tiers for input vs. output
   * tokens, so detailed cost calculations should reference the provider's pricing.
   *
   * @see {@link getUserUsage} for detailed operation-level usage logs
   */
  getUserTokenUsage(userId: string, days: number = 30): number {
    const logs = this.getUserUsage(userId, days);
    return logs.reduce((sum, log) => sum + log.total_tokens, 0);
  }
}

/**
 * Singleton instance of AIService for application-wide use.
 *
 * This pre-instantiated service instance is configured automatically from environment
 * variables and provides immediate access to AI capabilities without requiring manual
 * initialization. The singleton pattern ensures consistent configuration and shared
 * usage tracking across the entire application.
 *
 * @constant {AIService}
 *
 * @example
 * ```typescript
 * import { aiService } from './service';
 *
 * // Use in controllers or other services
 * export async function handleContentFix(req, res) {
 *   if (!aiService.isAvailable()) {
 *     return res.status(503).json({ error: 'AI service unavailable' });
 *   }
 *
 *   const fixed = await aiService.fixSpelling(req.body.content, req.body.format, req.user);
 *   res.json({ content: fixed });
 * }
 * ```
 *
 * @remarks
 * While the singleton pattern is convenient for most use cases, you can also create
 * custom AIService instances with specific configurations by using the class constructor
 * directly (e.g., for testing, multi-tenant scenarios, or provider-specific instances).
 */
export const aiService = new AIService();
