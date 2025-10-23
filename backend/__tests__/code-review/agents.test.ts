/**
 * Unit tests for individual review agents
 */

import { ArchitectureReviewAgent } from '../../modules/code-review/agents/ArchitectureReviewAgent';
import { SecurityReviewAgent } from '../../modules/code-review/agents/SecurityReviewAgent';
import { ApiReviewAgent } from '../../modules/code-review/agents/ApiReviewAgent';
import { DataLayerReviewAgent } from '../../modules/code-review/agents/DataLayerReviewAgent';
import { PerformanceReviewAgent } from '../../modules/code-review/agents/PerformanceReviewAgent';
import { TestingReviewAgent } from '../../modules/code-review/agents/TestingReviewAgent';
import { ReviewConfig, ReviewStatus, ReviewCategory } from '../../modules/code-review/types';
import * as path from 'path';

const testConfig: ReviewConfig = {
  targetPath: path.resolve(__dirname, '../../modules/code-review'),
  parallel: true,
};

describe('Individual Review Agents', () => {
  describe('ArchitectureReviewAgent', () => {
    let agent: ArchitectureReviewAgent;

    beforeEach(() => {
      agent = new ArchitectureReviewAgent();
    });

    it('should have correct name and category', () => {
      expect(agent.name).toBe('Architecture & Design Review Agent');
      expect(agent.category).toBe(ReviewCategory.ARCHITECTURE);
    });

    it('should execute review and return result', async () => {
      const result = await agent.review(testConfig);

      expect(result).toBeDefined();
      expect(result.agentName).toBe(agent.name);
      expect(result.category).toBe(ReviewCategory.ARCHITECTURE);
      expect(result.status).toBe(ReviewStatus.COMPLETED);
      expect(Array.isArray(result.findings)).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    }, 10000);

    it('should have valid summary', async () => {
      const result = await agent.review(testConfig);

      expect(result.summary).toBeDefined();
      expect(result.summary.total).toBe(result.findings.length);
    }, 10000);
  });

  describe('SecurityReviewAgent', () => {
    let agent: SecurityReviewAgent;

    beforeEach(() => {
      agent = new SecurityReviewAgent();
    });

    it('should have correct name and category', () => {
      expect(agent.name).toBe('Security & Authentication Review Agent');
      expect(agent.category).toBe(ReviewCategory.SECURITY);
    });

    it('should execute review and return result', async () => {
      const result = await agent.review(testConfig);

      expect(result).toBeDefined();
      expect(result.status).toBe(ReviewStatus.COMPLETED);
      expect(result.category).toBe(ReviewCategory.SECURITY);
    }, 10000);
  });

  describe('ApiReviewAgent', () => {
    let agent: ApiReviewAgent;

    beforeEach(() => {
      agent = new ApiReviewAgent();
    });

    it('should have correct name and category', () => {
      expect(agent.name).toBe('API & Interface Review Agent');
      expect(agent.category).toBe(ReviewCategory.API_DESIGN);
    });

    it('should execute review and return result', async () => {
      const result = await agent.review(testConfig);

      expect(result).toBeDefined();
      expect(result.status).toBe(ReviewStatus.COMPLETED);
      expect(result.category).toBe(ReviewCategory.API_DESIGN);
    }, 10000);
  });

  describe('DataLayerReviewAgent', () => {
    let agent: DataLayerReviewAgent;

    beforeEach(() => {
      agent = new DataLayerReviewAgent();
    });

    it('should have correct name and category', () => {
      expect(agent.name).toBe('Data Layer & Database Review Agent');
      expect(agent.category).toBe(ReviewCategory.DATA_LAYER);
    });

    it('should execute review and return result', async () => {
      const result = await agent.review(testConfig);

      expect(result).toBeDefined();
      expect(result.status).toBe(ReviewStatus.COMPLETED);
      expect(result.category).toBe(ReviewCategory.DATA_LAYER);
    }, 10000);
  });

  describe('PerformanceReviewAgent', () => {
    let agent: PerformanceReviewAgent;

    beforeEach(() => {
      agent = new PerformanceReviewAgent();
    });

    it('should have correct name and category', () => {
      expect(agent.name).toBe('Performance & Scalability Review Agent');
      expect(agent.category).toBe(ReviewCategory.PERFORMANCE);
    });

    it('should execute review and return result', async () => {
      const result = await agent.review(testConfig);

      expect(result).toBeDefined();
      expect(result.status).toBe(ReviewStatus.COMPLETED);
      expect(result.category).toBe(ReviewCategory.PERFORMANCE);
    }, 10000);
  });

  describe('TestingReviewAgent', () => {
    let agent: TestingReviewAgent;

    beforeEach(() => {
      agent = new TestingReviewAgent();
    });

    it('should have correct name and category', () => {
      expect(agent.name).toBe('Testing & Quality Assurance Review Agent');
      expect(agent.category).toBe(ReviewCategory.TESTING);
    });

    it('should execute review and return result', async () => {
      const result = await agent.review(testConfig);

      expect(result).toBeDefined();
      expect(result.status).toBe(ReviewStatus.COMPLETED);
      expect(result.category).toBe(ReviewCategory.TESTING);
    }, 10000);
  });

  describe('Finding Structure', () => {
    it('should have valid finding structure from all agents', async () => {
      const agents = [
        new ArchitectureReviewAgent(),
        new SecurityReviewAgent(),
        new ApiReviewAgent(),
        new DataLayerReviewAgent(),
        new PerformanceReviewAgent(),
        new TestingReviewAgent(),
      ];

      for (const agent of agents) {
        const result = await agent.review(testConfig);
        
        result.findings.forEach(finding => {
          expect(finding.id).toBeDefined();
          expect(finding.agentName).toBe(agent.name);
          expect(finding.category).toBe(agent.category);
          expect(finding.severity).toBeDefined();
          expect(finding.title).toBeDefined();
          expect(finding.description).toBeDefined();
          expect(finding.location).toBeDefined();
          expect(finding.location.file).toBeDefined();
          expect(finding.recommendation).toBeDefined();
          expect(finding.soaPrinciple).toBeDefined();
          expect(finding.timestamp).toBeDefined();
        });
      }
    }, 60000); // 60 second timeout for all agents
  });
});
