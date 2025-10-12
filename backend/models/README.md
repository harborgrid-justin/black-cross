# Sequelize Models

This directory contains the Sequelize TypeScript models for the Black-Cross platform.

## Overview

Black-Cross uses **Sequelize ORM** with **TypeScript decorators** for PostgreSQL database management. The models define the core data structures for:

- User Management
- Incident Management
- Vulnerability Management  
- Asset Management
- IOC (Indicators of Compromise)
- Threat Actors
- Audit Logs
- Playbook Executions

## Database Connection

The application connects to a **Neon PostgreSQL** serverless database. Connection details are configured in `backend/.env`:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

## Model Structure

Each model is defined using `sequelize-typescript` decorators:

```typescript
import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  underscored: true,
  timestamps: true,
})
export default class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  email!: string;
  
  // ... more fields
}
```

## Available Models

### User
- **File**: `User.ts`
- **Table**: `users`
- **Purpose**: User accounts and authentication
- **Key Fields**: email, username, password, role, isActive

### Incident
- **File**: `Incident.ts`
- **Table**: `incidents`
- **Purpose**: Security incidents and their lifecycle
- **Key Fields**: title, severity, status, priority, assignedToId

### Vulnerability
- **File**: `Vulnerability.ts`
- **Table**: `vulnerabilities`
- **Purpose**: CVE tracking and vulnerability management
- **Key Fields**: cveId, title, severity, cvssScore, status

### Asset
- **File**: `Asset.ts`
- **Table**: `assets`
- **Purpose**: IT asset inventory and management
- **Key Fields**: name, type, ipAddress, criticality

### AuditLog
- **File**: `AuditLog.ts`
- **Table**: `audit_logs`
- **Purpose**: Audit trail for all user actions
- **Key Fields**: userId, action, resource, timestamp

### IOC
- **File**: `IOC.ts`
- **Table**: `iocs`
- **Purpose**: Indicators of Compromise tracking
- **Key Fields**: type, value, severity, confidence

### ThreatActor
- **File**: `ThreatActor.ts`
- **Table**: `threat_actors`
- **Purpose**: Threat actor intelligence and tracking
- **Key Fields**: name, aliases, sophistication, country

### PlaybookExecution
- **File**: `PlaybookExecution.ts`
- **Table**: `playbook_executions`
- **Purpose**: Automation playbook execution history
- **Key Fields**: playbookId, status, startedAt, result

## Database Operations

### Sync Database Models

The application automatically syncs models on startup. To manually sync:

```bash
npm run db:sync
```

This will create/update tables based on model definitions.

### Using Models in Code

Import models from the models directory:

```typescript
import User from '../models/User';
import Incident from '../models/Incident';

// Create a new record
const user = await User.create({
  email: 'user@example.com',
  username: 'user123',
  password: hashedPassword,
  role: 'analyst'
});

// Query records
const incidents = await Incident.findAll({
  where: { status: 'open' },
  order: [['createdAt', 'DESC']],
  limit: 10
});

// Update a record
await user.update({ lastLogin: new Date() });

// Delete a record
await user.destroy();
```

## Repositories

For more complex operations, use the repository pattern in `backend/repositories/`:

```typescript
import { userRepository } from '../repositories';

// Find user by email
const user = await userRepository.findByEmail('user@example.com');

// List with pagination
const result = await userRepository.list({
  page: 1,
  pageSize: 20,
  search: 'john'
});
```

## Best Practices

1. **Use Repositories**: Prefer repositories over direct model access for business logic
2. **Type Safety**: Leverage TypeScript types from model definitions
3. **Transactions**: Use Sequelize transactions for multi-step operations
4. **Validation**: Add model-level validations using Sequelize decorators
5. **Indexes**: Define indexes in model decorators for query performance

## Migration from Prisma

This project was migrated from Prisma to Sequelize. Key differences:

- **Schema**: Defined in TypeScript models (not `schema.prisma`)
- **Migrations**: Use `db:sync` instead of `prisma migrate`
- **Query API**: Sequelize methods instead of Prisma Client
- **Types**: Model types are inferred from class definitions

## Support

For questions or issues:
- Check Sequelize documentation: https://sequelize.org/
- Review model definitions in this directory
- See `backend/repositories/` for usage examples
