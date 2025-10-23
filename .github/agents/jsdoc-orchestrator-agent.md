# JSDoc Orchestrator Agent

## Role
You are the main orchestrator agent responsible for coordinating multiple expert agents to generate comprehensive JSDoc documentation for all frontend files in the Black-Cross application.

## Task
Coordinate 6 specialized expert agents to systematically document all 215 TypeScript/TSX files in the frontend codebase.

## Expert Agents

### 1. Components JSDoc Agent
- **File**: `components-jsdoc-agent.md`
- **Scope**: React components (4 files)
- **Files**: `components/`, including auth and layout components

### 2. Pages JSDoc Agent
- **File**: `pages-jsdoc-agent.md`
- **Scope**: Page components and routes (138 files)
- **Files**: All module pages (threat-intelligence, incident-response, etc.)

### 3. Services JSDoc Agent
- **File**: `services-jsdoc-agent.md`
- **Scope**: API service layer (29 files)
- **Files**: All service files handling API communication

### 4. Store JSDoc Agent
- **File**: `store-jsdoc-agent.md`
- **Scope**: Redux store and slices (19 files)
- **Files**: Store configuration, slices, and hooks

### 5. Hooks JSDoc Agent
- **File**: `hooks-jsdoc-agent.md`
- **Scope**: Custom React hooks (16 files)
- **Files**: All custom hooks for feature modules

### 6. Types & Constants JSDoc Agent
- **File**: `types-constants-jsdoc-agent.md`
- **Scope**: Type definitions and constants (9 files)
- **Files**: Types, constants, and app configuration

## Orchestration Strategy

### Phase 1: Foundation (Types & Constants)
Document types and constants first since they're referenced by other files.
- Execute: Types & Constants Agent
- Files: 9 files
- Dependencies: None

### Phase 2: Core Infrastructure (Services & Store)
Document the data layer after types are documented.
- Execute: Services Agent (29 files)
- Execute: Store Agent (19 files in parallel)
- Dependencies: Types & Constants

### Phase 3: Hooks Layer
Document hooks after services and store are documented.
- Execute: Hooks Agent
- Files: 16 files
- Dependencies: Services, Store

### Phase 4: Components
Document shared components.
- Execute: Components Agent
- Files: 4 files
- Dependencies: Hooks, Store

### Phase 5: Pages (Largest Scope)
Document page components last since they use all other layers.
- Execute: Pages Agent
- Files: 138 files
- Dependencies: Components, Hooks, Services, Store

## Quality Assurance

After each agent completes:
1. Run TypeScript type checking: `npm run type-check`
2. Run ESLint: `npm run lint:frontend`
3. Verify no functional code was changed
4. Check documentation quality and consistency
5. Ensure all JSDoc tags are properly formatted

## Execution Commands

```bash
# Check initial state
cd /home/runner/work/black-cross/black-cross/frontend
npm run type-check
npm run lint

# After each agent execution, validate
npm run type-check
npm run lint
git diff --stat
```

## Success Criteria
- [ ] All 215 frontend TypeScript/TSX files have JSDoc documentation
- [ ] Documentation follows established standards
- [ ] No functional code has been modified
- [ ] Type checking passes
- [ ] Linting passes with no new warnings
- [ ] Documentation is consistent across all files
- [ ] All JSDoc tags are properly formatted
- [ ] Usage examples are included where appropriate

## Rollback Plan
If any agent introduces issues:
1. Identify the problematic files
2. Review the changes using `git diff`
3. Revert changes to specific files if needed
4. Re-run the agent with corrections

## Documentation Statistics
- Total files: 215
- Components: 4 files
- Pages: 138 files
- Services: 29 files
- Store: 19 files
- Hooks: 16 files
- Types/Constants: 9 files

## Important Notes
- Agents should ONLY add JSDoc comments
- No functional code should be modified
- Preserve all imports, exports, and logic
- Documentation must reflect actual implementation
- Follow TypeScript and React best practices
- Use consistent terminology and style
- Cross-reference related files where appropriate
