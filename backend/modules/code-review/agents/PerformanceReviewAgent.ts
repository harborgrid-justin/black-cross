/**
 * Agent 5: Performance & Scalability Review Agent
 * Focuses on performance optimization, caching, async operations, and scalability
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

export class PerformanceReviewAgent implements IReviewAgent {
  public readonly name = 'Performance & Scalability Review Agent';
  public readonly category = ReviewCategory.PERFORMANCE;

  async review(config: ReviewConfig): Promise<AgentReviewResult> {
    const startTime = Date.now();
    const findings: ReviewFinding[] = [];

    try {
      // Check caching implementation
      await this.checkCaching(config.targetPath, findings);

      // Check async/await usage
      await this.checkAsyncPatterns(config.targetPath, findings);

      // Check database query optimization
      await this.checkQueryOptimization(config.targetPath, findings);

      // Check N+1 query problems
      await this.checkNPlusOneQueries(config.targetPath, findings);

      // Check resource pooling
      await this.checkResourcePooling(config.targetPath, findings);

      // Check pagination
      await this.checkPagination(config.targetPath, findings);

      // Check logging performance
      await this.checkLoggingPerformance(config.targetPath, findings);

      return this.buildResult(findings, startTime, ReviewStatus.COMPLETED);
    } catch (error) {
      console.error('Performance review failed:', error);
      return this.buildResult(findings, startTime, ReviewStatus.FAILED);
    }
  }

  /**
   * Check caching implementation
   */
  private async checkCaching(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const configPath = path.join(targetPath, 'backend', 'config');
    
    if (!fs.existsSync(configPath)) return;

    const files = fs.readdirSync(configPath);
    const hasCacheConfig = files.some(f => 
      f.includes('cache') || f.includes('redis')
    );

    if (!hasCacheConfig) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Missing caching configuration',
        description: 'No caching configuration found (Redis, Memcached, etc.)',
        location: { file: 'backend/config/', line: 0 },
        recommendation: 'Implement Redis or another caching solution for better performance',
        soaPrinciple: 'Performance Optimization - Use caching to reduce database load',
        codeExample: {
          before: 'Every request hits database',
          after: 'const cached = await redis.get(key); if (!cached) { /* fetch and cache */ }',
        },
        timestamp: new Date(),
      });
    }

    // Check if services use caching
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of modules) {
      const servicePath = path.join(modulesPath, moduleName, 'service.ts');
      
      if (fs.existsSync(servicePath)) {
        const content = fs.readFileSync(servicePath, 'utf-8');
        
        // Check if service does expensive operations without caching
        if (this.hasExpensiveOperationsWithoutCache(content)) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.LOW,
            title: `Consider caching in ${moduleName}`,
            description: 'Service performs expensive operations that could benefit from caching',
            location: { file: `backend/modules/${moduleName}/service.ts`, line: 0 },
            recommendation: 'Implement caching for frequently accessed data',
            soaPrinciple: 'Caching Strategy - Cache expensive or frequently accessed data',
            timestamp: new Date(),
          });
        }
      }
    }
  }

  /**
   * Check async/await usage and patterns
   */
  private async checkAsyncPatterns(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const files = this.getAllFiles(modulesPath);

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Check for unhandled async operations
        if (this.hasUnhandledAsync(line)) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.MEDIUM,
            title: 'Unhandled async operation',
            description: 'Async operation without proper error handling',
            location: { 
              file: file.replace(targetPath, ''), 
              line: index + 1,
            },
            recommendation: 'Wrap async operations in try-catch blocks',
            soaPrinciple: 'Error Handling - Handle all async operations properly',
            codeExample: {
              before: 'await operation()',
              after: 'try { await operation() } catch (error) { /* handle */ }',
            },
            timestamp: new Date(),
          });
        }

        // Check for sequential operations that could be parallel
        if (this.hasSequentialAwaits(content, index)) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.LOW,
            title: 'Sequential awaits that could be parallel',
            description: 'Multiple independent await calls that could run in parallel',
            location: { 
              file: file.replace(targetPath, ''), 
              line: index + 1,
            },
            recommendation: 'Use Promise.all() for independent async operations',
            soaPrinciple: 'Parallel Execution - Run independent operations concurrently',
            codeExample: {
              before: 'const a = await fetchA(); const b = await fetchB();',
              after: 'const [a, b] = await Promise.all([fetchA(), fetchB()]);',
            },
            timestamp: new Date(),
          });
        }
      });
    }
  }

  /**
   * Check database query optimization
   */
  private async checkQueryOptimization(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const files = this.getAllFiles(modulesPath);

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for SELECT * queries
      if (content.includes('SELECT *') || content.includes('select *')) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.MEDIUM,
          title: 'SELECT * detected',
          description: 'Query selects all columns instead of specific fields',
          location: { file: file.replace(targetPath, ''), line: 0 },
          recommendation: 'Select only required columns to reduce data transfer',
          soaPrinciple: 'Query Optimization - Fetch only necessary data',
          codeExample: {
            before: 'SELECT * FROM users',
            after: 'SELECT id, name, email FROM users',
          },
          timestamp: new Date(),
        });
      }

      // Check for findAll without limit
      if (content.includes('.findAll()') && !content.includes('limit:')) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.HIGH,
          title: 'Unbounded query detected',
          description: 'findAll() called without limit, could return all records',
          location: { file: file.replace(targetPath, ''), line: 0 },
          recommendation: 'Add limit and pagination to all bulk queries',
          soaPrinciple: 'Resource Control - Limit query results to prevent memory issues',
          codeExample: {
            before: 'Model.findAll()',
            after: 'Model.findAll({ limit: 100, offset: page * 100 })',
          },
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check for N+1 query problems
   */
  private async checkNPlusOneQueries(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const files = this.getAllFiles(modulesPath);

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for loops with database queries
      if (this.hasLoopWithQuery(content)) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.HIGH,
          title: 'Potential N+1 query problem',
          description: 'Database query inside loop detected',
          location: { file: file.replace(targetPath, ''), line: 0 },
          recommendation: 'Use eager loading or batch queries instead of loops',
          soaPrinciple: 'Query Efficiency - Avoid N+1 queries with eager loading',
          codeExample: {
            before: 'for (item of items) { await Model.find(item.id) }',
            after: 'Model.findAll({ include: [{ model: Related }] })',
          },
          references: ['https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem'],
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check resource pooling
   */
  private async checkResourcePooling(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const configPath = path.join(targetPath, 'backend', 'config', 'database.ts');
    
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      
      if (!content.includes('pool') && !content.includes('Pool')) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.MEDIUM,
          title: 'Missing database connection pooling',
          description: 'Database configuration lacks connection pooling',
          location: { file: 'backend/config/database.ts', line: 0 },
          recommendation: 'Configure connection pool with appropriate min/max settings',
          soaPrinciple: 'Resource Pooling - Reuse connections for better performance',
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check pagination implementation
   */
  private async checkPagination(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of modules) {
      const controllerPath = path.join(modulesPath, moduleName, 'controller.ts');
      
      if (fs.existsSync(controllerPath)) {
        const content = fs.readFileSync(controllerPath, 'utf-8');
        
        // Check for list endpoints without pagination
        if (this.hasListEndpointWithoutPagination(content)) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.MEDIUM,
            title: `Missing pagination in ${moduleName}`,
            description: 'List endpoint lacks pagination implementation',
            location: { file: `backend/modules/${moduleName}/controller.ts`, line: 0 },
            recommendation: 'Implement pagination with page and limit parameters',
            soaPrinciple: 'Scalability - Use pagination for large datasets',
            codeExample: {
              before: 'findAll()',
              after: 'findAll({ limit: req.query.limit, offset: req.query.page * req.query.limit })',
            },
            timestamp: new Date(),
          });
        }
      }
    }
  }

  /**
   * Check logging performance
   */
  private async checkLoggingPerformance(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const files = this.getAllFiles(path.join(targetPath, 'backend'));

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
      if (file.includes('node_modules')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for excessive console.log in production code
      const consoleLogCount = (content.match(/console\.(log|info|warn|error)/g) || []).length;
      
      if (consoleLogCount > 10) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.LOW,
          title: 'Excessive console logging',
          description: `File contains ${consoleLogCount} console statements`,
          location: { file: file.replace(targetPath, ''), line: 0 },
          recommendation: 'Use a proper logging library (Winston, Pino) with log levels',
          soaPrinciple: 'Structured Logging - Use proper logging framework',
          timestamp: new Date(),
        });
      }
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
   * Helper: Check for expensive operations without cache
   */
  private hasExpensiveOperationsWithoutCache(content: string): boolean {
    const expensiveOps = ['.findAll', '.aggregate', '.count', 'complex calculation'];
    const hasCaching = content.includes('cache') || content.includes('redis');
    
    return expensiveOps.some(op => content.includes(op)) && !hasCaching;
  }

  /**
   * Helper: Check for unhandled async
   */
  private hasUnhandledAsync(line: string): boolean {
    return line.includes('await ') && 
           !line.includes('try') && 
           !line.includes('catch');
  }

  /**
   * Helper: Check for sequential awaits
   */
  private hasSequentialAwaits(content: string, lineIndex: number): boolean {
    const lines = content.split('\n');
    const currentLine = lines[lineIndex];
    const nextLine = lines[lineIndex + 1];
    
    if (!currentLine || !nextLine) return false;
    
    return currentLine.includes('const') && currentLine.includes('await') &&
           nextLine.includes('const') && nextLine.includes('await') &&
           !currentLine.includes('Promise.all');
  }

  /**
   * Helper: Check for loop with query
   */
  private hasLoopWithQuery(content: string): boolean {
    const loopPatterns = ['for (', 'for(', '.forEach(', '.map('];
    const queryPatterns = ['.find(', '.findOne(', '.findAll(', 'await '];
    
    const lines = content.split('\n');
    let inLoop = false;
    
    for (const line of lines) {
      if (loopPatterns.some(pattern => line.includes(pattern))) {
        inLoop = true;
      }
      
      if (inLoop && queryPatterns.some(pattern => line.includes(pattern))) {
        return true;
      }
      
      if (line.includes('}')) {
        inLoop = false;
      }
    }
    
    return false;
  }

  /**
   * Helper: Check for list endpoint without pagination
   */
  private hasListEndpointWithoutPagination(content: string): boolean {
    const hasListOperation = content.includes('.findAll') || content.includes('.find()');
    const hasPagination = content.includes('limit') || 
                         content.includes('offset') || 
                         content.includes('page');
    
    return hasListOperation && !hasPagination;
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
