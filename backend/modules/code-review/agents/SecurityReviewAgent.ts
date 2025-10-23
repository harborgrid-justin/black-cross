/**
 * Agent 2: Security & Authentication Review Agent
 * Focuses on security best practices, authentication, authorization, and data protection
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

export class SecurityReviewAgent implements IReviewAgent {
  public readonly name = 'Security & Authentication Review Agent';
  public readonly category = ReviewCategory.SECURITY;

  async review(config: ReviewConfig): Promise<AgentReviewResult> {
    const startTime = Date.now();
    const findings: ReviewFinding[] = [];

    try {
      // Check authentication implementation
      await this.checkAuthentication(config.targetPath, findings);

      // Check authorization and RBAC
      await this.checkAuthorization(config.targetPath, findings);

      // Check for sensitive data exposure
      await this.checkSensitiveDataExposure(config.targetPath, findings);

      // Check input validation
      await this.checkInputValidation(config.targetPath, findings);

      // Check CORS and security headers
      await this.checkSecurityHeaders(config.targetPath, findings);

      // Check for hardcoded secrets
      await this.checkHardcodedSecrets(config.targetPath, findings);

      return this.buildResult(findings, startTime, ReviewStatus.COMPLETED);
    } catch (error) {
      console.error('Security review failed:', error);
      return this.buildResult(findings, startTime, ReviewStatus.FAILED);
    }
  }

  /**
   * Check authentication implementation
   */
  private async checkAuthentication(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const authModulePath = path.join(targetPath, 'backend', 'modules', 'auth');
    
    if (!fs.existsSync(authModulePath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.CRITICAL,
        title: 'Missing authentication module',
        description: 'No authentication module found in the application',
        location: { file: 'backend/modules/auth/', line: 0 },
        recommendation: 'Implement authentication module with JWT or session-based auth',
        soaPrinciple: 'Security First - Every service must implement proper authentication',
        references: ['https://owasp.org/www-project-api-security/'],
        timestamp: new Date(),
      });
      return;
    }

    // Check for JWT implementation
    const files = this.getAllFiles(authModulePath);
    let hasJWT = false;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('jsonwebtoken') || content.includes('jwt')) {
        hasJWT = true;
        break;
      }
    }

    if (!hasJWT) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'No JWT authentication found',
        description: 'Authentication module does not use JWT tokens',
        location: { file: 'backend/modules/auth/', line: 0 },
        recommendation: 'Implement JWT-based authentication for stateless, scalable auth',
        soaPrinciple: 'Stateless Services - Use token-based authentication for service scalability',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check authorization and RBAC
   */
  private async checkAuthorization(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const middlewarePath = path.join(targetPath, 'backend', 'middleware');
    
    if (!fs.existsSync(middlewarePath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing middleware directory',
        description: 'No middleware directory found for authorization checks',
        location: { file: 'backend/middleware/', line: 0 },
        recommendation: 'Create middleware directory with authorization middleware',
        soaPrinciple: 'Authorization Layer - Implement centralized authorization logic',
        timestamp: new Date(),
      });
      return;
    }

    // Check for auth middleware
    const files = fs.readdirSync(middlewarePath);
    const hasAuthMiddleware = files.some(f => 
      f.includes('auth') || f.includes('authorization') || f.includes('rbac')
    );

    if (!hasAuthMiddleware) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing authorization middleware',
        description: 'No authorization or RBAC middleware found',
        location: { file: 'backend/middleware/', line: 0 },
        recommendation: 'Implement RBAC middleware for role-based access control',
        soaPrinciple: 'Access Control - Implement fine-grained authorization',
        codeExample: {
          before: 'No authorization checks',
          after: 'export const requireRole = (roles: string[]) => (req, res, next) => { /* check */ }',
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check for sensitive data exposure
   */
  private async checkSensitiveDataExposure(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const files = this.getAllFiles(modulesPath);

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      // Check for password in responses
      lines.forEach((line, index) => {
        if (this.containsSensitiveDataExposure(line)) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.CRITICAL,
            title: 'Potential sensitive data exposure',
            description: 'Code may expose sensitive data like passwords or tokens',
            location: { 
              file: file.replace(targetPath, ''), 
              line: index + 1,
            },
            recommendation: 'Remove sensitive fields from responses using field exclusion or DTOs',
            soaPrinciple: 'Data Protection - Never expose sensitive data in API responses',
            codeExample: {
              before: 'res.json(user)',
              after: 'const { password, ...safeUser } = user; res.json(safeUser)',
            },
            timestamp: new Date(),
          });
        }
      });
    }
  }

  /**
   * Check input validation
   */
  private async checkInputValidation(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of modules) {
      const controllerPath = path.join(modulesPath, moduleName, 'controller.ts');
      
      if (fs.existsSync(controllerPath)) {
        const content = fs.readFileSync(controllerPath, 'utf-8');
        
        // Check if validation is used
        const hasValidation = content.includes('validate') || 
                             content.includes('joi') || 
                             content.includes('zod') ||
                             content.includes('validator');

        if (!hasValidation && content.includes('req.body')) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.HIGH,
            title: `Missing input validation in ${moduleName}`,
            description: 'Controller accesses req.body without validation',
            location: { file: `backend/modules/${moduleName}/controller.ts`, line: 0 },
            recommendation: 'Add input validation using Joi or Zod schemas',
            soaPrinciple: 'Input Validation - Always validate and sanitize user input',
            references: ['https://owasp.org/www-project-api-security/'],
            timestamp: new Date(),
          });
        }
      }
    }
  }

  /**
   * Check security headers
   */
  private async checkSecurityHeaders(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const indexPath = path.join(targetPath, 'backend', 'index.ts');
    
    if (!fs.existsSync(indexPath)) return;

    const content = fs.readFileSync(indexPath, 'utf-8');

    if (!content.includes('helmet')) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing security headers middleware',
        description: 'Helmet middleware not found for security headers',
        location: { file: 'backend/index.ts', line: 0 },
        recommendation: 'Add helmet middleware to set security headers',
        soaPrinciple: 'Security Headers - Implement security headers to protect against common attacks',
        codeExample: {
          before: 'app.use(express.json())',
          after: 'app.use(helmet()); app.use(express.json())',
        },
        timestamp: new Date(),
      });
    }

    if (!content.includes('cors')) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Missing CORS configuration',
        description: 'CORS middleware not configured',
        location: { file: 'backend/index.ts', line: 0 },
        recommendation: 'Configure CORS properly with allowed origins',
        soaPrinciple: 'Cross-Origin Security - Implement CORS to control resource access',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check for hardcoded secrets
   */
  private async checkHardcodedSecrets(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const backendPath = path.join(targetPath, 'backend');
    const files = this.getAllFiles(backendPath);

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
      if (file.includes('node_modules')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (this.containsHardcodedSecret(line)) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.CRITICAL,
            title: 'Potential hardcoded secret',
            description: 'Line contains potential hardcoded secret or API key',
            location: { 
              file: file.replace(targetPath, ''), 
              line: index + 1,
            },
            recommendation: 'Use environment variables for secrets and API keys',
            soaPrinciple: 'Secret Management - Never hardcode secrets in source code',
            codeExample: {
              before: 'const apiKey = "sk-1234567890"',
              after: 'const apiKey = process.env.API_KEY',
            },
            timestamp: new Date(),
          });
        }
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
   * Helper: Check for sensitive data exposure patterns
   */
  private containsSensitiveDataExposure(line: string): boolean {
    const patterns = [
      /res\.json\(user\)/i,
      /res\.send\(.*password/i,
      /res\.json\(.*token/i,
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  /**
   * Helper: Check for hardcoded secrets
   */
  private containsHardcodedSecret(line: string): boolean {
    const patterns = [
      /['"]sk-[a-zA-Z0-9]{20,}['"]/,
      /['"]ghp_[a-zA-Z0-9]{36}['"]/,
      /apiKey\s*=\s*['"][^'"]+['"]/,
      /secretKey\s*=\s*['"][^'"]+['"]/,
      /password\s*=\s*['"][^'"]+['"]/,
    ];
    
    return patterns.some(pattern => pattern.test(line)) && 
           !line.includes('process.env') && 
           !line.includes('config.');
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
