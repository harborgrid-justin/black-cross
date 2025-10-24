# Getting Started with Black-Cross

Welcome to Black-Cross! This guide will help you get the platform up and running quickly.

## 🚀 Automated Setup (Easiest - Recommended)

Black-Cross now includes an automated setup script that handles everything:

```bash
# 1. Clone the repository
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross

# 2. Run automated setup
npm run setup

# 3. Start PostgreSQL
docker-compose up -d postgres

# 4. Sync database models
npm run db:sync

# 5. Start the app
npm run dev
```

**Done!** Access at http://localhost:3000 (login: admin@black-cross.io / admin)

For detailed instructions and troubleshooting, see [SETUP.md](./SETUP.md).

---

## Quick Start (5 minutes)

### Option 1: Docker Compose (All Services)

```bash
# 1. Clone the repository
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross

# 2. Start all services with Docker
docker-compose up -d

# 3. Wait for services to be ready (~30 seconds)
docker-compose logs -f backend

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Default login: admin@black-cross.io / admin
```

### Option 2: Local Development (Manual)

If you prefer to run each step manually:

```bash
# 1. Clone the repository
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross

# 2. Install dependencies
npm run install:all

# 3. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Start PostgreSQL (or use Docker)
docker-compose up -d postgres

# 5. Set up database
npm run db:sync

# 6. Start development servers
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

**Tip**: Use `npm run setup` to automate steps 2-5!

## Prerequisites

### Required
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 13+** - [Download](https://www.postgresql.org/download/) or use Docker

### Optional
- **Docker & Docker Compose** - [Download](https://www.docker.com/get-started)
- **MongoDB 4.4+** - For legacy modules
- **Redis 6+** - For caching

## Detailed Setup

### 1. Install Dependencies

The project uses npm workspaces for monorepo management.

```bash
# Install all dependencies (root, frontend, backend)
npm run install:all

# Or install individually
npm install           # Root dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

#### Using Docker (Easiest)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# The connection string is already configured
# DATABASE_URL="postgresql://blackcross:blackcross_secure_password@localhost:5432/blackcross?schema=public"
```

#### Using Local PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE blackcross;
CREATE USER blackcross WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE blackcross TO blackcross;
\q

# Update backend/.env with your credentials
DATABASE_URL="postgresql://blackcross:your_password@localhost:5432/blackcross?schema=public"
```

### 3. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blackcross?schema=public"

# Security (CHANGE THESE!)
JWT_SECRET=your_secure_random_string_here
ENCRYPTION_KEY=your_32_character_encryption_key
SESSION_SECRET=another_secure_random_string

# Optional: Threat Intelligence API Keys
VIRUSTOTAL_API_KEY=your_key
SHODAN_API_KEY=your_key
```

#### Frontend Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
# API URL
VITE_API_URL=http://localhost:8080/api/v1
```

### 4. Initialize Database

```bash
# From root directory
npm run db:sync  # Sync Sequelize models with database
```

### 5. Start Development Servers

#### Start Both (Recommended)

```bash
# From root directory
npm run dev
```

This starts:
- Backend on http://localhost:8080
- Frontend on http://localhost:3000

#### Start Individually

```bash
# Backend only
npm run dev:backend
# or
cd backend && npm run dev

# Frontend only
npm run dev:frontend
# or
cd frontend && npm run dev
```

## First Login

1. Open http://localhost:3000 in your browser
2. Login with default credentials:
   - **Email**: admin@black-cross.io
   - **Password**: admin
3. **Important**: Change password immediately after first login

## Project Structure

```
black-cross/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── store/        # Redux state
│   └── package.json
│
├── backend/               # Node.js + Express backend
│   ├── modules/          # Feature modules
│   │   ├── threat-intelligence/
│   │   ├── automation/
│   │   └── risk-assessment/
│   ├── index.js
│   └── package.json
│
├── backend/
│   ├── models/          # Sequelize database models
│   └── config/          # Database configuration
│
└── package.json         # Root workspace config
```

## Available Commands

### Root Commands

```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build both
npm test                 # Run all tests
npm run lint             # Lint all code
npm run db:sync          # Sync Sequelize models with database
npm run install:all      # Install all dependencies
```

### Backend Commands

```bash
cd backend
npm run dev              # Start with nodemon
npm start                # Start in production mode
npm test                 # Run tests
npm run lint             # Run ESLint
npm run db:sync          # Sync Sequelize models
npm run db:seed          # Seed database
```

### Frontend Commands

```bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## Next Steps

### Explore the Platform

1. **Dashboard** - Overview of threats and incidents
2. **Threat Intelligence** - View and manage threats
3. **Incidents** - Track security incidents
4. **Vulnerabilities** - CVE tracking
5. **Risk Assessment** - Risk analysis tools
6. **Automation** - Security playbooks

### Configure Integrations

1. Add threat intelligence API keys in `backend/.env`
2. Configure SIEM integrations
3. Set up notification channels (Slack, Teams)
4. Connect vulnerability scanners

### Import Data

```bash
cd backend
npm run import -- --type threats --file data.json
npm run import -- --type assets --file assets.csv
```

### Create Additional Users

```bash
cd backend
npm run create-admin -- --email user@company.com --password SecurePass123!
```

## Development Workflow

### Making Changes

1. **Frontend Changes**
   - Edit files in `frontend/src/`
   - Changes hot-reload automatically
   - Check browser console for errors

2. **Backend Changes**
   - Edit files in `backend/`
   - Server restarts automatically with nodemon
   - Check terminal for errors

3. **Database Schema Changes**
   - Edit model files in `backend/models/`
   - Run `npm run db:sync`
   - Syncs Sequelize models with database

### Testing

```bash
# Run all tests
npm test

# Backend tests only
cd backend && npm test

# Frontend tests only
cd frontend && npm test

# With coverage
npm test -- --coverage
```

### Linting

```bash
# Lint all code
npm run lint

# Auto-fix issues
cd backend && npm run lint:fix
cd frontend && npm run lint:fix
```

## Troubleshooting

### Port Already in Use

```bash
# Backend (port 8080)
lsof -ti:8080 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Or if using local PostgreSQL
pg_isready

# Verify connection string in backend/.env
DATABASE_URL="postgresql://..."
```

### Prisma Client Not Generated

```bash
# Generate Prisma Client
npm run db:sync

# If still failing, try:
cd backend
rm -rf node_modules
npm install
npm run db:sync
```

### Module Not Found

```bash
# Reinstall dependencies
npm run install:all

# Or clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

### Docker Issues

```bash
# Restart all services
docker-compose restart

# View logs
docker-compose logs -f backend

# Rebuild containers
docker-compose up -d --build
```

## Production Deployment

### Build for Production

```bash
# Build frontend
cd frontend
npm run build
# Creates frontend/dist/ directory

# Backend doesn't need building (Node.js runtime)
```

### Environment Variables

Ensure production environment variables are set:
- Strong JWT secrets
- Production database credentials
- API keys for external services
- CORS settings for production domains

### Docker Production

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build
```

## Getting Help

### Documentation
- [Architecture Overview](./ARCHITECTURE_NEW.md)
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Sequelize Migration Guide](./docs/SEQUELIZE_MIGRATION.md)
- [Migration Guide](./MIGRATION_GUIDE.md)

### Resources
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Installation Guide](./docs/INSTALLATION.md)
- [API Documentation](http://localhost:8080/api/v1/docs)

### Support
- GitHub Issues: Report bugs or request features
- Documentation: Check docs/ directory
- Community: Join discussions

## What's Next?

1. **Configure Security Settings** - Update default passwords
2. **Add Threat Feeds** - Configure API keys for threat intelligence
3. **Import Assets** - Add your organization's IT assets
4. **Create Users** - Add team members with appropriate roles
5. **Set Up Alerts** - Configure notification channels
6. **Explore Features** - Try threat hunting, automation, and more

Welcome to Black-Cross! 🚀
