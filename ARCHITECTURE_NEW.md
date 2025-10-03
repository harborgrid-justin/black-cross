# Black-Cross Architecture - Google Engineering Best Practices

## Overview

Black-Cross follows Google engineering best practices with a clean separation of concerns across frontend, backend, and data layers. The architecture is designed for scalability, maintainability, and developer productivity.

## Project Structure

```
black-cross/
├── frontend/              # React + TypeScript frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client and services
│   │   ├── store/        # Redux state management
│   │   └── types/        # TypeScript type definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── backend/               # Node.js + Express backend API
│   ├── modules/          # Feature modules
│   │   ├── threat-intelligence/
│   │   ├── automation/
│   │   └── risk-assessment/
│   ├── index.js          # Application entry point
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── prisma/               # Database schema and migrations
│   ├── schema.prisma    # Prisma schema definition
│   ├── migrations/      # Database migrations
│   └── README.md
│
├── docs/                 # Documentation
├── docker-compose.yml   # Docker orchestration
├── package.json         # Root workspace configuration
└── README.md
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

### Backend
- **Node.js 16+** - Runtime environment
- **Express** - Web framework
- **Prisma ORM** - Database ORM for PostgreSQL
- **MongoDB + Mongoose** - Document database (for flexible schemas)
- **Redis** - Caching and session management
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Winston** - Logging

### Database
- **PostgreSQL** - Primary relational database
- **Prisma ORM** - Type-safe database client
- **MongoDB** - Document database for flexible schemas
- **Redis** - In-memory cache and session store

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **NGINX** - Reverse proxy and static file serving
- **Elasticsearch** - Search and analytics (optional)
- **RabbitMQ** - Message queue (optional)

## Architecture Principles

### 1. Separation of Concerns
- **Frontend**: Pure presentation layer, no business logic
- **Backend**: Business logic and data access
- **Prisma**: Database schema and migrations

### 2. Monorepo Structure
- Uses npm workspaces for unified dependency management
- Each workspace (frontend, backend) is independently deployable
- Shared configurations at the root level

### 3. Type Safety
- TypeScript in frontend for compile-time type checking
- Prisma generates type-safe database client
- API contracts defined with TypeScript interfaces

### 4. Database Strategy
- **PostgreSQL + Prisma**: Primary database for structured data
  - Users, incidents, vulnerabilities, assets, audit logs
  - Strong typing with Prisma Client
  - Automatic migrations
- **MongoDB**: For modules requiring flexible schemas
  - Threat intelligence (dynamic attributes)
  - Playbook definitions (complex nested structures)
  - IoC metadata (variable structure)

### 5. API Design
- RESTful API following OpenAPI/Swagger standards
- Consistent response format
- Proper HTTP status codes
- Rate limiting and authentication on all endpoints

### 6. Security
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation at API boundary
- SQL injection prevention (Prisma parameterized queries)
- XSS protection
- CORS configuration
- Security headers (Helmet.js)

### 7. Scalability
- Stateless backend services
- Redis for session management
- Horizontal scaling capability
- Database connection pooling
- Caching strategies

### 8. Development Workflow
- Local development with hot reload
- Docker Compose for consistent environments
- Separate dev/staging/prod configurations
- Automated testing and linting

## Data Flow

### Frontend → Backend → Database

```
User Action (Frontend)
    ↓
React Component
    ↓
Redux Action
    ↓
API Service (Axios)
    ↓
HTTP Request
    ↓
Backend Route Handler
    ↓
Controller
    ↓
Service Layer
    ↓
Prisma Client / Mongoose Model
    ↓
Database (PostgreSQL / MongoDB)
```

### Real-time Updates

```
Backend Event
    ↓
Socket.IO Server
    ↓
WebSocket Connection
    ↓
Socket.IO Client (Frontend)
    ↓
Redux Store Update
    ↓
Component Re-render
```

## Module Architecture

Each backend module follows this structure:

```
module-name/
├── controllers/      # HTTP request handlers
├── services/         # Business logic
├── models/          # Data models (Prisma/Mongoose)
├── routes/          # Express routes
├── validators/      # Input validation schemas
├── utils/           # Helper functions
├── tests/           # Unit and integration tests
└── index.js         # Module entry point
```

### Key Principles:
1. **Controllers**: Thin layer, handles HTTP concerns
2. **Services**: Contains business logic, reusable
3. **Models**: Data layer, database interaction
4. **Routes**: Define API endpoints
5. **Validators**: Input validation using Joi

## Database Models

### Prisma Models (PostgreSQL)
- `User` - User accounts and authentication
- `Incident` - Security incidents
- `Vulnerability` - CVE tracking
- `Asset` - IT asset inventory
- `AuditLog` - Activity audit trail
- `IOC` - Indicators of Compromise
- `ThreatActor` - Threat actor profiles
- `PlaybookExecution` - Automation history

### Mongoose Models (MongoDB)
- `Threat` - Threat intelligence data
- `Playbook` - Automation playbooks
- `ThreatCorrelation` - Threat relationships
- `RiskAssessment` - Risk analysis data

## API Structure

```
/api/v1/
├── auth/                 # Authentication endpoints
├── threat-intelligence/  # Threat intelligence module
├── automation/          # Automation and playbooks
├── risk/                # Risk assessment
├── incidents/           # Incident management
├── vulnerabilities/     # Vulnerability management
├── assets/              # Asset management
└── users/               # User management
```

## Deployment Architecture

### Development
```
Developer Machine
├── Frontend (Vite Dev Server) :3000
├── Backend (Nodemon) :8080
└── Databases (Docker Compose)
    ├── PostgreSQL :5432
    ├── MongoDB :27017
    └── Redis :6379
```

### Production
```
Load Balancer
    ↓
NGINX Reverse Proxy
    ├── Frontend (Static Files) :80/443
    └── Backend (Node.js) :8080
            ↓
        Databases
        ├── PostgreSQL (Managed)
        ├── MongoDB (Managed)
        └── Redis (Managed)
```

## Configuration Management

### Environment Variables
- `.env.example` - Template with all variables
- `.env` - Local configuration (gitignored)
- Environment-specific configs in CI/CD

### Feature Flags
- Enable/disable features without code changes
- Gradual rollout of new features
- A/B testing capabilities

## Testing Strategy

### Frontend
- Unit tests: Jest + React Testing Library
- Integration tests: Testing Library
- E2E tests: Cypress (optional)

### Backend
- Unit tests: Jest
- Integration tests: Supertest + Jest
- API tests: Postman collections

### Database
- Migration tests: Ensure migrations are reversible
- Seed data for consistent testing

## Monitoring and Observability

### Logging
- Structured logging with Winston
- Different log levels (debug, info, warn, error)
- Log aggregation ready (ELK stack compatible)

### Metrics
- Application metrics (optional Prometheus)
- Database metrics (Prisma metrics)
- API response times

### Health Checks
- `/health` endpoint on backend
- Database connectivity check
- Dependency health checks

## Security Considerations

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Multi-factor authentication (MFA) support

### Data Protection
- Passwords hashed with bcrypt
- Sensitive data encrypted at rest
- HTTPS in production
- API rate limiting

### Audit Trail
- All user actions logged
- Database changes tracked
- API access logged

## Best Practices

### Frontend
1. Component-based architecture
2. State management with Redux
3. Lazy loading for code splitting
4. Responsive design
5. Accessibility (WCAG 2.1)

### Backend
1. RESTful API design
2. Error handling middleware
3. Input validation
4. Database connection pooling
5. Graceful shutdown

### Database
1. Migrations for schema changes
2. Indexes on frequently queried fields
3. Connection pooling
4. Regular backups
5. Data retention policies

## Future Enhancements

### Planned Improvements
1. **Microservices**: Split monolithic backend into microservices
2. **GraphQL**: Add GraphQL API alongside REST
3. **Kubernetes**: Container orchestration for production
4. **CI/CD**: Automated testing and deployment pipelines
5. **Observability**: Distributed tracing with OpenTelemetry

### Scalability Roadmap
1. **Horizontal Scaling**: Multiple backend instances
2. **Database Sharding**: Partition data across databases
3. **Caching Layer**: Redis for frequently accessed data
4. **CDN**: Static asset distribution
5. **Message Queue**: Async processing with RabbitMQ

## Conclusion

This architecture follows Google engineering best practices with:
- Clear separation of concerns
- Type safety across the stack
- Scalable and maintainable codebase
- Production-ready infrastructure
- Developer-friendly workflow

The structure supports both rapid development and long-term maintenance, making it suitable for enterprise deployments.
