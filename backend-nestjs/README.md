# Black-Cross NestJS Backend

Enterprise-grade cyber threat intelligence platform backend built with NestJS.

## Overview

This is a complete migration of the Black-Cross backend from Express.js to NestJS, providing:
- 20+ feature modules for comprehensive threat intelligence
- Enterprise security with JWT authentication
- RESTful API with Swagger documentation
- Sequelize ORM for PostgreSQL
- Mongoose for MongoDB
- Redis caching support

## Quick Start

### Prerequisites
- Node.js >= 20.0.0
- PostgreSQL
- MongoDB (optional)
- Redis (optional)

### Installation & Running

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run start:dev

# Build for production
npm run build
npm run start:prod
```

## API Documentation

Access the interactive Swagger documentation at: **http://localhost:8080/api/v1/docs**

## 20+ Feature Modules

All modules follow consistent patterns with CRUD operations and health checks:

1. **threat-intelligence** - Real-time threat data collection
2. **incident-response** - Security incident tracking
3. **threat-hunting** - Proactive threat detection
4. **vulnerability-management** - Vulnerability tracking
5. **siem** - Security event management
6. **threat-actors** - Adversary tracking
7. **ioc-management** - IOC management
8. **threat-feeds** - External feed integration
9. **risk-assessment** - Risk scoring
10. **collaboration** - Team workflow
11. **reporting** - Report generation
12. **malware-analysis** - Malware sandbox
13. **dark-web** - Dark web monitoring
14. **compliance** - Compliance tracking
15. **automation** - Response automation
16. **code-review** - Security code review
17. **notifications** - Alert management
18. **case-management** - Case tracking
19. **metrics** - Performance metrics
20. **dashboard** - Real-time dashboards
21. **draft-workspace** - Draft management

## Architecture

- **Base Classes**: `BaseController` and `BaseService` provide standard CRUD operations
- **Authentication**: JWT with Passport.js
- **Database**: Multi-database support (PostgreSQL primary, MongoDB optional)
- **Documentation**: Auto-generated Swagger/OpenAPI
- **Security**: Helmet, CORS, rate limiting, validation

## Key Endpoints

- `POST /api/v1/auth/login` - Authentication
- `GET /api/v1/auth/me` - Current user
- `GET /health` - Platform health
- `GET /api/v1/{module}/health` - Module health

Each module provides standard REST endpoints: GET, POST, PUT, DELETE

## Migration Notes

This is a 100% NestJS-compliant replacement for the Express backend. Key improvements:
- Modular architecture with dependency injection
- Full TypeScript with decorators
- Built-in testing framework
- Auto-generated API documentation
- Better code organization and maintainability

See `.env.example` for configuration options.
