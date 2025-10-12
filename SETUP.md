# Black-Cross Setup Guide

Complete installation guide for Black-Cross Enterprise Cyber Threat Intelligence Platform.

## 🚀 Quick Setup (Recommended)

The fastest way to get Black-Cross up and running:

```bash
# 1. Clone the repository
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross

# 2. Run automated setup
npm run setup

# 3. Configure database connection
# Edit backend/.env and set DATABASE_URL to your PostgreSQL instance

# 4. Start the application (database will auto-sync)
npm run dev
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Default credentials**: admin@black-cross.io / admin

⚠️ **Important**: Change the default password immediately after first login!

## 📋 Prerequisites

### Required

- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 13+** - Either:
  - Docker (recommended) - [Download](https://www.docker.com/get-started)
  - Or local PostgreSQL installation

### Optional

- **MongoDB 4.4+** - For legacy modules (optional)
- **Redis 6+** - For caching (optional)
- **Elasticsearch 8+** - For advanced search (optional)

## 🔧 Detailed Setup Steps

### Step 1: Install Node.js

Ensure you have Node.js 16 or higher installed:

```bash
node --version
# Should output v16.x.x or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/).

### Step 2: Clone the Repository

```bash
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross
```

### Step 3: Run Automated Setup

The setup script will:
- ✅ Check prerequisites
- ✅ Install all dependencies (root, backend, frontend)
- ✅ Create environment files from examples
- ✅ Verify installation

```bash
npm run setup
```

Expected output:
```
🚀 Black-Cross Setup Wizard
Enterprise Cyber Threat Intelligence Platform

═══════════════════════════════════════════════
  Checking Prerequisites
═══════════════════════════════════════════════

✅ Node.js v18.x.x (requires 16+)
✅ npm 9.x.x
✅ git installed

... [installation progress] ...

Setup Complete! 🎉
```

### Step 4: Configure Environment Variables

#### Backend Configuration

Edit `backend/.env`:

```bash
nano backend/.env
# or
code backend/.env
```

**Required settings:**

```env
# Database - PostgreSQL (Sequelize)
# For Neon serverless PostgreSQL:
DATABASE_URL="postgresql://username:password@host.neon.tech/database?sslmode=require"

# Or for local PostgreSQL:
# DATABASE_URL="postgresql://blackcross:your_password@localhost:5432/blackcross"

# Security - CHANGE THESE IN PRODUCTION!
JWT_SECRET=your_secure_random_string_minimum_32_characters
ENCRYPTION_KEY=12345678901234567890123456789012
SESSION_SECRET=another_secure_random_string_here
```

**Optional API keys** (for threat intelligence feeds):

```env
VIRUSTOTAL_API_KEY=your_virustotal_api_key
SHODAN_API_KEY=your_shodan_api_key
ALIENVAULT_API_KEY=your_alienvault_api_key
ABUSEIPDB_API_KEY=your_abuseipdb_api_key
```

#### Frontend Configuration

The default configuration should work for local development:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Step 5: Start PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Verify it's running
docker-compose ps postgres
```

The docker-compose.yml is pre-configured with:
- Database: `blackcross`
- User: `blackcross`
- Password: `blackcross_secure_password`
- Port: `5432`

#### Option B: Using Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create database and user
psql -U postgres
```

```sql
CREATE DATABASE blackcross;
CREATE USER blackcross WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE blackcross TO blackcross;
\q
```

Update `backend/.env` with your credentials:
```env
DATABASE_URL="postgresql://blackcross:your_secure_password@localhost:5432/blackcross"
```

#### Option C: Using Neon Serverless PostgreSQL

Black-Cross now uses Neon serverless PostgreSQL by default:

```env
DATABASE_URL="postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require"
```

No local installation required - just set the DATABASE_URL!

### Step 6: Sync Database Models

This creates all necessary database tables:

Database models will be automatically synced when you start the application. To manually sync:

```bash
npm run db:sync
```

Expected output:
```
🔌 Connecting to PostgreSQL via Sequelize...
✅ PostgreSQL connection established successfully
✅ Database models synced successfully
```

**Note**: Sequelize automatically creates tables on first connection in development mode.

### Step 7: Start the Application

Start both frontend and backend:

```bash
npm run dev
```

This will start:
- **Backend** on http://localhost:8080
- **Frontend** on http://localhost:3000

The terminal will show output from both servers.

### Step 8: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000

Login with default credentials:
- **Email**: admin@black-cross.io
- **Password**: admin

⚠️ **IMPORTANT**: Change this password immediately after first login!

## 🔍 Verifying Your Installation

### Check Services

```bash
# Check backend is running
curl http://localhost:8080/health

# Expected response:
# {"status":"ok"}
```

### View Database

Open Prisma Studio to view and edit your database:

```bash
npm run prisma:studio
```

This opens a web interface at http://localhost:5555

### Run Tests

```bash
# Run all tests
npm test

# Run backend tests only
cd backend && npm test

# Run frontend tests only
cd frontend && npm test
```

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Error**: `Port 8080 is already in use`

**Solution**:
```bash
# Find and kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or for port 3000
lsof -ti:3000 | xargs kill -9
```

### Issue: Database Connection Failed

**Error**: `Can't reach database server at localhost:5432`

**Solutions**:

1. Check PostgreSQL is running:
```bash
# If using Docker
docker-compose ps postgres

# If using local PostgreSQL
pg_isready
```

2. Verify DATABASE_URL in `backend/.env`:
```bash
cat backend/.env | grep DATABASE_URL
```

3. Test connection:
```bash
psql -h localhost -U blackcross -d blackcross
```

### Issue: Prisma Client Not Found

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
# Regenerate Prisma Client
npm run prisma:generate

# If still failing, reinstall dependencies
cd backend
rm -rf node_modules
npm install
npm run prisma:generate
```

### Issue: Module Not Found Errors

**Error**: Various "Cannot find module" errors

**Solution**:
```bash
# Clean reinstall all dependencies
npm run clean
npm run setup
```

### Issue: Environment File Not Found

**Error**: `.env file not found`

**Solution**:
```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your configuration
nano backend/.env
```

### Issue: Migration Failed

**Error**: `Migration failed to apply`

**Solution**:
```bash
# Reset database (WARNING: This deletes all data)
cd backend
npx prisma migrate reset

# Then reapply migrations
npm run prisma:migrate
```

### Issue: Docker Container Won't Start

**Error**: `docker-compose up -d postgres` fails

**Solution**:
```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs postgres

# Restart Docker and try again
docker-compose down
docker-compose up -d postgres
```

## 📚 Additional Setup Options

### Setup with All Services (Docker)

To run all services including MongoDB, Redis, and Elasticsearch:

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Setup for Production

1. **Build frontend**:
```bash
cd frontend
npm run build
```

2. **Configure production environment**:
```bash
# Set NODE_ENV to production
export NODE_ENV=production

# Use strong secrets
# Use production database credentials
# Enable HTTPS
# Configure proper CORS settings
```

3. **Use PM2 for process management**:
```bash
npm install -g pm2
cd backend
pm2 start index.js --name black-cross-backend
pm2 monit
```

### Setup Optional Services

#### MongoDB (for legacy modules)

```bash
# Start MongoDB with Docker
docker-compose up -d mongodb

# Or install locally
# Update MONGODB_URI in backend/.env
```

#### Redis (for caching)

```bash
# Start Redis with Docker
docker-compose up -d redis

# Or install locally
# Update REDIS_URL in backend/.env
```

#### Elasticsearch (for advanced search)

```bash
# Start Elasticsearch with Docker
docker-compose up -d elasticsearch

# Update ELASTICSEARCH_URL in backend/.env
```

## 🔒 Security Considerations

### Change Default Credentials

1. **Application**: Change admin password immediately
2. **Database**: Use strong PostgreSQL password
3. **Secrets**: Generate secure random strings for JWT_SECRET, etc.

### Generate Secure Secrets

```bash
# Generate random secrets (Linux/Mac)
openssl rand -base64 32

# Use these for:
# - JWT_SECRET
# - ENCRYPTION_KEY
# - SESSION_SECRET
```

### Environment Security

- Never commit `.env` files to Git
- Use different secrets for development and production
- Rotate secrets regularly
- Use environment variables in production (don't use .env files)

## 📖 Next Steps

After successful setup:

1. **Explore the Platform**
   - Dashboard
   - Threat Intelligence
   - Incident Management
   - Risk Assessment

2. **Configure Integrations**
   - Add threat intelligence API keys
   - Connect SIEM tools
   - Set up notifications (Slack, Teams)

3. **Import Initial Data**
   ```bash
   cd backend
   npm run import -- --type threats --file data.json
   npm run import -- --type assets --file assets.csv
   ```

4. **Create Additional Users**
   ```bash
   cd backend
   npm run create-admin -- --email user@company.com --password SecurePass123!
   ```

5. **Read Documentation**
   - [Architecture Overview](./ARCHITECTURE_NEW.md)
   - [Getting Started Guide](./GETTING_STARTED.md)
   - [Feature Documentation](./docs/)
   - [API Documentation](http://localhost:8080/api/docs)

## 🆘 Getting Help

### Documentation

- [README.md](./README.md) - Project overview
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Quick start guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guide
- [docs/INSTALLATION.md](./docs/INSTALLATION.md) - Detailed installation
- [backend/README.md](./backend/README.md) - Backend documentation
- [frontend/README.md](./frontend/README.md) - Frontend documentation
- [prisma/README.md](./prisma/README.md) - Database documentation

### Support Channels

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check the docs/ directory
- **Community**: Join discussions
- **Email**: support@black-cross.io

## ✅ Setup Checklist

Use this checklist to track your setup progress:

- [ ] Node.js 16+ installed
- [ ] Repository cloned
- [ ] `npm run setup` completed successfully
- [ ] PostgreSQL running (Docker or local)
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured (usually defaults work)
- [ ] Database migrations run (`npm run prisma:migrate`)
- [ ] Application started (`npm run dev`)
- [ ] Accessed frontend at http://localhost:3000
- [ ] Logged in successfully
- [ ] Changed default admin password
- [ ] Optional: Added threat intelligence API keys
- [ ] Optional: Started additional services (MongoDB, Redis, etc.)

## 🎉 Success!

If you've completed all steps, you now have a fully functional Black-Cross installation!

Welcome to Black-Cross - Enterprise Cyber Threat Intelligence Platform! 🚀
