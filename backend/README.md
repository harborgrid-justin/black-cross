# Black-Cross Backend

Enterprise-grade Cyber Threat Intelligence Platform - Backend API

## Overview

The backend provides a RESTful API and real-time WebSocket connections for the Black-Cross platform. Built with Node.js, Express, and Prisma ORM.

## Tech Stack

- **Node.js 16+** - Runtime environment
- **TypeScript** - Type-safe development (migration in progress)
- **Express** - Web framework
- **Prisma ORM** - Database ORM for PostgreSQL
- **MongoDB** - Document database (for specific modules)
- **Redis** - Caching and session management
- **Elasticsearch** - Search and analytics
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Winston** - Logging

## Getting Started

### Quick Setup

Use the automated setup from the root directory:

```bash
cd ..  # Go to root directory
npm run setup
docker-compose up -d postgres
npm run prisma:migrate
```

See [SETUP.md](../SETUP.md) for detailed instructions.

### Manual Setup

If you prefer to set up the backend manually:

#### Prerequisites

- Node.js 16+
- PostgreSQL 13+
- MongoDB 4.4+ (optional, for legacy modules)
- Redis 6+
- Elasticsearch 8+ (optional)

#### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up Prisma and database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run db:seed
```

### Development

```bash
# Start development server with auto-reload (TypeScript)
npm run dev

# Or use JavaScript version (legacy)
npm run dev:js

# Server will run on http://localhost:8080
```

### TypeScript Development

The backend is being migrated to TypeScript for improved type safety:

```bash
# Type check without building
npm run type-check

# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run build:watch
```

### Production

```bash
# Build and start production server
npm run build
npm start

# Or use JavaScript version (during migration)
npm run start:js
```

## Project Structure

```
backend/
├── index.ts              # Application entry point (TypeScript)
├── index.js              # Legacy JS entry point
├── types/                # TypeScript type definitions
│   └── index.ts
├── modules/              # Feature modules
│   ├── threat-intelligence/
│   ├── automation/
│   └── risk-assessment/
├── dist/                 # Compiled TypeScript output
├── config/               # Configuration files
├── scripts/              # Utility scripts
├── tsconfig.json         # TypeScript configuration
│   ├── migrate.js
│   ├── seed.js
│   └── create-admin.js
├── tests/                # Test files
├── package.json
└── .env.example
```

## Module Structure

Each module follows this structure:

```
module-name/
├── controllers/      # Request handlers
├── models/          # Data models (Mongoose or Prisma)
├── services/        # Business logic
├── routes/          # API routes
├── validators/      # Input validation
├── utils/           # Utilities
├── tests/           # Module tests
└── index.js         # Module entry point
```

## API Endpoints

### Health Check
- `GET /health` - System health status

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token

### Threat Intelligence
- `GET /api/v1/threat-intelligence/threats` - List threats
- `GET /api/v1/threat-intelligence/threats/:id` - Get threat details
- `POST /api/v1/threat-intelligence/threats` - Create threat
- `PUT /api/v1/threat-intelligence/threats/:id` - Update threat
- `DELETE /api/v1/threat-intelligence/threats/:id` - Delete threat

### Automation
- `GET /api/v1/automation/playbooks` - List playbooks
- `POST /api/v1/automation/playbooks/:id/execute` - Execute playbook
- `GET /api/v1/automation/executions` - List executions

### Risk Assessment
- `GET /api/v1/risk/assessments` - List risk assessments
- `POST /api/v1/risk/assessments` - Create assessment
- `GET /api/v1/risk/score/:assetId` - Get risk score

## Database

The backend uses **Prisma ORM** with **PostgreSQL** for structured data and **MongoDB** for flexible schema requirements in specific modules.

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio
```

### Database Models

Core models managed by Prisma:
- Users
- Incidents
- Vulnerabilities
- Assets
- IOCs
- Threat Actors
- Audit Logs
- Playbook Executions

See `../prisma/schema.prisma` for full schema definition.

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run integration tests
npm run test:integration

# Run specific test file
npm test -- path/to/test.js
```

## Linting

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

## Environment Variables

Key environment variables (see `.env.example`):

```env
# Application
NODE_ENV=development
APP_PORT=8080

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/blackcross
MONGODB_URI=mongodb://localhost:27017/blackcross

# Security
JWT_SECRET=your_secret_key
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Login via `/api/v1/auth/login` to receive a token
2. Include token in requests: `Authorization: Bearer <token>`
3. Token expires after 24 hours by default

## Logging

Winston logger is used for structured logging:

- **info** - General information
- **warn** - Warning messages
- **error** - Error messages
- **debug** - Debug information (dev only)

Logs are written to:
- Console (development)
- `logs/app.log` (production)

## Error Handling

Standard error response format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per 15 minutes per IP
- Configurable via environment variables

## Security

Security features:
- Helmet.js for security headers
- CORS protection
- Input validation with Joi
- SQL injection prevention (Prisma)
- XSS protection
- CSRF tokens for state-changing operations

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update documentation
4. Follow JavaScript/Node.js best practices
5. Run linter before committing

## Deployment

### Using Docker

```bash
# Build image
docker build -t black-cross-backend .

# Run container
docker run -p 8080:8080 --env-file .env black-cross-backend
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start index.js --name black-cross-backend

# Monitor
pm2 monit
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Reset Prisma Client
npm run prisma:generate
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Support

For issues and questions:
- Check documentation in `/docs`
- Review module-specific READMEs
- Check GitHub issues

## License

MIT
