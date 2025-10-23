/**
 * AI Service Tests
 */

import { AIService } from '../service';
import { LLMClient } from '../llm-client';
import { ContentFormat, ContentTone, AIProvider } from '../types';
import type { LLMResponse } from '../types';

describe('AIService', () => {
  let mockClient: jest.Mocked<LLMClient>;
  let aiService: AIService;

  beforeEach(() => {
    // Create mock LLM client
    mockClient = {
      complete: jest.fn(),
      getConfig: jest.fn(),
      updateConfig: jest.fn()
    } as any;

    mockClient.getConfig.mockReturnValue({
      provider: AIProvider.OPENAI,
      apiKey: 'test-key',
      model: 'gpt-4'
    });

    aiService = new AIService(mockClient);
  });

  describe('isAvailable', () => {
    it('should return true when client is configured', () => {
      expect(aiService.isAvailable()).toBe(true);
    });

    it('should return false when client is null', () => {
      const service = new AIService(null as any);
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('fixSpelling', () => {
    it('should fix spelling in content', async () => {
      const mockResponse: LLMResponse = {
        text: 'Corrected text',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const result = await aiService.fixSpelling('Incorect text');

      expect(result).toBe('Corrected text');
      expect(mockClient.complete).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: expect.any(String),
          userPrompt: expect.stringContaining('Incorect text')
        })
      );
    });

    it('should throw error for short content', async () => {
      await expect(aiService.fixSpelling('abc'))
        .rejects.toThrow('Content is too short');
    });

    it('should throw error when client not configured', async () => {
      const service = new AIService(null as any);
      await expect(service.fixSpelling('test'))
        .rejects.toThrow('AI service not configured');
    });
  });

  describe('makeShorter', () => {
    it('should make content shorter', async () => {
      const mockResponse: LLMResponse = {
        text: 'Shorter content',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const longContent = 'This is a very long piece of content that needs to be shortened significantly.';
      const result = await aiService.makeShorter(longContent);

      expect(result).toBe('Shorter content');
      expect(mockClient.complete).toHaveBeenCalled();
    });
  });

  describe('makeLonger', () => {
    it('should make content longer', async () => {
      const mockResponse: LLMResponse = {
        text: 'Much longer and more detailed content with additional information',
        usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const shortContent = 'Brief content';
      const result = await aiService.makeLonger(shortContent);

      expect(result).toBe('Much longer and more detailed content with additional information');
      expect(mockClient.complete).toHaveBeenCalled();
    });
  });

  describe('changeTone', () => {
    it('should change content tone', async () => {
      const mockResponse: LLMResponse = {
        text: 'Professional version of content',
        usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const result = await aiService.changeTone(
        'Casual content',
        ContentTone.PROFESSIONAL
      );

      expect(result).toBe('Professional version of content');
      expect(mockClient.complete).toHaveBeenCalledWith(
        expect.objectContaining({
          userPrompt: expect.stringContaining('professional')
        })
      );
    });
  });

  describe('summarize', () => {
    it('should summarize content', async () => {
      const mockResponse: LLMResponse = {
        text: 'Summary of content',
        usage: { promptTokens: 20, completionTokens: 5, totalTokens: 25 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const longContent = 'Very long content that needs summarization...';
      const result = await aiService.summarize(longContent);

      expect(result).toBe('Summary of content');
      expect(mockClient.complete).toHaveBeenCalled();
    });
  });

  describe('generateReport', () => {
    it('should generate a threat intelligence report', async () => {
      const mockResponse: LLMResponse = {
        text: '# Threat Intelligence Report\n\n## Executive Summary\n...',
        usage: { promptTokens: 50, completionTokens: 200, totalTokens: 250 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const data = {
        title: 'Monthly Threat Report',
        threats: [{ name: 'APT29', severity: 'high' }],
        incidents: [{ id: '123', type: 'malware' }]
      };

      const result = await aiService.generateReport(data);

      expect(result).toContain('Threat Intelligence Report');
      expect(mockClient.complete).toHaveBeenCalled();
    });
  });

  describe('analyzeThreat', () => {
    it('should analyze threat data', async () => {
      const mockResponse: LLMResponse = {
        text: 'Threat analysis: High severity, recommend immediate action',
        usage: { promptTokens: 30, completionTokens: 20, totalTokens: 50 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const threatData = {
        name: 'Ransomware Attack',
        indicators: ['malicious.exe', '192.168.1.1']
      };

      const result = await aiService.analyzeThreat(threatData);

      expect(result).toContain('Threat analysis');
      expect(mockClient.complete).toHaveBeenCalled();
    });
  });

  describe('extractIOCs', () => {
    it('should extract IOCs from text', async () => {
      const mockResponse: LLMResponse = {
        text: JSON.stringify({
          ips: ['192.168.1.1', '10.0.0.1'],
          domains: ['evil.com'],
          hashes: ['abc123']
        }),
        usage: { promptTokens: 25, completionTokens: 15, totalTokens: 40 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const text = 'Malicious traffic from 192.168.1.1 and evil.com with hash abc123';
      const result = await aiService.extractIOCs(text);

      expect(result).toContain('192.168.1.1');
      expect(mockClient.complete).toHaveBeenCalled();
    });
  });

  describe('Usage tracking', () => {
    it('should track AI usage', async () => {
      const mockResponse: LLMResponse = {
        text: 'Response',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const mockUser = { id: 'user1' } as any;

      await aiService.fixSpelling('test content', ContentFormat.TEXT, mockUser);

      const usage = aiService.getUserUsage('user1');
      expect(usage).toHaveLength(1);
      expect(usage[0].total_tokens).toBe(15);
    });

    it('should calculate total token usage', async () => {
      const mockResponse: LLMResponse = {
        text: 'Response',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        model: 'gpt-4'
      };

      mockClient.complete.mockResolvedValue(mockResponse);

      const mockUser = { id: 'user1' } as any;

      await aiService.fixSpelling('test 1', ContentFormat.TEXT, mockUser);
      await aiService.summarize('test 2', ContentFormat.TEXT, mockUser);

      const totalTokens = aiService.getUserTokenUsage('user1');
      expect(totalTokens).toBe(30); // 15 + 15
    });
  });
});
