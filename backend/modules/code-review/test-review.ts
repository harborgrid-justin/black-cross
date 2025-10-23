/**
 * Test script to run code review on the Black-Cross codebase
 */

import * as path from 'path';
import { CodeReviewOrchestrator } from './services/CodeReviewOrchestrator';
import { ReviewConfig } from './types';
import * as fs from 'fs';

async function runCodeReview() {
  console.log('🚀 Starting Code Review Test...\n');

  const projectRoot = path.resolve(__dirname, '../../..');
  
  const config: ReviewConfig = {
    targetPath: projectRoot,
    parallel: true,
  };

  const orchestrator = new CodeReviewOrchestrator();
  
  try {
    const report = await orchestrator.executeReview(config);

    // Save report to file
    const reportPath = path.join(__dirname, 'reports', 'test-report.json');
    const reportsDir = path.join(__dirname, 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📄 Full report saved to:', reportPath);
    
    // Display summary
    console.log('\n' + '='.repeat(80));
    console.log('CODE REVIEW SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n📊 Overall Statistics:`);
    console.log(`   Total Findings: ${report.overallSummary.totalFindings}`);
    console.log(`   Critical: ${report.overallSummary.criticalFindings} ⚠️`);
    console.log(`   High: ${report.overallSummary.highFindings} 🔴`);
    console.log(`   Medium: ${report.overallSummary.mediumFindings} 🟡`);
    console.log(`   Low: ${report.overallSummary.lowFindings} 🟢`);
    console.log(`   Info: ${report.overallSummary.infoFindings} ℹ️`);
    console.log(`\n🎯 SOA Compliance Score: ${report.soaComplianceScore}%`);
    
    // Display agent results
    console.log('\n📋 Agent Results:');
    report.agentResults.forEach((result, index) => {
      const statusEmoji = result.status === 'completed' ? '✅' : '❌';
      console.log(`\n${index + 1}. ${statusEmoji} ${result.agentName}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Findings: ${result.findings.length}`);
      console.log(`   Execution Time: ${result.executionTime}ms`);
      
      if (result.findings.length > 0) {
        console.log(`   Top Issues:`);
        result.findings.slice(0, 3).forEach((finding, idx) => {
          console.log(`      ${idx + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }
    });
    
    // Display recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      report.recommendations.slice(0, 10).forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✨ Code Review Complete!');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ Code review failed:', error);
    process.exit(1);
  }
}

// Run the test
runCodeReview().catch(console.error);
