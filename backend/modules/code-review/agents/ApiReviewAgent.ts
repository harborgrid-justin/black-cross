/**
 * Agent 3: API & Interface Review Agent
 * Focuses on RESTful API design, endpoint structure, versioning, and documentation
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

export class ApiReviewAgent implements IReviewAgent {
  public readonly name = 'API & Interface Review Agent';
  public readonly category = ReviewCategory.API_DESIGN;

  async review(config: ReviewConfig): Promise<AgentReviewResult> {
    const startTime = Date.now();
    const findings: ReviewFinding[] = [];

    try {
      // Check API versioning
      await this.checkApiVersioning(config.targetPath, findings);

      // Check RESTful conventions
      await this.checkRestfulConventions(config.targetPath, findings);

      // Check API documentation
      await this.checkApiDocumentation(config.targetPath, findings);

      // Check response structure
      await this.checkResponseStructure(config.targetPath, findings);

      // Check error handling
      await this.checkErrorHandling(config.targetPath, findings);

      // Check rate limiting
      await this.checkRateLimiting(config.targetPath, findings);

      return this.buildResult(findings, startTime, ReviewStatus.COMPLETED);
    } catch (error) {
      console.error('API review failed:', error);
      return this.buildResult(findings, startTime, ReviewStatus.FAILED);
    }
  }

  /**
   * Check API versioning
   */
  private async checkApiVersioning(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const indexPath = path.join(targetPath, 'backend', 'index.ts');
    
    if (!fs.existsSync(indexPath)) return;

    const content = fs.readFileSync(indexPath, 'utf-8');

    if (!content.includes('/api/v1') && !content.includes('/v1')) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing API versioning',
        description: 'API endpoints do not include version prefix',
        location: { file: 'backend/index.ts', line: 0 },
        recommendation: 'Add API versioning to all routes (e.g., /api/v1)',
        soaPrinciple: 'API Versioning - Version APIs to support backward compatibility',
        codeExample: {
          before: 'app.use("/users", userRoutes)',
          after: 'app.use("/api/v1/users", userRoutes)',
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check RESTful conventions
   */
  private async checkRestfulConventions(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of modules) {
      const indexPath = path.join(modulesPath, moduleName, 'index.ts');
      
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf-8');
        
        // Check for verb-based endpoints (anti-pattern)
        const verbBasedEndpoints = this.findVerbBasedEndpoints(content);
        
        if (verbBasedEndpoints.length > 0) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.MEDIUM,
            title: `Non-RESTful endpoints in ${moduleName}`,
            description: `Found verb-based endpoints: ${verbBasedEndpoints.join(', ')}`,
            location: { file: `backend/modules/${moduleName}/index.ts`, line: 0 },
            recommendation: 'Use resource-based URLs with HTTP methods instead of verbs in URLs',
            soaPrinciple: 'RESTful Design - Use nouns for resources, verbs for HTTP methods',
            codeExample: {
              before: 'router.post("/createUser", ...)',
              after: 'router.post("/users", ...)',
            },
            references: ['https://restfulapi.net/resource-naming/'],
            timestamp: new Date(),
          });
        }

        // Check for proper HTTP method usage
        this.checkHttpMethodUsage(content, moduleName, findings);
      }
    }
  }

  /**
   * Check API documentation
   */
  private async checkApiDocumentation(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const indexPath = path.join(targetPath, 'backend', 'index.ts');
    
    if (!fs.existsSync(indexPath)) return;

    const content = fs.readFileSync(indexPath, 'utf-8');

    // Check for Swagger/OpenAPI
    if (!content.includes('swagger')) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Missing API documentation',
        description: 'No Swagger/OpenAPI documentation found',
        location: { file: 'backend/index.ts', line: 0 },
        recommendation: 'Add Swagger/OpenAPI documentation for all API endpoints',
        soaPrinciple: 'API Documentation - Provide comprehensive API documentation',
        codeExample: {
          before: 'router.get("/endpoint", handler)',
          after: '/**\n * @swagger\n * /endpoint:\n *   get:\n *     summary: Description\n */\nrouter.get("/endpoint", handler)',
        },
        timestamp: new Date(),
      });
    }

    // Check modules for missing documentation
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of modules) {
      const indexPath = path.join(modulesPath, moduleName, 'index.ts');
      
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf-8');
        
        if (!content.includes('@swagger') && !content.includes('@openapi')) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.LOW,
            title: `Missing API docs in ${moduleName}`,
            description: 'Module endpoints lack Swagger documentation',
            location: { file: `backend/modules/${moduleName}/index.ts`, line: 0 },
            recommendation: 'Add @swagger JSDoc comments to all endpoints',
            soaPrinciple: 'Self-Documenting APIs - Each endpoint should be documented',
            timestamp: new Date(),
          });
        }
      }
    }
  }

  /**
   * Check response structure consistency
   */
  private async checkResponseStructure(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of modules) {
      const controllerPath = path.join(modulesPath, moduleName, 'controller.ts');
      
      if (fs.existsSync(controllerPath)) {
        const content = fs.readFileSync(controllerPath, 'utf-8');
        
        // Check for inconsistent response patterns
        const hasSuccess = content.includes('success:');
        const hasData = content.includes('data:');
        const hasError = content.includes('error:');
        
        if (!hasSuccess && !hasData && !hasError) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.MEDIUM,
            title: `Inconsistent response structure in ${moduleName}`,
            description: 'Controller responses lack consistent structure',
            location: { file: `backend/modules/${moduleName}/controller.ts`, line: 0 },
            recommendation: 'Use consistent response format: { success, data, error }',
            soaPrinciple: 'Consistent Interface - All responses should follow the same structure',
            codeExample: {
              before: 'res.json(result)',
              after: 'res.json({ success: true, data: result })',
            },
            timestamp: new Date(),
          });
        }
      }
    }
  }

  /**
   * Check error handling
   */
  private async checkErrorHandling(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const indexPath = path.join(targetPath, 'backend', 'index.ts');
    
    if (!fs.existsSync(indexPath)) return;

    const content = fs.readFileSync(indexPath, 'utf-8');

    // Check for global error handler
    if (!content.includes('app.use') || !content.includes('err: Error')) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing global error handler',
        description: 'No global error handling middleware found',
        location: { file: 'backend/index.ts', line: 0 },
        recommendation: 'Add global error handling middleware',
        soaPrinciple: 'Centralized Error Handling - Handle errors consistently across services',
        codeExample: {
          before: '// No error handler',
          after: 'app.use((err: Error, req, res, next) => { /* handle error */ })',
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimiting(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const indexPath = path.join(targetPath, 'backend', 'index.ts');
    
    if (!fs.existsSync(indexPath)) return;

    const content = fs.readFileSync(indexPath, 'utf-8');

    if (!content.includes('rateLimit') && !content.includes('rate-limit')) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Missing rate limiting',
        description: 'No rate limiting middleware configured',
        location: { file: 'backend/index.ts', line: 0 },
        recommendation: 'Add rate limiting to prevent API abuse',
        soaPrinciple: 'Service Protection - Implement rate limiting to prevent abuse',
        codeExample: {
          before: 'app.use(express.json())',
          after: 'app.use(rateLimiter({ windowMs: 15*60*1000, max: 100 }))',
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Helper: Find verb-based endpoints
   */
  private findVerbBasedEndpoints(content: string): string[] {
    const verbPattern = /router\.(get|post|put|delete|patch)\(['"]\/(create|update|delete|fetch|get|remove)/g;
    
    const endpoints: string[] = [];
    let match;
    
    while ((match = verbPattern.exec(content)) !== null) {
      endpoints.push(match[0]);
    }
    
    return endpoints;
  }

  /**
   * Helper: Check HTTP method usage
   */
  private checkHttpMethodUsage(content: string, moduleName: string, findings: ReviewFinding[]): void {
    // Check if using GET for mutations (check line by line to avoid regex flags)
    const lines = content.split('\n');
    let getWithMutations = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('router.get') || lines[i].includes('router.get(')) {
        // Check following lines for mutations
        for (let j = i; j < Math.min(i + 10, lines.length); j++) {
          if (lines[j].match(/\.(save|update|delete|create)\(/)) {
            getWithMutations = true;
            break;
          }
        }
      }
    }
    
    if (getWithMutations) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: `Incorrect HTTP method in ${moduleName}`,
        description: 'GET method used for data mutations',
        location: { file: `backend/modules/${moduleName}/index.ts`, line: 0 },
        recommendation: 'Use POST/PUT/PATCH/DELETE for mutations, GET only for reads',
        soaPrinciple: 'Proper HTTP Methods - GET for reads, POST/PUT/PATCH/DELETE for writes',
        timestamp: new Date(),
      });
    }
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
