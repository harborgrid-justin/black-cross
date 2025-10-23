/**
 * Playbook Execution Engine
 * Adapted from OpenCTI Platform
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import type {
  Playbook,
  PlaybookExecution,
  ExecutionContext,
  ExecutionStep,
  ExecutionStatus,
  PlaybookComponent,
  ActionConfig,
  ConditionConfig,
  ActionType
} from './types';
import { ExecutionStatus as Status, ComponentType } from './types';

export class PlaybookExecutionEngine extends EventEmitter {
  private executions: Map<string, PlaybookExecution> = new Map();

  /**
   * Execute a playbook
   */
  async execute(
    playbook: Playbook,
    triggeredBy: string,
    triggerData?: any
  ): Promise<PlaybookExecution> {
    const execution: PlaybookExecution = {
      id: uuidv4(),
      playbook_id: playbook.id,
      status: Status.PENDING,
      started_at: new Date(),
      triggered_by: triggeredBy,
      trigger_data: triggerData,
      steps: []
    };

    this.executions.set(execution.id, execution);
    this.emit('execution:created', execution);

    // Start execution in background
    this.executePlaybook(playbook, execution).catch(error => {
      execution.status = Status.FAILED;
      execution.error = error.message;
      execution.completed_at = new Date();
      this.emit('execution:failed', execution, error);
    });

    return execution;
  }

  /**
   * Execute playbook workflow
   */
  private async executePlaybook(
    playbook: Playbook,
    execution: PlaybookExecution
  ): Promise<void> {
    execution.status = Status.RUNNING;
    this.emit('execution:started', execution);

    const context: ExecutionContext = {
      execution_id: execution.id,
      variables: execution.trigger_data || {},
      user_id: execution.triggered_by
    };

    try {
      // Find trigger component
      const trigger = playbook.components.find(c => c.type === ComponentType.TRIGGER);
      if (!trigger) {
        throw new Error('No trigger component found');
      }

      // Execute workflow starting from trigger
      if (trigger.next && trigger.next.length > 0) {
        for (const nextId of trigger.next) {
          await this.executeComponent(playbook, nextId, execution, context);
        }
      }

      execution.status = Status.COMPLETED;
      execution.completed_at = new Date();
      this.emit('execution:completed', execution);
    } catch (error: any) {
      execution.status = Status.FAILED;
      execution.error = error.message;
      execution.completed_at = new Date();
      throw error;
    }
  }

  /**
   * Execute a single component
   */
  private async executeComponent(
    playbook: Playbook,
    componentId: string,
    execution: PlaybookExecution,
    context: ExecutionContext
  ): Promise<any> {
    const component = playbook.components.find(c => c.id === componentId);
    if (!component) {
      throw new Error(`Component ${componentId} not found`);
    }

    const step: ExecutionStep = {
      component_id: componentId,
      component_name: component.name,
      status: Status.RUNNING,
      started_at: new Date()
    };

    execution.steps.push(step);
    this.emit('step:started', execution, step);

    try {
      let result: any;

      switch (component.type) {
        case ComponentType.ACTION:
          result = await this.executeAction(component, context);
          break;
        case ComponentType.CONDITION:
          result = await this.executeCondition(component, context);
          break;
        case ComponentType.LOOP:
          result = await this.executeLoop(playbook, component, execution, context);
          break;
        case ComponentType.PARALLEL:
          result = await this.executeParallel(playbook, component, execution, context);
          break;
        default:
          throw new Error(`Unsupported component type: ${component.type}`);
      }

      step.status = Status.COMPLETED;
      step.completed_at = new Date();
      step.output = result;
      this.emit('step:completed', execution, step);

      // Execute next components
      if (component.next && component.next.length > 0) {
        for (const nextId of component.next) {
          await this.executeComponent(playbook, nextId, execution, context);
        }
      }

      // Handle conditional branching
      if (component.type === ComponentType.CONDITION) {
        const config = component.config as ConditionConfig;
        const nextId = result ? config.trueNext : config.falseNext;
        if (nextId) {
          await this.executeComponent(playbook, nextId, execution, context);
        }
      }

      return result;
    } catch (error: any) {
      step.status = Status.FAILED;
      step.completed_at = new Date();
      step.error = error.message;
      this.emit('step:failed', execution, step, error);
      throw error;
    }
  }

  /**
   * Execute an action component
   */
  private async executeAction(
    component: PlaybookComponent,
    context: ExecutionContext
  ): Promise<any> {
    const config = component.config as ActionConfig;
    
    // Resolve variables in parameters
    const params = this.resolveVariables(config.parameters, context.variables);

    switch (config.actionType) {
      case 'create_incident':
        return { incident_id: uuidv4(), ...params };
      
      case 'update_entity':
        return { updated: true, entity_id: params.entity_id };
      
      case 'send_notification':
        console.log(`Notification: ${params.message}`);
        return { sent: true };
      
      case 'enrich_ioc':
        return { enriched: true, ioc: params.ioc };
      
      case 'run_query':
        return { results: [] };
      
      case 'http_request':
        // Simulate HTTP request
        return { status: 200, data: {} };
      
      case 'ai_analysis':
        return { analysis: 'AI analysis result' };
      
      case 'export_data':
        return { file_path: '/exports/data.json' };
      
      default:
        throw new Error(`Unknown action type: ${config.actionType}`);
    }
  }

  /**
   * Execute a condition component
   */
  private async executeCondition(
    component: PlaybookComponent,
    context: ExecutionContext
  ): Promise<boolean> {
    const config = component.config as ConditionConfig;
    
    // Simple expression evaluation
    // In production, use a safe eval library
    try {
      const func = new Function(...Object.keys(context.variables), `return ${config.expression}`);
      return func(...Object.values(context.variables));
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Execute a loop component
   */
  private async executeLoop(
    playbook: Playbook,
    component: PlaybookComponent,
    execution: PlaybookExecution,
    context: ExecutionContext
  ): Promise<any[]> {
    // Simplified loop execution
    return [];
  }

  /**
   * Execute parallel branches
   */
  private async executeParallel(
    playbook: Playbook,
    component: PlaybookComponent,
    execution: PlaybookExecution,
    context: ExecutionContext
  ): Promise<any[]> {
    // Simplified parallel execution
    return [];
  }

  /**
   * Resolve variables in object
   */
  private resolveVariables(obj: any, variables: Record<string, any>): any {
    if (typeof obj === 'string') {
      return obj.replace(/\{\{(\w+)\}\}/g, (match, name) => variables[name] || match);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveVariables(item, variables));
    }
    
    if (obj && typeof obj === 'object') {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveVariables(value, variables);
      }
      return resolved;
    }
    
    return obj;
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): PlaybookExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    execution.status = Status.CANCELLED;
    execution.completed_at = new Date();
    this.emit('execution:cancelled', execution);
  }
}

/**
 * Singleton instance
 */
export const executionEngine = new PlaybookExecutionEngine();
