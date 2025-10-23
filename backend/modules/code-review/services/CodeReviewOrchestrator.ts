/**
 * Code Review Orchestrator
 * Manages the execution of six expert agents simultaneously for SOA-aligned code review
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ReviewConfig,
  CodeReviewReport,
  ReviewStatus,
  ReviewSeverity,
} from '../types';
import { ArchitectureReviewAgent } from '../agents/ArchitectureReviewAgent';
import { SecurityReviewAgent } from '../agents/SecurityReviewAgent';
import { ApiReviewAgent } from '../agents/ApiReviewAgent';
import { DataLayerReviewAgent } from '../agents/DataLayerReviewAgent';
import { PerformanceReviewAgent } from '../agents/PerformanceReviewAgent';
import { TestingReviewAgent } from '../agents/TestingReviewAgent';

export class CodeReviewOrchestrator {
  private agents = [
    new ArchitectureReviewAgent(),
    new SecurityReviewAgent(),
    new ApiReviewAgent(),
    new DataLayerReviewAgent(),
    new PerformanceReviewAgent(),
    new TestingReviewAgent(),
  ];

  /**
   * Execute all six agents simultaneously
   */
  async executeReview(config: ReviewConfig): Promise<CodeReviewReport> {
    const reportId = uuidv4();
    const startTime = new Date();

    console.log('🚀 Starting SOA-Aligned Code Review with 6 Expert Agents...');
    console.log(`📍 Target: ${config.targetPath}`);
    console.log(`🤖 Agents: ${this.agents.map(a => a.name).join(', ')}`);

    try {
      // Run all agents in parallel
      const agentPromises = this.agents.map(agent => {
        console.log(`▶️  Starting ${agent.name}...`);
        return agent.review(config).catch(error => {
          console.error(`❌ ${agent.name} failed:`, error);
          throw error;
        });
      });

      // Wait for all agents to complete
      const agentResults = await Promise.all(agentPromises);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Log completion
      agentResults.forEach(result => {
        console.log(`✅ ${result.agentName} completed with ${result.findings.length} findings (${result.executionTime}ms)`);
      });

      // Build overall summary
      const overallSummary = this.buildOverallSummary(agentResults);

      // Calculate SOA compliance score
      const soaComplianceScore = this.calculateSoaComplianceScore(agentResults);

      // Generate recommendations
      const recommendations = this.generateRecommendations(agentResults);

      const report: CodeReviewReport = {
        id: reportId,
        status: ReviewStatus.COMPLETED,
        targetPath: config.targetPath,
        startTime,
        endTime,
        duration,
        agentResults,
        overallSummary,
        recommendations,
        soaComplianceScore,
      };

      console.log(`\n📊 Review Complete!`);
      console.log(`   Total Findings: ${overallSummary.totalFindings}`);
      console.log(`   Critical: ${overallSummary.criticalFindings}`);
      console.log(`   High: ${overallSummary.highFindings}`);
      console.log(`   Medium: ${overallSummary.mediumFindings}`);
      console.log(`   Low: ${overallSummary.lowFindings}`);
      console.log(`   SOA Compliance Score: ${soaComplianceScore}%`);
      console.log(`   Duration: ${duration}ms\n`);

      return report;
    } catch (error) {
      console.error('❌ Code review failed:', error);
      
      return {
        id: reportId,
        status: ReviewStatus.FAILED,
        targetPath: config.targetPath,
        startTime,
        agentResults: [],
        overallSummary: {
          totalFindings: 0,
          criticalFindings: 0,
          highFindings: 0,
          mediumFindings: 0,
          lowFindings: 0,
          infoFindings: 0,
          agentsCompleted: 0,
          agentsFailed: this.agents.length,
        },
        recommendations: [],
        soaComplianceScore: 0,
      };
    }
  }

  /**
   * Build overall summary from all agent results
   */
  private buildOverallSummary(agentResults: any[]) {
    const summary = {
      totalFindings: 0,
      criticalFindings: 0,
      highFindings: 0,
      mediumFindings: 0,
      lowFindings: 0,
      infoFindings: 0,
      agentsCompleted: 0,
      agentsFailed: 0,
    };

    agentResults.forEach(result => {
      if (result.status === ReviewStatus.COMPLETED) {
        summary.agentsCompleted++;
        summary.totalFindings += result.summary.total;
        summary.criticalFindings += result.summary.critical;
        summary.highFindings += result.summary.high;
        summary.mediumFindings += result.summary.medium;
        summary.lowFindings += result.summary.low;
        summary.infoFindings += result.summary.info;
      } else {
        summary.agentsFailed++;
      }
    });

    return summary;
  }

  /**
   * Calculate SOA compliance score (0-100)
   */
  private calculateSoaComplianceScore(agentResults: any[]): number {
    let totalScore = 0;
    let maxScore = agentResults.length * 100;

    agentResults.forEach(result => {
      // Calculate score based on findings severity
      const deductions = 
        (result.summary.critical * 20) +
        (result.summary.high * 10) +
        (result.summary.medium * 5) +
        (result.summary.low * 2) +
        (result.summary.info * 1);

      const agentScore = Math.max(0, 100 - deductions);
      totalScore += agentScore;
    });

    return Math.round((totalScore / maxScore) * 100);
  }

  /**
   * Generate prioritized recommendations
   */
  private generateRecommendations(agentResults: any[]): string[] {
    const recommendations: string[] = [];

    // Collect all critical findings
    agentResults.forEach(result => {
      result.findings
        .filter((f: any) => f.severity === ReviewSeverity.CRITICAL)
        .forEach((finding: any) => {
          recommendations.push(`[CRITICAL] ${finding.title}: ${finding.recommendation}`);
        });
    });

    // Collect all high severity findings
    agentResults.forEach(result => {
      result.findings
        .filter((f: any) => f.severity === ReviewSeverity.HIGH)
        .forEach((finding: any) => {
          recommendations.push(`[HIGH] ${finding.title}: ${finding.recommendation}`);
        });
    });

    // Add general SOA recommendations
    recommendations.push('Ensure all services follow RESTful API design principles');
    recommendations.push('Implement comprehensive error handling across all modules');
    recommendations.push('Add integration tests for all service endpoints');
    recommendations.push('Document all API endpoints with OpenAPI/Swagger');
    recommendations.push('Implement monitoring and logging for all services');

    return recommendations;
  }

  /**
   * Get available agents
   */
  getAgents() {
    return this.agents.map(agent => ({
      name: agent.name,
      category: agent.category,
    }));
  }
}
