# Migration Guide: New Project Structure

## Overview

Black-Cross has been restructured to follow Google engineering best practices with a clear separation between frontend, backend, and database layers.

## What Changed

### Old Structure
```
black-cross/
├── client/           # Frontend
├── src/              # Backend
└── package.json
```

### New Structure
```
black-cross/
├── frontend/         # React + TypeScript frontend (previously client/)
├── backend/          # Node.js + Express backend (previously src/)
├── prisma/           # Database schema and migrations (NEW)
└── package.json      # Root workspace configuration
```

## Key Changes

### 1. Directory Restructuring
- `client/` → `frontend/`
- `src/` → `backend/`
- New `prisma/` directory for database management

### 2. Package Management
- Root now uses npm workspaces
- Each workspace (frontend, backend) has its own package.json
- Run commands from root or within specific workspace

### 3. Database Management
- Added Prisma ORM for PostgreSQL
- Prisma schema in `prisma/schema.prisma`
- Migrations managed by Prisma
- MongoDB still available for modules requiring flexible schemas

### 4. Environment Configuration
- Separate `.env` files for frontend and backend
- Backend: `backend/.env`
- Frontend: `frontend/.env`
- Root `.env.example` as reference

### 5. Docker Configuration
- Updated docker-compose.yml
- Separate Dockerfiles for frontend and backend
- Updated service names (`api` → `backend`)

## Migration Steps for Developers

### 1. Update Your Local Clone

```bash
# Pull the latest changes
git pull origin main

# Remove old node_modules
rm -rf node_modules client/node_modules

# Install dependencies for all workspaces
npm run install:all
```

### 2. Update Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit with your configuration
nano backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
# Edit with your API URL
nano frontend/.env
```

### 3. Set Up Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Update Your Development Workflow

#### Old Commands
```bash
# Old way
npm run dev              # Start backend
cd client && npm run dev # Start frontend
```

#### New Commands
```bash
# New way - from root directory
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Or from individual directories
cd backend && npm run dev
cd frontend && npm run dev
```

### 5. Update Docker Commands

#### Old Commands
```bash
docker-compose exec api npm run db:migrate
```

#### New Commands
```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:generate
```

## Updated Scripts

### Root Package.json Scripts

```json
{
  "dev": "Run both frontend and backend",
  "dev:backend": "Start backend development server",
  "dev:frontend": "Start frontend development server",
  "build": "Build both frontend and backend",
  "test": "Run all tests",
  "lint": "Lint all code",
  "prisma:generate": "Generate Prisma Client",
  "prisma:migrate": "Run database migrations",
  "prisma:studio": "Open Prisma Studio"
}
```

### Backend Scripts

```json
{
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "jest --coverage",
  "lint": "eslint **/*.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

### Frontend Scripts

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx"
}
```

## Path Updates

### Import Paths

If you have any hardcoded paths in your code:

#### Backend
```javascript
// Old
const module = require('./src/modules/threat-intelligence');

// New
const module = require('./modules/threat-intelligence');
```

#### Frontend
No changes needed - relative imports remain the same.

### Docker Volumes

```yaml
# Old
volumes:
  - ./src:/app/src

# New
volumes:
  - ./backend:/app
  - ./prisma:/app/prisma
```

## Database Changes

### New Prisma Models

The following models are now managed by Prisma (PostgreSQL):
- User
- Incident
- Vulnerability
- Asset
- AuditLog
- IOC
- ThreatActor
- PlaybookExecution

### MongoDB Models (Unchanged)

These remain in MongoDB for flexibility:
- Threat (threat-intelligence module)
- Playbook (automation module)
- ThreatCorrelation
- RiskAssessment

### Using Prisma Client

```javascript
// Import Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Example: Query users
const users = await prisma.user.findMany({
  where: { isActive: true }
});

// Example: Create incident
const incident = await prisma.incident.create({
  data: {
    title: 'Security Breach',
    severity: 'critical',
    status: 'open'
  }
});
```

## IDE Configuration

### VSCode

Update `.vscode/settings.json` if you have one:

```json
{
  "eslint.workingDirectories": [
    "frontend",
    "backend"
  ],
  "typescript.tsdk": "frontend/node_modules/typescript/lib"
}
```

## CI/CD Updates

Update your CI/CD pipelines:

```yaml
# Example GitHub Actions
jobs:
  test:
    steps:
      - name: Install dependencies
        run: npm run install:all
      
      - name: Generate Prisma Client
        run: npm run prisma:generate
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

## Troubleshooting

### Issue: Module not found

**Solution**: Ensure you've installed dependencies in the correct workspace:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Issue: Prisma Client not generated

**Solution**: Generate the Prisma Client:
```bash
npm run prisma:generate
```

### Issue: Docker containers failing to start

**Solution**: Update service names in your commands:
```bash
# Old
docker-compose exec api sh

# New
docker-compose exec backend sh
```

### Issue: Environment variables not loading

**Solution**: Ensure .env files are in the correct locations:
- `backend/.env` for backend config
- `frontend/.env` for frontend config

## Benefits of New Structure

1. **Clear Separation**: Frontend, backend, and database are clearly separated
2. **Google Best Practices**: Follows industry-standard monorepo structure
3. **Type Safety**: Prisma provides type-safe database access
4. **Better Organization**: Each component is self-contained
5. **Easier Scaling**: Can deploy frontend and backend independently
6. **Better DX**: Clearer mental model for developers

## Getting Help

- Check [ARCHITECTURE_NEW.md](./ARCHITECTURE_NEW.md) for detailed architecture
- See [backend/README.md](./backend/README.md) for backend docs
- See [frontend/README.md](./frontend/README.md) for frontend docs
- See [prisma/README.md](./prisma/README.md) for Prisma docs

## Questions?

If you have questions about the migration:
1. Check this guide first
2. Review the documentation in each directory
3. Check existing GitHub issues
4. Create a new issue if needed
