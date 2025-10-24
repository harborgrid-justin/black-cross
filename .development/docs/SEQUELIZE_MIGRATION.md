# Prisma to Sequelize Migration Guide

## Overview

Black-Cross has been migrated from **Prisma ORM** to **Sequelize ORM** for PostgreSQL database management. This guide explains the changes and how to work with the new setup.

## Why Sequelize?

- **Mature ecosystem** - Sequelize has been production-ready for many years
- **Flexible** - Better support for complex queries and custom SQL
- **TypeScript support** - Full TypeScript support with decorators
- **Active community** - Large community and extensive documentation

## What Changed

### Database Connection

**Before (Prisma):**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**After (Sequelize):**
```typescript
import { getSequelize } from '../config/sequelize';
import User from '../models/User';

const sequelize = getSequelize();
const user = await User.findByPk(id);
```

### Model Definitions

**Before (Prisma):**
- Defined in `prisma/schema.prisma`
- Generated TypeScript types

**After (Sequelize):**
- Defined in `backend/models/*.ts`
- TypeScript classes with decorators

Example:
```typescript
@Table({ tableName: 'users' })
export default class User extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  email!: string;
}
```

### Database Operations

**Before (Prisma):**
```typescript
// Find user
const user = await prisma.user.findUnique({
  where: { id }
});

// Create user
const newUser = await prisma.user.create({
  data: { email, username, password }
});

// Update user
await prisma.user.update({
  where: { id },
  data: { lastLogin: new Date() }
});
```

**After (Sequelize):**
```typescript
// Find user
const user = await User.findByPk(id);

// Create user
const newUser = await User.create({
  email, username, password
});

// Update user
await user.update({ lastLogin: new Date() });
```

### Querying

**Before (Prisma):**
```typescript
const incidents = await prisma.incident.findMany({
  where: {
    status: { in: ['open', 'investigating'] }
  },
  orderBy: { createdAt: 'desc' },
  take: 10
});
```

**After (Sequelize):**
```typescript
import { Op } from 'sequelize';

const incidents = await Incident.findAll({
  where: {
    status: { [Op.in]: ['open', 'investigating'] }
  },
  order: [['createdAt', 'DESC']],
  limit: 10
});
```

### Relationships

**Before (Prisma):**
```typescript
const incident = await prisma.incident.findUnique({
  where: { id },
  include: { assignedTo: true }
});
```

**After (Sequelize):**
```typescript
const incident = await Incident.findByPk(id, {
  include: [{ model: User, as: 'assignedTo' }]
});
```

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
cd backend
npm install sequelize sequelize-typescript pg pg-hstore
```

### 2. Configure Database

Update `backend/.env` with your database connection:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

For Neon PostgreSQL:
```env
DATABASE_URL="postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require"
```

### 3. Sync Database

On first run, sync the database schema:

```bash
npm run db:sync
```

This creates all tables based on model definitions.

### 4. Start Development

```bash
npm run dev
```

The application will automatically connect to the database on startup.

## Repository Pattern

Use repositories for business logic instead of direct model access:

```typescript
import { userRepository, incidentRepository } from '../repositories';

// Find user by email
const user = await userRepository.findByEmail('user@example.com');

// List incidents with pagination
const result = await incidentRepository.list({
  page: 1,
  pageSize: 20,
  status: 'open'
});
```

## Common Operations

### Pagination

```typescript
const { rows, count } = await User.findAndCountAll({
  offset: (page - 1) * pageSize,
  limit: pageSize,
  order: [['createdAt', 'DESC']]
});
```

### Search

```typescript
import { Op } from 'sequelize';

const users = await User.findAll({
  where: {
    [Op.or]: [
      { email: { [Op.iLike]: `%${search}%` } },
      { username: { [Op.iLike]: `%${search}%` } }
    ]
  }
});
```

### Transactions

```typescript
const sequelize = getSequelize();

await sequelize.transaction(async (t) => {
  const user = await User.create({ ... }, { transaction: t });
  await AuditLog.create({ 
    userId: user.id, 
    action: 'user_created' 
  }, { transaction: t });
});
```

### Raw Queries

```typescript
const [results] = await sequelize.query(
  'SELECT * FROM users WHERE email = ?',
  { replacements: ['user@example.com'] }
);
```

## Migration Checklist

If you're working with the codebase after this migration:

- [x] Remove Prisma dependencies (`@prisma/client`, `prisma`)
- [x] Remove `prisma/` directory (optional - kept for reference)
- [x] Update all database queries to use Sequelize
- [x] Update repositories to use Sequelize models
- [x] Test all CRUD operations
- [x] Update documentation

## Breaking Changes

### Scripts

**Removed:**
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`

**Added:**
- `npm run db:sync` - Sync database models

### Import Paths

**Before:**
```typescript
import { PrismaClient, User } from '@prisma/client';
```

**After:**
```typescript
import User from '../models/User';
import { getSequelize } from '../config/sequelize';
```

### Type Definitions

**Before:**
```typescript
import type { User, Incident } from '@prisma/client';
```

**After:**
```typescript
import type { User } from '../models/User';
// OR
type User = InstanceType<typeof UserModel>;
```

## Troubleshooting

### Connection Issues

```bash
# Check DATABASE_URL is set correctly
echo $DATABASE_URL

# Test connection
npx ts-node backend/scripts/test-connection.ts
```

### Model Sync Issues

```bash
# Force sync (WARNING: drops all tables)
# Only use in development!
npm run db:sync -- --force
```

### TypeScript Errors

Make sure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Resources

- **Sequelize Documentation**: https://sequelize.org/
- **Sequelize TypeScript**: https://github.com/sequelize/sequelize-typescript
- **Model Documentation**: `backend/models/README.md`
- **Repository Pattern**: `backend/repositories/`

## Support

For questions or issues:
1. Check this migration guide
2. Review `backend/models/README.md`
3. Check Sequelize documentation
4. Open a GitHub issue
