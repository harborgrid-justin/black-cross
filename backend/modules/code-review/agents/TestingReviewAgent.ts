/**
 * Agent 6: Testing & Quality Assurance Review Agent
 * Focuses on test coverage, test quality, testing patterns, and QA practices
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import {
  IReviewAgent,
  ReviewConfig,
  AgentReviewResult,
  ReviewFinding,
  ReviewCategory,
  ReviewSeverity,
  ReviewStatus,
} from '../types';

export class TestingReviewAgent implements IReviewAgent {
  public readonly name = 'Testing & Quality Assurance Review Agent';
  public readonly category = ReviewCategory.TESTING;

  async review(config: ReviewConfig): Promise<AgentReviewResult> {
    const startTime = Date.now();
    const findings: ReviewFinding[] = [];

    try {
      // Check test infrastructure
      await this.checkTestInfrastructure(config.targetPath, findings);

      // Check test coverage
      await this.checkTestCoverage(config.targetPath, findings);

      // Check test organization
      await this.checkTestOrganization(config.targetPath, findings);

      // Check test quality
      await this.checkTestQuality(config.targetPath, findings);

      // Check E2E tests
      await this.checkE2ETests(config.targetPath, findings);

      // Check CI/CD integration
      await this.checkCICD(config.targetPath, findings);

      return this.buildResult(findings, startTime, ReviewStatus.COMPLETED);
    } catch (error) {
      console.error('Testing review failed:', error);
      return this.buildResult(findings, startTime, ReviewStatus.FAILED);
    }
  }

  /**
   * Check test infrastructure
   */
  private async checkTestInfrastructure(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const backendPackageJsonPath = path.join(targetPath, 'backend', 'package.json');
    
    if (fs.existsSync(backendPackageJsonPath)) {
      const content = fs.readFileSync(backendPackageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      // Check for testing frameworks
      const devDeps = packageJson.devDependencies || {};
      const deps = packageJson.dependencies || {};
      const allDeps = { ...devDeps, ...deps };

      const hasJest = 'jest' in allDeps || '@types/jest' in allDeps;
      const hasMocha = 'mocha' in allDeps;
      const hasTestFramework = hasJest || hasMocha;

      if (!hasTestFramework) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.CRITICAL,
          title: 'Missing testing framework',
          description: 'No testing framework (Jest, Mocha) found in backend dependencies',
          location: { file: 'backend/package.json', line: 0 },
          recommendation: 'Add Jest or Mocha testing framework',
          soaPrinciple: 'Testability - Every service must have automated tests',
          codeExample: {
            before: 'No testing framework',
            after: 'npm install --save-dev jest @types/jest ts-jest',
          },
          timestamp: new Date(),
        });
      }

      // Check for test script
      const scripts = packageJson.scripts || {};
      if (!scripts.test) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.HIGH,
          title: 'Missing test script',
          description: 'No test script defined in package.json',
          location: { file: 'backend/package.json', line: 0 },
          recommendation: 'Add test script to package.json',
          soaPrinciple: 'Test Automation - Tests should be easily runnable',
          codeExample: {
            before: '{ "scripts": {} }',
            after: '{ "scripts": { "test": "jest" } }',
          },
          timestamp: new Date(),
        });
      }
    }

    // Check frontend testing
    const frontendPackageJsonPath = path.join(targetPath, 'frontend', 'package.json');
    
    if (fs.existsSync(frontendPackageJsonPath)) {
      const content = fs.readFileSync(frontendPackageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const devDeps = packageJson.devDependencies || {};
      const deps = packageJson.dependencies || {};
      const allDeps = { ...devDeps, ...deps };

      const hasCypress = 'cypress' in allDeps;
      const hasPlaywright = '@playwright/test' in allDeps;
      const hasE2E = hasCypress || hasPlaywright;

      if (!hasE2E) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.HIGH,
          title: 'Missing E2E testing framework',
          description: 'No E2E testing framework (Cypress, Playwright) found',
          location: { file: 'frontend/package.json', line: 0 },
          recommendation: 'Add Cypress or Playwright for E2E testing',
          soaPrinciple: 'End-to-End Testing - Test complete user workflows',
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check test coverage
   */
  private async checkTestCoverage(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const backendTestsPath = path.join(targetPath, 'backend', '__tests__');
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(backendTestsPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.CRITICAL,
        title: 'Missing tests directory',
        description: 'No __tests__ directory found in backend',
        location: { file: 'backend/__tests__/', line: 0 },
        recommendation: 'Create __tests__ directory with test files',
        soaPrinciple: 'Test Coverage - All modules should have tests',
        timestamp: new Date(),
      });
      return;
    }

    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Check each module for tests
    for (const moduleName of modules) {
      const moduleTestPath = path.join(backendTestsPath, moduleName);
      const hasModuleTests = fs.existsSync(moduleTestPath);

      if (!hasModuleTests) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.HIGH,
          title: `Missing tests for ${moduleName}`,
          description: `No test files found for ${moduleName} module`,
          location: { file: `backend/__tests__/${moduleName}/`, line: 0 },
          recommendation: `Create test files for ${moduleName} module`,
          soaPrinciple: 'Module Testing - Each module should have unit tests',
          codeExample: {
            before: `No tests for ${moduleName}`,
            after: `Create __tests__/${moduleName}/service.test.ts and controller.test.ts`,
          },
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check test organization
   */
  private async checkTestOrganization(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const backendTestsPath = path.join(targetPath, 'backend', '__tests__');
    
    if (!fs.existsSync(backendTestsPath)) return;

    const testFiles = this.getAllFiles(backendTestsPath);

    for (const testFile of testFiles) {
      if (!testFile.endsWith('.test.ts') && 
          !testFile.endsWith('.test.js') && 
          !testFile.endsWith('.spec.ts') &&
          !testFile.endsWith('.spec.js')) {
        
        if (testFile.endsWith('.ts') || testFile.endsWith('.js')) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.LOW,
            title: 'Incorrect test file naming',
            description: `Test file doesn't follow naming convention: ${path.basename(testFile)}`,
            location: { file: testFile.replace(targetPath, ''), line: 0 },
            recommendation: 'Use .test.ts or .spec.ts suffix for test files',
            soaPrinciple: 'Test Organization - Follow consistent naming conventions',
            timestamp: new Date(),
          });
        }
      }
    }
  }

  /**
   * Check test quality
   */
  private async checkTestQuality(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const backendTestsPath = path.join(targetPath, 'backend', '__tests__');
    
    if (!fs.existsSync(backendTestsPath)) return;

    const testFiles = this.getAllFiles(backendTestsPath).filter(f => 
      f.endsWith('.test.ts') || f.endsWith('.test.js') ||
      f.endsWith('.spec.ts') || f.endsWith('.spec.js')
    );

    for (const testFile of testFiles) {
      const content = fs.readFileSync(testFile, 'utf-8');

      // Check for describe blocks
      if (!content.includes('describe(')) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.MEDIUM,
          title: `Missing test structure in ${path.basename(testFile)}`,
          description: 'Test file lacks describe blocks for organization',
          location: { file: testFile.replace(targetPath, ''), line: 0 },
          recommendation: 'Use describe blocks to organize related tests',
          soaPrinciple: 'Test Structure - Organize tests with describe blocks',
          codeExample: {
            before: 'test("something", ...)',
            after: 'describe("Feature", () => { test("something", ...) })',
          },
          timestamp: new Date(),
        });
      }

      // Check for assertions
      if (!content.includes('expect(') && 
          !content.includes('assert') &&
          !content.includes('should')) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.HIGH,
          title: `Missing assertions in ${path.basename(testFile)}`,
          description: 'Test file contains no assertions',
          location: { file: testFile.replace(targetPath, ''), line: 0 },
          recommendation: 'Add expect() assertions to verify behavior',
          soaPrinciple: 'Test Validation - Tests must have assertions',
          timestamp: new Date(),
        });
      }

      // Check for setup/teardown
      const hasBeforeEach = content.includes('beforeEach(');
      const hasAfterEach = content.includes('afterEach(');
      const hasDbOperations = content.includes('Model.') || content.includes('.save()');

      if (hasDbOperations && (!hasBeforeEach || !hasAfterEach)) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.MEDIUM,
          title: `Missing setup/teardown in ${path.basename(testFile)}`,
          description: 'Test with database operations lacks beforeEach/afterEach',
          location: { file: testFile.replace(targetPath, ''), line: 0 },
          recommendation: 'Add beforeEach/afterEach for test isolation',
          soaPrinciple: 'Test Isolation - Each test should be independent',
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check E2E tests
   */
  private async checkE2ETests(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const cypressPath = path.join(targetPath, 'frontend', 'cypress', 'e2e');
    
    if (!fs.existsSync(cypressPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing E2E tests',
        description: 'No E2E test directory found',
        location: { file: 'frontend/cypress/e2e/', line: 0 },
        recommendation: 'Create E2E tests for critical user flows',
        soaPrinciple: 'Integration Testing - Test complete user workflows',
        timestamp: new Date(),
      });
      return;
    }

    const e2eFiles = fs.readdirSync(cypressPath);
    
    if (e2eFiles.length === 0) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Empty E2E tests directory',
        description: 'E2E directory exists but contains no test files',
        location: { file: 'frontend/cypress/e2e/', line: 0 },
        recommendation: 'Add E2E tests for critical features',
        soaPrinciple: 'Test Coverage - Cover critical paths with E2E tests',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check CI/CD integration
   */
  private async checkCICD(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const githubWorkflowsPath = path.join(targetPath, '.github', 'workflows');
    
    if (!fs.existsSync(githubWorkflowsPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Missing CI/CD workflows',
        description: 'No GitHub Actions workflows found',
        location: { file: '.github/workflows/', line: 0 },
        recommendation: 'Add CI/CD workflows for automated testing',
        soaPrinciple: 'Continuous Integration - Automate testing in CI pipeline',
        codeExample: {
          before: 'Manual testing only',
          after: 'Create .github/workflows/test.yml for automated testing',
        },
        timestamp: new Date(),
      });
      return;
    }

    const workflows = fs.readdirSync(githubWorkflowsPath);
    const hasTestWorkflow = workflows.some(f => 
      f.includes('test') || f.includes('ci')
    );

    if (!hasTestWorkflow) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Missing test workflow',
        description: 'No workflow found for running tests',
        location: { file: '.github/workflows/', line: 0 },
        recommendation: 'Create workflow to run tests on pull requests',
        soaPrinciple: 'Automated Testing - Run tests automatically on code changes',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Helper: Get all files recursively
   */
  private getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('.git')) {
          arrayOfFiles = this.getAllFiles(filePath, arrayOfFiles);
        }
      } else {
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  }

  /**
   * Build agent result
   */
  private buildResult(findings: ReviewFinding[], startTime: number, status: ReviewStatus): AgentReviewResult {
    const summary = {
      total: findings.length,
      critical: findings.filter(f => f.severity === ReviewSeverity.CRITICAL).length,
      high: findings.filter(f => f.severity === ReviewSeverity.HIGH).length,
      medium: findings.filter(f => f.severity === ReviewSeverity.MEDIUM).length,
      low: findings.filter(f => f.severity === ReviewSeverity.LOW).length,
      info: findings.filter(f => f.severity === ReviewSeverity.INFO).length,
    };

    return {
      agentName: this.name,
      category: this.category,
      status,
      findings,
      summary,
      executionTime: Date.now() - startTime,
      timestamp: new Date(),
    };
  }
}
