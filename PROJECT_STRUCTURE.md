# Black-Cross Project Structure

## Directory Tree

```
black-cross/
│
├── 📁 frontend/                    # React + TypeScript Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── auth/            # Authentication components
│   │   │   └── layout/          # Layout components
│   │   ├── pages/               # Page components
│   │   │   ├── actors/          # Threat Actors page
│   │   │   ├── automation/      # Automation & Playbooks
│   │   │   ├── compliance/      # Compliance Management
│   │   │   ├── darkweb/        # Dark Web Monitoring
│   │   │   ├── feeds/          # Threat Feeds
│   │   │   ├── hunting/        # Threat Hunting
│   │   │   ├── incidents/      # Incident Management
│   │   │   ├── iocs/           # IoC Management
│   │   │   ├── malware/        # Malware Analysis
│   │   │   ├── risk/           # Risk Assessment
│   │   │   ├── threats/        # Threat Intelligence
│   │   │   └── vulnerabilities/ # Vulnerability Management
│   │   ├── services/            # API client services
│   │   ├── store/               # Redux state management
│   │   ├── types/               # TypeScript type definitions
│   │   └── styles/              # Global styles
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── tsconfig.json            # TypeScript configuration
│   ├── vite.config.ts           # Vite build configuration
│   ├── Dockerfile               # Frontend container definition
│   ├── nginx.conf               # Production nginx config
│   ├── .env.example             # Environment variables template
│   └── README.md                # Frontend documentation
│
├── 📁 backend/                     # Node.js + Express Backend API
│   ├── modules/                 # Feature modules
│   │   ├── threat-intelligence/ # Threat Intelligence module
│   │   │   ├── controllers/    # HTTP request handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── models/         # Mongoose data models
│   │   │   ├── routes/         # Express routes
│   │   │   ├── validators/     # Input validation
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── config/         # Module configuration
│   │   │   └── README.md
│   │   ├── automation/          # Automation & Playbooks module
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── validators/
│   │   │   ├── utils/
│   │   │   └── README.md
│   │   └── risk-assessment/     # Risk Assessment module
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── models/
│   │       ├── routes/
│   │       ├── validators/
│   │       ├── utils/
│   │       └── README.md
│   ├── config/                  # Global configuration
│   ├── middleware/              # Express middleware
│   ├── utils/                   # Global utilities
│   ├── index.js                 # Application entry point
│   ├── package.json
│   ├── .eslintrc.json          # ESLint configuration
│   ├── Dockerfile              # Backend container definition
│   ├── .env.example            # Environment variables template
│   └── README.md               # Backend documentation
│
├── 📁 prisma/                      # Prisma ORM - Database Layer
│   ├── migrations/              # Database migrations
│   │   └── [timestamp]_[name]/  # Migration files
│   ├── schema.prisma            # Database schema definition
│   └── README.md                # Prisma documentation
│
├── 📁 docs/                        # Documentation
│   ├── api/                     # API documentation
│   ├── architecture/            # Architecture docs
│   ├── features/                # Feature documentation
│   ├── INSTALLATION.md          # Installation guide
│   └── QUICK_START.md          # Quick start guide
│
├── 📁 .github/                     # GitHub configuration
│   ├── workflows/               # GitHub Actions
│   └── ISSUE_TEMPLATE/          # Issue templates
│
├── 📄 Root Configuration Files
│   ├── package.json             # Root workspace configuration
│   ├── package-lock.json        # Dependency lock file
│   ├── docker-compose.yml       # Multi-container orchestration
│   ├── .gitignore              # Git ignore patterns
│   ├── .env.example            # Root environment template
│   └── .eslintrc.json          # ESLint configuration
│
└── 📄 Documentation Files
    ├── README.md                # Project overview
    ├── ARCHITECTURE_NEW.md      # Architecture guide
    ├── GETTING_STARTED.md       # Getting started guide
    ├── MIGRATION_GUIDE.md       # Migration guide for developers
    ├── TYPESCRIPT_MIGRATION.md  # TypeScript migration guide
    ├── CONTRIBUTING.md          # Contribution guidelines
    ├── PROJECT_STRUCTURE.md     # This file
    ├── verify-structure.sh      # Structure verification script
    └── LICENSE                  # MIT License
```

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    http://localhost:3000                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Components  │  │    Pages     │  │  Services    │     │
│  │  (UI Layer)  │  │  (Routing)   │  │  (API Calls) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                   │             │
│         └──────────────────┴───────────────────┘             │
│                           │                                   │
│                    Redux Store                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/WebSocket
                           │ http://localhost:8080/api/v1
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js + Express)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │→ │ Controllers  │→ │  Services    │     │
│  │  (Endpoints) │  │  (Handlers)  │  │  (Logic)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                              │                │
│                                              ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Validators  │  │  Middleware  │  │   Models     │     │
│  │  (Joi/Zod)   │  │  (Auth,etc)  │  │  (Data)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Prisma ORM (Database Layer)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Prisma Client (Type-safe)               │  │
│  │  - Auto-generated from schema.prisma                 │  │
│  │  - Type-safe queries                                 │  │
│  │  - Migration management                              │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Databases                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │   MongoDB    │  │    Redis     │     │
│  │ (Structured) │  │  (Flexible)  │  │   (Cache)    │     │
│  │   :5432      │  │    :27017    │  │    :6379     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Data Models Overview

### Prisma Models (PostgreSQL)
- **User**: User accounts and authentication
- **Incident**: Security incident tracking
- **Vulnerability**: CVE and vulnerability management
- **Asset**: IT asset inventory
- **AuditLog**: Activity audit trail
- **IOC**: Indicators of Compromise
- **ThreatActor**: Threat actor profiles
- **PlaybookExecution**: Automation execution history

### Mongoose Models (MongoDB)
- **Threat**: Threat intelligence data (flexible schema)
- **Playbook**: Automation playbook definitions
- **ThreatCorrelation**: Threat relationship data
- **RiskAssessment**: Risk analysis data

## Technology Stack

### Frontend Stack
```
React 18 + TypeScript
├── UI Framework: Material-UI (MUI)
├── State Management: Redux Toolkit
├── Routing: React Router v6
├── HTTP Client: Axios
├── Build Tool: Vite
├── Charts: Recharts
└── Forms: React Hook Form + Zod
```

### Backend Stack
```
Node.js 16+ + TypeScript + Express
├── Language: TypeScript (migration in progress)
├── ORM: Prisma (PostgreSQL)
├── ODM: Mongoose (MongoDB)
├── Auth: JWT + bcrypt
├── Validation: Joi
├── Logging: Winston
├── WebSocket: Socket.IO
├── Job Queue: Bull
└── Scheduling: node-cron
```

### Infrastructure
```
Docker + Docker Compose
├── Backend Container (Node.js)
├── Frontend Container (nginx)
├── PostgreSQL Container
├── MongoDB Container
├── Redis Container
├── Elasticsearch Container (optional)
└── RabbitMQ Container (optional)
```

## API Structure

```
/api/v1/
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh
│   └── POST /register
│
├── /threat-intelligence
│   ├── GET    /threats
│   ├── GET    /threats/:id
│   ├── POST   /threats
│   ├── PUT    /threats/:id
│   ├── DELETE /threats/:id
│   └── POST   /threats/:id/enrich
│
├── /incidents
│   ├── GET    /incidents
│   ├── GET    /incidents/:id
│   ├── POST   /incidents
│   ├── PUT    /incidents/:id
│   └── PATCH  /incidents/:id/status
│
├── /vulnerabilities
│   ├── GET    /vulnerabilities
│   ├── GET    /vulnerabilities/:id
│   ├── POST   /vulnerabilities
│   └── PATCH  /vulnerabilities/:id/patch
│
├── /automation
│   ├── GET    /playbooks
│   ├── GET    /playbooks/:id
│   ├── POST   /playbooks
│   ├── POST   /playbooks/:id/execute
│   └── GET    /executions
│
└── /risk
    ├── GET    /assessments
    ├── POST   /assessments
    ├── GET    /score/:assetId
    └── GET    /reports/executive
```

## Development Workflow

### 1. Local Development
```bash
npm run dev              # Start both frontend + backend
npm run dev:backend      # Backend on :8080
npm run dev:frontend     # Frontend on :3000
```

### 2. Database Management
```bash
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open GUI
```

### 3. Testing
```bash
npm test                 # All tests
npm run test:backend     # Backend tests
npm run test:frontend    # Frontend tests
```

### 4. Linting
```bash
npm run lint             # Lint all
npm run lint:backend     # Lint backend
npm run lint:frontend    # Lint frontend
```

### 5. Building
```bash
npm run build            # Build both
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend
```

## Deployment Options

### Docker Compose (Development/Testing)
```bash
docker-compose up -d
```

### Individual Containers (Production)
```bash
# Build
docker build -t black-cross-backend ./backend
docker build -t black-cross-frontend ./frontend

# Run
docker run -d -p 8080:8080 black-cross-backend
docker run -d -p 3000:3000 black-cross-frontend
```

### Kubernetes (Enterprise)
- Deploy frontend as deployment + service
- Deploy backend as deployment + service
- Use managed PostgreSQL (e.g., RDS, Cloud SQL)
- Use managed Redis for caching
- Horizontal pod autoscaling

## Best Practices

### Code Organization
✅ Separation of concerns (frontend/backend/database)
✅ Module-based architecture
✅ Type safety with TypeScript and Prisma
✅ Environment-based configuration
✅ Centralized error handling

### Security
✅ JWT authentication
✅ Input validation
✅ SQL injection prevention (Prisma)
✅ XSS protection
✅ CORS configuration
✅ Rate limiting
✅ Security headers

### Performance
✅ Connection pooling
✅ Redis caching
✅ Lazy loading (frontend)
✅ Code splitting (Vite)
✅ Database indexing
✅ Query optimization

### Maintainability
✅ Clear directory structure
✅ Comprehensive documentation
✅ Automated testing
✅ Linting and formatting
✅ Version control
✅ Migration management

## Getting Started

See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup instructions.

## Migration from Old Structure

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for migration instructions.

## Architecture Details

See [ARCHITECTURE_NEW.md](./ARCHITECTURE_NEW.md) for comprehensive architecture documentation.
