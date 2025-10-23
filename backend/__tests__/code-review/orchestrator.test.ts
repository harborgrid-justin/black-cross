/**
 * Integration tests for Code Review Orchestrator
 */

import { CodeReviewOrchestrator } from '../../modules/code-review/services/CodeReviewOrchestrator';
import { ReviewConfig, ReviewStatus, ReviewCategory } from '../../modules/code-review/types';
import * as path from 'path';

describe('CodeReviewOrchestrator', () => {
  let orchestrator: CodeReviewOrchestrator;

  beforeEach(() => {
    orchestrator = new CodeReviewOrchestrator();
  });

  describe('getAgents', () => {
    it('should return all six agents', () => {
      const agents = orchestrator.getAgents();
      
      expect(agents).toHaveLength(6);
      expect(agents.map(a => a.category)).toEqual([
        ReviewCategory.ARCHITECTURE,
        ReviewCategory.SECURITY,
        ReviewCategory.API_DESIGN,
        ReviewCategory.DATA_LAYER,
        ReviewCategory.PERFORMANCE,
        ReviewCategory.TESTING,
      ]);
    });

    it('should have correctly named agents', () => {
      const agents = orchestrator.getAgents();
      const names = agents.map(a => a.name);
      
      expect(names).toContain('Architecture & Design Review Agent');
      expect(names).toContain('Security & Authentication Review Agent');
      expect(names).toContain('API & Interface Review Agent');
      expect(names).toContain('Data Layer & Database Review Agent');
      expect(names).toContain('Performance & Scalability Review Agent');
      expect(names).toContain('Testing & Quality Assurance Review Agent');
    });
  });

  describe('executeReview', () => {
    it('should execute review successfully', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.status).toBe(ReviewStatus.COMPLETED);
      expect(report.targetPath).toBe(config.targetPath);
      expect(report.agentResults).toHaveLength(6);
      expect(report.soaComplianceScore).toBeGreaterThanOrEqual(0);
      expect(report.soaComplianceScore).toBeLessThanOrEqual(100);
    }, 30000); // 30 second timeout

    it('should generate overall summary', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      expect(report.overallSummary).toBeDefined();
      expect(report.overallSummary.totalFindings).toBeGreaterThanOrEqual(0);
      expect(report.overallSummary.agentsCompleted).toBe(6);
      expect(report.overallSummary.agentsFailed).toBe(0);
    }, 30000);

    it('should include recommendations', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    }, 30000);

    it('should have timing information', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      expect(report.startTime).toBeDefined();
      expect(report.endTime).toBeDefined();
      expect(report.duration).toBeGreaterThanOrEqual(0);
      expect(report.agentResults.every(r => r.executionTime >= 0)).toBe(true);
    }, 30000);

    it('should mark all agents as completed', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      expect(report.agentResults.every(r => r.status === ReviewStatus.COMPLETED)).toBe(true);
    }, 30000);
  });

  describe('Report Structure', () => {
    it('should have valid agent results', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      report.agentResults.forEach(result => {
        expect(result.agentName).toBeDefined();
        expect(result.category).toBeDefined();
        expect(result.status).toBeDefined();
        expect(result.findings).toBeDefined();
        expect(Array.isArray(result.findings)).toBe(true);
        expect(result.summary).toBeDefined();
        expect(result.summary.total).toBe(result.findings.length);
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
        expect(result.timestamp).toBeDefined();
      });
    }, 30000);

    it('should have valid summary counts', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      report.agentResults.forEach(result => {
        const { critical, high, medium, low, info, total } = result.summary;
        expect(critical + high + medium + low + info).toBe(total);
      });
    }, 30000);

    it('should calculate overall summary correctly', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      const manualTotal = report.agentResults.reduce((sum, r) => sum + r.findings.length, 0);
      expect(report.overallSummary.totalFindings).toBe(manualTotal);
    }, 30000);
  });

  describe('SOA Compliance Score', () => {
    it('should be within valid range', async () => {
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../../modules/code-review'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      expect(report.soaComplianceScore).toBeGreaterThanOrEqual(0);
      expect(report.soaComplianceScore).toBeLessThanOrEqual(100);
    }, 30000);

    it('should be lower with more critical findings', async () => {
      // This test verifies the scoring logic
      const config: ReviewConfig = {
        targetPath: path.resolve(__dirname, '../..'),
        parallel: true,
      };

      const report = await orchestrator.executeReview(config);

      // If there are critical findings, score should reflect that
      if (report.overallSummary.criticalFindings > 0) {
        expect(report.soaComplianceScore).toBeLessThan(100);
      }
    }, 30000);
  });
});
