/**
 * Agent 4: Data Layer & Database Review Agent
 * Focuses on database design, ORM usage, data integrity, and data access patterns
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

export class DataLayerReviewAgent implements IReviewAgent {
  public readonly name = 'Data Layer & Database Review Agent';
  public readonly category = ReviewCategory.DATA_LAYER;

  async review(config: ReviewConfig): Promise<AgentReviewResult> {
    const startTime = Date.now();
    const findings: ReviewFinding[] = [];

    try {
      // Check database models
      await this.checkDatabaseModels(config.targetPath, findings);

      // Check repository pattern
      await this.checkRepositoryPattern(config.targetPath, findings);

      // Check SQL injection prevention
      await this.checkSqlInjection(config.targetPath, findings);

      // Check data validation
      await this.checkDataValidation(config.targetPath, findings);

      // Check migrations
      await this.checkMigrations(config.targetPath, findings);

      // Check database configuration
      await this.checkDatabaseConfig(config.targetPath, findings);

      return this.buildResult(findings, startTime, ReviewStatus.COMPLETED);
    } catch (error) {
      console.error('Data layer review failed:', error);
      return this.buildResult(findings, startTime, ReviewStatus.FAILED);
    }
  }

  /**
   * Check database models
   */
  private async checkDatabaseModels(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modelsPath = path.join(targetPath, 'backend', 'models');
    
    if (!fs.existsSync(modelsPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing models directory',
        description: 'No models directory found for database entities',
        location: { file: 'backend/models/', line: 0 },
        recommendation: 'Create models directory with ORM model definitions',
        soaPrinciple: 'Data Abstraction - Use ORM models to abstract database operations',
        timestamp: new Date(),
      });
      return;
    }

    const files = fs.readdirSync(modelsPath);
    
    if (files.length === 0) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Empty models directory',
        description: 'Models directory exists but contains no model files',
        location: { file: 'backend/models/', line: 0 },
        recommendation: 'Define database models using Sequelize or another ORM',
        soaPrinciple: 'Data Models - Define clear data models for all entities',
        timestamp: new Date(),
      });
      return;
    }

    // Check each model for proper structure
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const filePath = path.join(modelsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for proper model definition
      if (!this.hasProperModelDefinition(content)) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.MEDIUM,
          title: `Incomplete model definition in ${file}`,
          description: 'Model file lacks proper ORM structure',
          location: { file: `backend/models/${file}`, line: 0 },
          recommendation: 'Use proper ORM decorators and model structure',
          soaPrinciple: 'Structured Models - Models should follow ORM conventions',
          timestamp: new Date(),
        });
      }

      // Check for timestamps
      if (!content.includes('createdAt') && !content.includes('updatedAt')) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.LOW,
          title: `Missing timestamps in ${file}`,
          description: 'Model lacks createdAt/updatedAt fields',
          location: { file: `backend/models/${file}`, line: 0 },
          recommendation: 'Add timestamp fields for audit trail',
          soaPrinciple: 'Audit Trail - Track when records are created and modified',
          codeExample: {
            before: 'Model without timestamps',
            after: '@Column createdAt: Date; @Column updatedAt: Date;',
          },
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check repository pattern implementation
   */
  private async checkRepositoryPattern(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const repositoriesPath = path.join(targetPath, 'backend', 'repositories');
    
    if (!fs.existsSync(repositoriesPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Missing repository pattern',
        description: 'No repositories directory found for data access layer',
        location: { file: 'backend/repositories/', line: 0 },
        recommendation: 'Implement repository pattern to abstract data access',
        soaPrinciple: 'Data Access Layer - Separate data access logic from business logic',
        codeExample: {
          before: 'Direct model access in services',
          after: 'Use repository classes: userRepository.findById(id)',
        },
        references: ['https://martinfowler.com/eaaCatalog/repository.html'],
        timestamp: new Date(),
      });
      return;
    }

    const files = fs.readdirSync(repositoriesPath);
    
    if (files.length === 0) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Empty repositories directory',
        description: 'Repositories directory exists but is empty',
        location: { file: 'backend/repositories/', line: 0 },
        recommendation: 'Create repository classes for each model',
        soaPrinciple: 'Repository Pattern - Centralize data access logic',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check SQL injection prevention
   */
  private async checkSqlInjection(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const backendPath = path.join(targetPath, 'backend');
    const files = this.getAllFiles(backendPath);

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
      if (file.includes('node_modules')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Check for string concatenation in SQL queries
        if (this.hasRawSqlWithConcatenation(line)) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.CRITICAL,
            title: 'SQL injection vulnerability',
            description: 'Raw SQL query with string concatenation detected',
            location: { 
              file: file.replace(targetPath, ''), 
              line: index + 1,
            },
            recommendation: 'Use parameterized queries or ORM methods',
            soaPrinciple: 'Secure Data Access - Always use parameterized queries',
            codeExample: {
              before: 'query(`SELECT * FROM users WHERE id = ${userId}`)',
              after: 'query("SELECT * FROM users WHERE id = ?", [userId])',
            },
            references: ['https://owasp.org/www-community/attacks/SQL_Injection'],
            timestamp: new Date(),
          });
        }
      });
    }
  }

  /**
   * Check data validation at model level
   */
  private async checkDataValidation(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const modelsPath = path.join(targetPath, 'backend', 'models');
    
    if (!fs.existsSync(modelsPath)) return;

    const files = fs.readdirSync(modelsPath);

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const filePath = path.join(modelsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for validation decorators or constraints
      if (!content.includes('@Validate') && 
          !content.includes('validate:') && 
          !content.includes('allowNull') &&
          content.includes('@Column')) {
        findings.push({
          id: uuidv4(),
          agentName: this.name,
          category: this.category,
          severity: ReviewSeverity.MEDIUM,
          title: `Missing data validation in ${file}`,
          description: 'Model lacks field validation constraints',
          location: { file: `backend/models/${file}`, line: 0 },
          recommendation: 'Add validation decorators to model fields',
          soaPrinciple: 'Data Integrity - Validate data at the model level',
          codeExample: {
            before: '@Column name: string;',
            after: '@Column({ allowNull: false, validate: { notEmpty: true } }) name: string;',
          },
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check database migrations
   */
  private async checkMigrations(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const migrationsPath = path.join(targetPath, 'backend', 'migrations');
    
    if (!fs.existsSync(migrationsPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.MEDIUM,
        title: 'Missing migrations directory',
        description: 'No migrations directory found for schema versioning',
        location: { file: 'backend/migrations/', line: 0 },
        recommendation: 'Create migrations directory and use schema migrations',
        soaPrinciple: 'Schema Versioning - Use migrations to version database schema',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check database configuration
   */
  private async checkDatabaseConfig(targetPath: string, findings: ReviewFinding[]): Promise<void> {
    const configPath = path.join(targetPath, 'backend', 'config');
    
    if (!fs.existsSync(configPath)) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing config directory',
        description: 'No config directory found for database configuration',
        location: { file: 'backend/config/', line: 0 },
        recommendation: 'Create config directory with database configuration',
        soaPrinciple: 'Configuration Management - Centralize configuration',
        timestamp: new Date(),
      });
      return;
    }

    const files = fs.readdirSync(configPath);
    const hasDatabaseConfig = files.some(f => 
      f.includes('database') || f.includes('db')
    );

    if (!hasDatabaseConfig) {
      findings.push({
        id: uuidv4(),
        agentName: this.name,
        category: this.category,
        severity: ReviewSeverity.HIGH,
        title: 'Missing database configuration',
        description: 'No database configuration file found',
        location: { file: 'backend/config/', line: 0 },
        recommendation: 'Create database.ts configuration file',
        soaPrinciple: 'Centralized Configuration - Database config should be centralized',
        timestamp: new Date(),
      });
    }

    // Check for connection pooling
    for (const file of files) {
      if (file.includes('database') || file.includes('db')) {
        const filePath = path.join(configPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        if (!content.includes('pool') && !content.includes('Pool')) {
          findings.push({
            id: uuidv4(),
            agentName: this.name,
            category: this.category,
            severity: ReviewSeverity.MEDIUM,
            title: 'Missing connection pooling',
            description: 'Database configuration lacks connection pool settings',
            location: { file: `backend/config/${file}`, line: 0 },
            recommendation: 'Configure connection pooling for better performance',
            soaPrinciple: 'Resource Management - Use connection pooling for efficiency',
            timestamp: new Date(),
          });
        }
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
   * Helper: Check for proper model definition
   */
  private hasProperModelDefinition(content: string): boolean {
    return content.includes('@Table') || 
           content.includes('sequelize.define') || 
           content.includes('export class') ||
           content.includes('Schema');
  }

  /**
   * Helper: Check for raw SQL with concatenation
   */
  private hasRawSqlWithConcatenation(line: string): boolean {
    const patterns = [
      /query\([`'"].*\$\{.*\}.*[`'"]\)/,
      /query\([`'"].*\+.*[`'"]\)/,
      /\.raw\([`'"].*\$\{.*\}.*[`'"]\)/,
    ];
    
    return patterns.some(pattern => pattern.test(line));
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
