# Prisma Database Schema

This directory contains the Prisma schema and migrations for the Black-Cross platform.

## Overview

Black-Cross uses Prisma ORM for PostgreSQL database management. The schema defines the core data models for:

- User Management
- Incident Management
- Vulnerability Management
- Asset Management
- IOC (Indicators of Compromise)
- Threat Actors
- Audit Logs
- Playbook Executions

## Setup

### Quick Setup (Recommended)

The easiest way to set up Prisma and the database:

```bash
# From the root directory
npm run setup
docker-compose up -d postgres
npm run prisma:migrate
```

This is handled automatically by the [setup script](../SETUP.md).

### Manual Setup

If you prefer to set up manually:

#### Prerequisites

- PostgreSQL 13+ installed and running
- Node.js 16+ installed

#### Environment Variables

Create a `backend/.env` file with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blackcross?schema=public"
```

#### Initial Setup Steps

1. Install dependencies:
```bash
cd backend
npm install
```

2. Generate Prisma Client:
```bash
npm run prisma:generate
```

3. Run migrations:
```bash
npm run prisma:migrate
```

4. (Optional) Open Prisma Studio to view/edit data:
```bash
npm run prisma:studio
```

## Creating Migrations

When you modify the schema:

1. Edit `prisma/schema.prisma`
2. Create a migration:
```bash
cd backend
npm run prisma:migrate
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Regenerate the Prisma Client

## Database Models

### User
User accounts and authentication

### Incident
Security incidents and their lifecycle

### Vulnerability
CVE tracking and vulnerability management

### Asset
IT asset inventory and management

### AuditLog
Audit trail for all user actions

### IOC
Indicators of Compromise tracking

### ThreatActor
Threat actor intelligence and tracking

### PlaybookExecution
Automation playbook execution history

## Best Practices

1. **Always create migrations** - Never edit the database directly
2. **Use descriptive migration names** - Makes it easier to understand changes
3. **Test migrations** - Test on development before production
4. **Keep schema.prisma updated** - Source of truth for database structure
5. **Use transactions** - For complex operations that need atomicity

## Querying with Prisma

Example usage in backend code:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Find all open incidents
const incidents = await prisma.incident.findMany({
  where: { status: 'open' },
  include: { assignedTo: true }
});

// Create a new user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    username: 'user123',
    password: hashedPassword,
    role: 'analyst'
  }
});
```

## Migration History

Migrations are stored in `prisma/migrations/` directory. Each migration includes:
- SQL file with the changes
- Migration metadata

## Troubleshooting

### Reset Database
```bash
cd backend
npx prisma migrate reset
```

### View Database with Prisma Studio
```bash
cd backend
npm run prisma:studio
```

### Generate Client After Schema Changes
```bash
cd backend
npm run prisma:generate
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
