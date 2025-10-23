/**
 * Agent 1: Architecture & Design Review Agent
 * Focuses on SOA principles, modular design, separation of concerns
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

export class ArchitectureReviewAgent implements IReviewAgent {
  public readonly name = 'Architecture & Design Review Agent';
  public readonly category = ReviewCategory.ARCHITECTURE;

  /**
   * Perform architecture and design review
   */
  async review(config: ReviewConfig): Promise<AgentReviewResult> {
    const startTime = Date.now();
    const findings: ReviewFinding[] = [];

    try {
      // Check module structure and organization
      await this.checkModuleStructure(config.targetPath, findings);

      // Check separation of concerns
      await this.checkSeparationOfConcerns(config.targetPath, findings);

      // Check service boundaries
      await this.checkServiceBoundaries(config.targetPath, findings);

      // Check dependency management
      await this.checkDependencyManagement(config.targetPath, findings);

      // Check interface contracts
      await this.checkInterfaceContracts(config.targetPath, findings);

      return this.buildResult(findings, startTime, ReviewStatus.COMPLETED);
    } catch (error) {
      console.error('Architecture review failed:', error);
      return this.buildResult(findings, startTime, ReviewStatus.FAILED);
    }
  }

  /**
   * Check module structure follows SOA principles
   */
  private async checkModuleStructure(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing modules directory',
        description: 'Backend modules directory not found, which is essential for SOA architecture',
        location: { file: 'backend/', line: 0 },
        recommendation: 'Create backend/modules directory to organize services according to SOA principles',
        soaPrinciple: 'Service Modularity - Services should be organized in separate, independent modules',
        timestamp: new Date(),
      });
      return;
    }

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Check each module for proper structure
    for (const moduleName of modules) {
      const modulePath = path.join(modulesPath, moduleName);
      const expectedFiles = ['index.ts', 'controller.ts', 'service.ts', 'types.ts'];
      const existingFiles = fs.readdirSync(modulePath);

      const missingFiles = expectedFiles.filter(file => !existingFiles.includes(file));

      if (missingFiles.length > 0 && missingFiles.length < expectedFiles.length) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.MEDIUM,
          title: `Incomplete module structure in ${moduleName}`,
          description: `Module ${moduleName} is missing files: ${missingFiles.join(', ')}`,
          location: { file: `backend/modules/${moduleName}/`, line: 0 },
          recommendation: `Add missing files to follow standard module structure: ${missingFiles.join(', ')}`,
          soaPrinciple: 'Service Standardization - All services should follow a consistent structure',
          codeExample: {
            before: `Module ${moduleName} structure is incomplete`,
            after: `Add files: ${missingFiles.join(', ')} following the example-typescript module pattern`,
          },
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check separation of concerns
   */
  private async checkSeparationOfConcerns(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of modules) {
      const indexPath = path.join(modulesPath, moduleName, 'index.ts');
      
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf-8');
        
        // Check if business logic is in routes file (anti-pattern)
        if (this.containsBusinessLogic(content)) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.HIGH,
            title: `Business logic in routes (${moduleName})`,
            description: 'Routes file contains business logic which violates separation of concerns',
            location: { file: `backend/modules/${moduleName}/index.ts`, line: 0 },
            recommendation: 'Move business logic to service layer, keep only routing logic in index.ts',
            soaPrinciple: 'Separation of Concerns - Route definitions should only handle HTTP routing, not business logic',
            codeExample: {
              before: 'router.get("/endpoint", (req, res) => { /* business logic here */ })',
              after: 'router.get("/endpoint", controller.methodName)',
            },
            timestamp: new Date(),
          });
        }
      }
    }
  }

  /**
   * Check service boundaries are well-defined
   */
  private async checkServiceBoundaries(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Check for cross-module dependencies
    for (const moduleName of modules) {
      const servicePath = path.join(modulesPath, moduleName, 'service.ts');
      
      if (fs.existsSync(servicePath)) {
        const content = fs.readFileSync(servicePath, 'utf-8');
        
        // Check for direct imports from other modules (potential tight coupling)
        const crossModuleImports = this.findCrossModuleImports(content, moduleName, modules);
        
        if (crossModuleImports.length > 0) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.MEDIUM,
            title: `Tight coupling in ${moduleName}`,
            description: `Module imports from other modules: ${crossModuleImports.join(', ')}`,
            location: { file: `backend/modules/${moduleName}/service.ts`, line: 0 },
            recommendation: 'Use dependency injection or event-driven communication between services',
            soaPrinciple: 'Loose Coupling - Services should communicate through well-defined interfaces',
            references: ['https://microservices.io/patterns/communication-style/messaging.html'],
            timestamp: new Date(),
          });
        }
      }
    }
  }

  /**
   * Check dependency management
   */
  private async checkDependencyManagement(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const packageJsonPath = path.join(targetPath, 'backend', 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.CRITICAL,
        title: 'Missing backend package.json',
        description: 'Backend package.json not found',
        location: { file: 'backend/package.json', line: 0 },
        recommendation: 'Create backend/package.json to manage dependencies',
        soaPrinciple: 'Service Independence - Each service should manage its own dependencies',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check interface contracts are well-defined
   */
  private async checkInterfaceContracts(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modulesPath = path.join(targetPath, 'backend', 'modules');
    
    if (!fs.existsSync(modulesPath)) return;

    const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of modules) {
      const typesPath = path.join(modulesPath, moduleName, 'types.ts');
      
      if (!fs.existsSync(typesPath)) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.MEDIUM,
          title: `Missing type definitions in ${moduleName}`,
          description: 'Module lacks type definitions file',
          location: { file: `backend/modules/${moduleName}/`, line: 0 },
          recommendation: 'Create types.ts file to define clear interface contracts',
          soaPrinciple: 'Contract-Based Design - Services should have explicit, typed interfaces',
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Helper: Check if content contains business logic patterns
   */
  private containsBusinessLogic(content: string): boolean {
    const patterns = [
      /\.(save|update|delete|create|find)\(/,
      /new\s+\w+\(/,
      /await\s+\w+\./,
      /for\s*\(/,
      /while\s*\(/,
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Helper: Find cross-module imports
   */
  private findCrossModuleImports(content: string, currentModule: string, allModules: string[]): string[] {
    const imports: string[] = [];
    
    for (const module of allModules) {
      if (module !== currentModule && content.includes(`modules/${module}`)) {
        imports.push(module);
      }
    }
    
    return imports;
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
