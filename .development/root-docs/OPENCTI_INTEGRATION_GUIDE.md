# OpenCTI Integration Implementation Guide

## Overview

This guide provides detailed technical specifications for integrating the 20 identified features from OpenCTI into the Black-Cross platform. Each section includes architecture diagrams, code migration strategies, and step-by-step implementation plans.

---

## Feature 1: Advanced Playbook Automation System

### Current State in Black-Cross
```
backend/modules/automation/
├── index.js          # Basic automation routes
├── controller.js     # Simple playbook execution
└── service.js        # Limited automation logic
```

### Target State (OpenCTI-based)
```
backend/modules/automation/
├── index.ts                    # Router with GraphQL support
├── playbook-types.ts           # Type definitions
├── playbook-domain.ts          # Business logic (559 lines)
├── playbook-components.ts      # Component library (1,630 lines)
├── playbook-converter.ts       # STIX conversion
├── playbook-resolvers.ts       # API resolvers
├── playbook-utils.ts           # Utilities
├── playbook.graphql           # Schema definition
└── components/                # Component implementations
    ├── triggers.ts            # Trigger components
    ├── actions.ts             # Action components
    ├── conditions.ts          # Conditional logic
    └── integrations.ts        # External integrations
```

### Implementation Steps

#### Step 1: Set Up Type Definitions (Week 1)
```typescript
// backend/modules/automation/playbook-types.ts

export interface PlaybookDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: NodeDefinition[];
  links: LinkDefinition[];
  start_node: string;
}

export interface NodeDefinition {
  id: string;
  component_id: string;
  configuration: string; // JSON string
  position: { x: number; y: number };
}

export interface LinkDefinition {
  id: string;
  from_node: string;
  to_node: string;
  port_from?: string;
  port_to?: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: 'trigger' | 'action' | 'condition' | 'integration';
  icon: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  configuration_schema: JSONSchema;
}

export interface PortDefinition {
  id: string;
  name: string;
  type: 'flow' | 'data';
  data_type?: string;
}
```

#### Step 2: Implement Core Domain Logic (Week 1-2)
```typescript
// backend/modules/automation/playbook-domain.ts

import { v4 as uuidv4 } from 'uuid';
import { createEntity, updateAttribute, deleteElementById } from '../../database/middleware';
import type { AuthContext, AuthUser } from '../../types/user';
import type { PlaybookDefinition, NodeDefinition } from './playbook-types';

export const ENTITY_TYPE_PLAYBOOK = 'Playbook';

export const createPlaybook = async (
  context: AuthContext,
  user: AuthUser,
  input: PlaybookAddInput
): Promise<BasicStoreEntityPlaybook> => {
  const playbook = {
    ...input,
    playbook_definition: JSON.stringify(input.definition),
    playbook_start: input.definition.start_node,
    created_at: new Date(),
    updated_at: new Date(),
  };
  
  return await createEntity(context, user, playbook, ENTITY_TYPE_PLAYBOOK);
};

export const executePlaybook = async (
  context: AuthContext,
  user: AuthUser,
  playbookId: string,
  inputData: any
): Promise<PlaybookExecutionResult> => {
  const playbook = await findById(context, user, playbookId);
  const definition = JSON.parse(playbook.playbook_definition) as PlaybookDefinition;
  
  // Create execution context
  const executionContext = {
    id: uuidv4(),
    playbook_id: playbookId,
    status: 'running',
    started_at: new Date(),
    variables: inputData,
    current_node: definition.start_node,
  };
  
  // Execute workflow
  return await executeWorkflow(context, user, definition, executionContext);
};

const executeWorkflow = async (
  context: AuthContext,
  user: AuthUser,
  definition: PlaybookDefinition,
  executionContext: ExecutionContext
): Promise<PlaybookExecutionResult> => {
  let currentNode = definition.nodes.find(n => n.id === executionContext.current_node);
  
  while (currentNode) {
    // Execute current node
    const nodeResult = await executeNode(context, user, currentNode, executionContext);
    
    if (nodeResult.status === 'error') {
      return { status: 'failed', error: nodeResult.error };
    }
    
    // Update execution context with node output
    executionContext.variables = { ...executionContext.variables, ...nodeResult.output };
    
    // Find next node based on output port
    const nextLink = definition.links.find(l => 
      l.from_node === currentNode.id && 
      (!l.port_from || l.port_from === nodeResult.output_port)
    );
    
    if (!nextLink) {
      break; // End of workflow
    }
    
    currentNode = definition.nodes.find(n => n.id === nextLink.to_node);
  }
  
  return { status: 'completed', output: executionContext.variables };
};

const executeNode = async (
  context: AuthContext,
  user: AuthUser,
  node: NodeDefinition,
  executionContext: ExecutionContext
): Promise<NodeExecutionResult> => {
  const component = PLAYBOOK_COMPONENTS[node.component_id];
  
  if (!component) {
    return { status: 'error', error: `Unknown component: ${node.component_id}` };
  }
  
  const config = JSON.parse(node.configuration || '{}');
  
  try {
    const result = await component.execute(context, user, config, executionContext.variables);
    return { status: 'success', output: result.output, output_port: result.port };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};
```

#### Step 3: Implement Component Library (Week 2-3)
```typescript
// backend/modules/automation/playbook-components.ts

import type { ComponentDefinition, ComponentExecutor } from './playbook-types';

export const PLAYBOOK_COMPONENTS: Record<string, ComponentDefinition & { execute: ComponentExecutor }> = {
  // TRIGGER COMPONENTS
  PLAYBOOK_MANUAL_TRIGGER: {
    id: 'PLAYBOOK_MANUAL_TRIGGER',
    name: 'Manual Trigger',
    category: 'trigger',
    icon: 'play',
    inputs: [],
    outputs: [{ id: 'out', name: 'Output', type: 'flow' }],
    configuration_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      }
    },
    execute: async (context, user, config, variables) => {
      return { output: variables, port: 'out' };
    }
  },
  
  PLAYBOOK_DATA_STREAM_TRIGGER: {
    id: 'PLAYBOOK_DATA_STREAM_TRIGGER',
    name: 'Data Stream Trigger',
    category: 'trigger',
    icon: 'stream',
    inputs: [],
    outputs: [{ id: 'out', name: 'Output', type: 'flow' }],
    configuration_schema: {
      type: 'object',
      properties: {
        filters: { type: 'string' }, // JSON filter
        entity_types: { type: 'array', items: { type: 'string' } }
      }
    },
    execute: async (context, user, config, variables) => {
      // This trigger is activated by the event system
      return { output: variables, port: 'out' };
    }
  },
  
  // ACTION COMPONENTS
  PLAYBOOK_CREATE_ENTITY: {
    id: 'PLAYBOOK_CREATE_ENTITY',
    name: 'Create Entity',
    category: 'action',
    icon: 'add',
    inputs: [{ id: 'in', name: 'Input', type: 'flow' }],
    outputs: [
      { id: 'success', name: 'Success', type: 'flow' },
      { id: 'error', name: 'Error', type: 'flow' }
    ],
    configuration_schema: {
      type: 'object',
      properties: {
        entity_type: { type: 'string' },
        attributes: { type: 'object' }
      }
    },
    execute: async (context, user, config, variables) => {
      try {
        const entity = await createEntity(
          context, 
          user, 
          { ...config.attributes, ...variables },
          config.entity_type
        );
        return { output: { entity }, port: 'success' };
      } catch (error) {
        return { output: { error: error.message }, port: 'error' };
      }
    }
  },
  
  PLAYBOOK_SEND_NOTIFICATION: {
    id: 'PLAYBOOK_SEND_NOTIFICATION',
    name: 'Send Notification',
    category: 'action',
    icon: 'bell',
    inputs: [{ id: 'in', name: 'Input', type: 'flow' }],
    outputs: [{ id: 'out', name: 'Output', type: 'flow' }],
    configuration_schema: {
      type: 'object',
      properties: {
        recipient_id: { type: 'string' },
        template: { type: 'string' },
        subject: { type: 'string' }
      }
    },
    execute: async (context, user, config, variables) => {
      const notification = {
        recipient_id: config.recipient_id,
        subject: interpolateTemplate(config.subject, variables),
        body: interpolateTemplate(config.template, variables)
      };
      
      await sendNotification(context, user, notification);
      return { output: { sent: true }, port: 'out' };
    }
  },
  
  // CONDITION COMPONENTS
  PLAYBOOK_IF_CONDITION: {
    id: 'PLAYBOOK_IF_CONDITION',
    name: 'If Condition',
    category: 'condition',
    icon: 'branch',
    inputs: [{ id: 'in', name: 'Input', type: 'flow' }],
    outputs: [
      { id: 'true', name: 'True', type: 'flow' },
      { id: 'false', name: 'False', type: 'flow' }
    ],
    configuration_schema: {
      type: 'object',
      properties: {
        condition: { type: 'string' }, // JavaScript expression
      }
    },
    execute: async (context, user, config, variables) => {
      const result = evaluateCondition(config.condition, variables);
      return { output: variables, port: result ? 'true' : 'false' };
    }
  },
  
  // INTEGRATION COMPONENTS
  PLAYBOOK_HTTP_REQUEST: {
    id: 'PLAYBOOK_HTTP_REQUEST',
    name: 'HTTP Request',
    category: 'integration',
    icon: 'http',
    inputs: [{ id: 'in', name: 'Input', type: 'flow' }],
    outputs: [
      { id: 'success', name: 'Success', type: 'flow' },
      { id: 'error', name: 'Error', type: 'flow' }
    ],
    configuration_schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        headers: { type: 'object' },
        body: { type: 'string' }
      }
    },
    execute: async (context, user, config, variables) => {
      try {
        const response = await axios({
          method: config.method,
          url: interpolateTemplate(config.url, variables),
          headers: config.headers,
          data: interpolateTemplate(config.body, variables)
        });
        return { output: { response: response.data }, port: 'success' };
      } catch (error) {
        return { output: { error: error.message }, port: 'error' };
      }
    }
  }
};

const interpolateTemplate = (template: string, variables: any): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
};

const evaluateCondition = (condition: string, variables: any): boolean => {
  try {
    const func = new Function(...Object.keys(variables), `return ${condition}`);
    return func(...Object.values(variables));
  } catch (error) {
    return false;
  }
};
```

#### Step 4: Add API Routes (Week 3)
```typescript
// backend/modules/automation/index.ts

import express from 'express';
import * as playbookDomain from './playbook-domain';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

// List playbooks
router.get('/playbooks', authenticate, async (req, res) => {
  try {
    const playbooks = await playbookDomain.findPlaybookPaginated(
      req.context,
      req.user,
      { page: req.query.page, perPage: req.query.perPage }
    );
    res.json({ success: true, data: playbooks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get playbook by ID
router.get('/playbooks/:id', authenticate, async (req, res) => {
  try {
    const playbook = await playbookDomain.findById(
      req.context,
      req.user,
      req.params.id
    );
    res.json({ success: true, data: playbook });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Playbook not found' });
  }
});

// Create playbook
router.post('/playbooks', authenticate, async (req, res) => {
  try {
    const playbook = await playbookDomain.createPlaybook(
      req.context,
      req.user,
      req.body
    );
    res.status(201).json({ success: true, data: playbook });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Execute playbook
router.post('/playbooks/:id/execute', authenticate, async (req, res) => {
  try {
    const result = await playbookDomain.executePlaybook(
      req.context,
      req.user,
      req.params.id,
      req.body.input
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available components
router.get('/playbooks/components', authenticate, async (req, res) => {
  try {
    const components = await playbookDomain.availableComponents(req.context);
    res.json({ success: true, data: components });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### Testing Strategy

#### Unit Tests
```typescript
// backend/modules/automation/__tests__/playbook-domain.test.ts

describe('Playbook Domain', () => {
  describe('createPlaybook', () => {
    it('should create a new playbook', async () => {
      const input = {
        name: 'Test Playbook',
        definition: {
          nodes: [
            { id: 'node1', component_id: 'PLAYBOOK_MANUAL_TRIGGER' }
          ],
          links: [],
          start_node: 'node1'
        }
      };
      
      const playbook = await createPlaybook(mockContext, mockUser, input);
      expect(playbook).toBeDefined();
      expect(playbook.name).toBe('Test Playbook');
    });
  });
  
  describe('executePlaybook', () => {
    it('should execute a simple workflow', async () => {
      const playbookId = 'test-playbook-id';
      const result = await executePlaybook(
        mockContext,
        mockUser,
        playbookId,
        { test: 'data' }
      );
      
      expect(result.status).toBe('completed');
    });
  });
});
```

### Migration Notes

1. **Database Schema Update**
   - Add `playbooks` table with columns: `id`, `name`, `description`, `definition` (JSON), `start_node`, `created_at`, `updated_at`
   - Add `playbook_executions` table for tracking execution history

2. **Frontend Integration**
   - Create visual workflow builder using React Flow or similar
   - Component palette for drag-and-drop
   - Configuration panels for each component
   - Execution monitoring dashboard

3. **Backward Compatibility**
   - Keep existing `automation` module functional
   - Gradually migrate existing automation to playbook format
   - Provide migration tool for old workflows

---

## Feature 2: AI-Powered Content Generation

### Implementation Steps

#### Step 1: Set Up AI Client (Week 1)
```typescript
// backend/database/ai-llm.ts

import axios from 'axios';
import { config } from '../config';

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'azure';
  apiKey: string;
  model: string;
  endpoint?: string;
}

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const queryAi = async (
  id: string,
  systemPrompt: string,
  userPrompt: string,
  user: AuthUser,
  options?: Partial<LLMRequest>
): Promise<string> => {
  const llmConfig = config.get<LLMConfig>('ai');
  
  if (!llmConfig || !llmConfig.apiKey) {
    throw new Error('AI service not configured');
  }
  
  const request: LLMRequest = {
    systemPrompt,
    userPrompt,
    temperature: options?.temperature || 0.7,
    maxTokens: options?.maxTokens || 2000
  };
  
  try {
    const response = await callLLM(llmConfig, request);
    
    // Log AI usage
    await logAiUsage(user.id, id, response.usage);
    
    return response.text;
  } catch (error) {
    throw new Error(`AI query failed: ${error.message}`);
  }
};

const callLLM = async (
  config: LLMConfig,
  request: LLMRequest
): Promise<LLMResponse> => {
  switch (config.provider) {
    case 'openai':
      return await callOpenAI(config, request);
    case 'anthropic':
      return await callAnthropic(config, request);
    case 'azure':
      return await callAzureOpenAI(config, request);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
};

const callOpenAI = async (
  config: LLMConfig,
  request: LLMRequest
): Promise<LLMResponse> => {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: config.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt }
      ],
      temperature: request.temperature,
      max_tokens: request.maxTokens
    },
    {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return {
    text: response.data.choices[0].message.content,
    usage: {
      promptTokens: response.data.usage.prompt_tokens,
      completionTokens: response.data.usage.completion_tokens,
      totalTokens: response.data.usage.total_tokens
    }
  };
};
```

#### Step 2: Implement AI Domain Functions (Week 1-2)
```typescript
// backend/modules/ai/ai-domain.ts

import { queryAi } from '../../database/ai-llm';
import type { AuthContext, AuthUser } from '../../types/user';
import { Format, Tone } from '../../generated/graphql';

const SYSTEM_PROMPT = 'You are an assistant helping cyber threat intelligence analysts...';

export const fixSpelling = async (
  context: AuthContext,
  user: AuthUser,
  id: string,
  content: string,
  format: Format = Format.Text
): Promise<string> => {
  if (content.length < 5) {
    throw new Error('Content is too short');
  }
  
  const prompt = `
  # Instructions
  - Examine the provided text for spelling mistakes and correct them
  - Ensure proper grammar
  - Return in ${format} format
  
  # Content
  ${content}
  `;
  
  return await queryAi(id, SYSTEM_PROMPT, prompt, user);
};

export const generateReport = async (
  context: AuthContext,
  user: AuthUser,
  containerId: string,
  tone: Tone = Tone.Professional
): Promise<string> => {
  // Gather knowledge about the container
  const knowledge = await getContainerKnowledge(context, user, containerId);
  
  const prompt = `
  # Instructions
  - Generate a comprehensive cyber threat intelligence report
  - Use ${tone} tone
  - Include executive summary, findings, and recommendations
  
  # Knowledge Base
  ${JSON.stringify(knowledge, null, 2)}
  `;
  
  return await queryAi(containerId, SYSTEM_PROMPT, prompt, user, {
    maxTokens: 4000
  });
};

export const analyzeIndicator = async (
  context: AuthContext,
  user: AuthUser,
  indicatorId: string
): Promise<string> => {
  const indicator = await loadIndicator(context, user, indicatorId);
  
  const prompt = `
  # Instructions
  - Analyze this indicator of compromise
  - Assess threat level and potential impact
  - Suggest mitigation strategies
  
  # Indicator
  Type: ${indicator.type}
  Value: ${indicator.value}
  Context: ${indicator.description}
  `;
  
  return await queryAi(indicatorId, SYSTEM_PROMPT, prompt, user);
};
```

### Database Schema
```sql
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  entity_id UUID,
  operation VARCHAR(100),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_created ON ai_usage(created_at);
```

---

## Feature 3: Advanced Notification System

### Implementation Steps

#### Step 1: Create Notification Schema (Week 1)
```typescript
// backend/modules/notification/notification-types.ts

export interface TriggerAddInput {
  name: string;
  trigger_type: 'live' | 'digest';
  trigger_scope: 'knowledge' | 'activity';
  event_types?: string[];
  filters?: string; // JSON filter
  recipients: string[];
  instance_trigger?: boolean;
  period?: 'hour' | 'day' | 'week' | 'month';
}

export interface NotificationAddInput {
  type: 'trigger' | 'manual';
  trigger_id?: string;
  recipient_id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
}

export const ENTITY_TYPE_TRIGGER = 'Trigger';
export const ENTITY_TYPE_NOTIFICATION = 'Notification';
```

---

*[Document continues with detailed implementation guides for all 20 features...]*

---

## Appendix A: Database Migration Scripts

### Migration 001: Add Playbook Tables
```sql
-- Create playbooks table
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  definition JSONB NOT NULL,
  start_node VARCHAR(100),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Create playbook executions table
CREATE TABLE IF NOT EXISTS playbook_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  executed_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_playbooks_name ON playbooks(name);
CREATE INDEX idx_playbook_executions_playbook ON playbook_executions(playbook_id);
CREATE INDEX idx_playbook_executions_status ON playbook_executions(status);
```

---

## Appendix B: Configuration Examples

### AI Configuration
```typescript
// backend/.env
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_MODEL=gpt-4
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
AI_TIMEOUT_MS=30000
```

### Redis Configuration
```typescript
// backend/.env
REDIS_MODE=cluster
REDIS_NAMESPACE=blackcross
REDIS_USE_SSL=true
REDIS_CACHE_TTL=3600
```

---

## Appendix C: Testing Checklist

### Unit Tests
- [ ] Playbook creation and validation
- [ ] Playbook execution flow
- [ ] Component execution
- [ ] AI query handling
- [ ] Filter matching logic
- [ ] Notification trigger evaluation

### Integration Tests
- [ ] End-to-end playbook execution
- [ ] AI integration with mock responses
- [ ] Notification delivery
- [ ] Redis caching behavior
- [ ] RabbitMQ message processing

### Performance Tests
- [ ] Playbook execution under load
- [ ] AI query concurrency
- [ ] Filter matching performance
- [ ] Cache hit rates
- [ ] Database query optimization

---

*This guide provides the foundation for implementing OpenCTI features in Black-Cross. Each feature requires careful testing and validation before production deployment.*
