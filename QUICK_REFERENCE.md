# Black-Cross Quick Reference

Fast reference for common commands and workflows.

## 🚀 Quick Start

```bash
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross
npm run setup
docker-compose up -d postgres
npm run prisma:migrate
npm run dev
```

Access: http://localhost:3000 (admin@black-cross.io / admin)

## 📦 Setup Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | **Automated setup** - installs dependencies, creates env files, generates Prisma |
| `npm run verify` | Verify setup is complete and correct |
| `npm run install:all` | Install dependencies for all workspaces |
| `npm run clean` | Remove all node_modules directories |

## 🏃 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:backend` | Start backend only (port 8080) |
| `npm run dev:frontend` | Start frontend only (port 3000) |

## 🗄️ Database Commands

| Command | Description |
|---------|-------------|
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI (port 5555) |

## 🐳 Docker Commands

| Command | Description |
|---------|-------------|
| `docker-compose up -d postgres` | Start PostgreSQL only |
| `docker-compose up -d` | Start all services |
| `docker-compose ps` | Check service status |
| `docker-compose logs -f backend` | View backend logs |
| `docker-compose down` | Stop all services |

## 🧪 Testing Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:backend` | Run backend tests |
| `npm run test:frontend` | Run frontend tests |

## 🎨 Code Quality Commands

| Command | Description |
|---------|-------------|
| `npm run lint` | Lint all code |
| `npm run lint:backend` | Lint backend code |
| `npm run lint:frontend` | Lint frontend code |

## 🏗️ Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build both frontend and backend |
| `npm run build:frontend` | Build frontend for production |
| `npm run build:backend` | Build backend (runs lint + tests) |

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration (DB, secrets, API keys) |
| `frontend/.env` | Frontend configuration (API URL) |
| `prisma/schema.prisma` | Database schema definition |
| `docker-compose.yml` | Docker services configuration |

## 📝 Environment Variables

### Backend (backend/.env)

```env
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/blackcross?schema=public"
JWT_SECRET=your_secure_random_string_32_chars
ENCRYPTION_KEY=your_32_character_encryption_key
SESSION_SECRET=another_secure_random_string

# Optional - Threat Intelligence
VIRUSTOTAL_API_KEY=your_key
SHODAN_API_KEY=your_key
ALIENVAULT_API_KEY=your_key
```

### Frontend (frontend/.env)

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## 🌐 Access Points

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Frontend | http://localhost:3000 | admin@black-cross.io / admin |
| Backend API | http://localhost:8080 | - |
| Prisma Studio | http://localhost:5555 | - |
| PostgreSQL | localhost:5432 | blackcross / blackcross_secure_password |

## 🛠️ Common Tasks

### First Time Setup

```bash
npm run setup
docker-compose up -d postgres
npm run prisma:migrate
npm run dev
```

### Reset Database

```bash
cd backend
npx prisma migrate reset
npm run prisma:migrate
```

### Generate Secure Secrets

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Create Admin User

```bash
cd backend
npm run create-admin -- --email user@company.com --password SecurePass123!
```

### Import Data

```bash
cd backend
npm run import -- --type threats --file data.json
npm run import -- --type assets --file assets.csv
```

### View Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Application logs
tail -f backend/logs/app.log
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
psql -h localhost -U blackcross -d blackcross
```

### Prisma Client Not Found

```bash
npm run prisma:generate
```

### Module Not Found

```bash
npm run clean
npm run setup
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview |
| [SETUP.md](./SETUP.md) | **Complete setup guide** |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Quick start guide |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development guide |
| [backend/README.md](./backend/README.md) | Backend documentation |
| [prisma/README.md](./prisma/README.md) | Database documentation |

## 🆘 Getting Help

- **Documentation**: Check the docs/ directory
- **Issues**: https://github.com/harborgrid-justin/black-cross/issues
- **Email**: support@black-cross.io

---

**Tip**: Bookmark this page for quick reference during development!
