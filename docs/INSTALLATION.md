# Installation Guide

## 🚀 Quick Installation

For a quick local development setup, see [SETUP.md](../SETUP.md) or run:

```bash
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross
npm run setup
docker-compose up -d postgres
npm run prisma:migrate
npm run dev
```

This guide covers advanced installation scenarios and production deployments.

---

## System Requirements

### Hardware Requirements
- **CPU**: 8+ cores (16+ recommended for production)
- **RAM**: 16GB minimum (32GB+ recommended)
- **Storage**: 100GB minimum (SSD recommended)
- **Network**: 1Gbps network connection

### Software Requirements
- **Operating System**: Ubuntu 20.04 LTS or later, CentOS 8+, or RHEL 8+
- **Container Runtime**: Docker 20.10+ and Docker Compose 2.0+
- **Database**: PostgreSQL 13+, MongoDB 4.4+, Redis 6+
- **Search Engine**: Elasticsearch 7.x
- **Message Queue**: RabbitMQ 3.9+ or Apache Kafka 2.8+
- **Node.js**: 16.x LTS or later
- **Python**: 3.8 or later

## Installation Methods

### Method 1: Automated Setup (Recommended for Development)

The fastest way to get started:

```bash
# Clone repository
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross

# Run automated setup
npm run setup

# Start database
docker-compose up -d postgres

# Run migrations
npm run prisma:migrate

# Start application
npm run dev
```

See [SETUP.md](../SETUP.md) for detailed instructions and troubleshooting.

### Method 2: Docker Compose (All Services)

1. **Clone the repository**
```bash
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross
```

2. **Set up environment variables**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Frontend environment  
cp frontend/.env.example frontend/.env
# Edit .env files with your configuration
nano backend/.env
nano frontend/.env
```

3. **Start the platform**
```bash
docker-compose up -d
```

4. **Initialize the database**
```bash
# Generate Prisma Client and run migrations
docker-compose exec backend npm run prisma:generate
docker-compose exec backend npm run prisma:migrate

# (Optional) Seed database
docker-compose exec backend npm run db:seed
```

5. **Access the platform**
- Web UI: http://localhost:3000
- Backend API: http://localhost:8080
- Prisma Studio: Run `cd backend && npm run prisma:studio`
- Default credentials: admin / admin (change immediately)

### Method 2: Kubernetes (Production)

1. **Prerequisites**
- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.x installed

2. **Add Helm repository**
```bash
helm repo add black-cross https://charts.black-cross.io
helm repo update
```

3. **Install with Helm**
```bash
helm install black-cross black-cross/black-cross \
  --namespace black-cross \
  --create-namespace \
  --set global.domain=your-domain.com \
  --values custom-values.yaml
```

4. **Verify installation**
```bash
kubectl get pods -n black-cross
kubectl get services -n black-cross
```

### Method 3: Manual Installation

See [Manual Installation Guide](./installation/manual-installation.md)

## Post-Installation Configuration

### 1. Initial Admin Setup
```bash
# Create admin user
npm run create-admin -- --email admin@company.com --password SecurePassword123!
```

### 2. Configure Threat Intelligence Feeds
- Navigate to Settings → Threat Feeds
- Add your API keys for commercial feeds
- Enable desired open-source feeds

### 3. Set Up Integrations
- Configure SIEM integration
- Set up EDR/XDR connections
- Configure email gateway
- Set up notification channels (Slack, Teams, etc.)

### 4. Configure Authentication
- Set up SSO/SAML if required
- Enable MFA for all users
- Configure password policies

### 5. Import Initial Data
```bash
# Import threat intelligence
npm run import -- --type threat-intel --file initial-intel.json

# Import asset inventory
npm run import -- --type assets --file assets.csv
```

## Configuration Files

### .env Configuration
```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=blackcross
POSTGRES_USER=blackcross
POSTGRES_PASSWORD=your_password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/blackcross

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Application
APP_PORT=8080
APP_HOST=0.0.0.0
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
SESSION_SECRET=your_session_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password

# Threat Intelligence Feeds
VIRUSTOTAL_API_KEY=your_key
ALIENVAULT_API_KEY=your_key
SHODAN_API_KEY=your_key
```

## Verification

### Health Checks
```bash
# Check API health
curl http://localhost:8080/health

# Check database connectivity
curl http://localhost:8080/health/db

# Check all services
curl http://localhost:8080/health/all
```

### Run Tests
```bash
npm test
npm run test:integration
```

## Troubleshooting

### Common Issues

**Issue: Cannot connect to database**
- Verify database is running: `docker ps | grep postgres`
- Check connection string in .env
- Verify network connectivity

**Issue: High memory usage**
- Increase Docker memory limit
- Adjust Elasticsearch heap size
- Review log retention policies

**Issue: Slow performance**
- Check Elasticsearch indices
- Review database query performance
- Verify adequate resources

### Logs
```bash
# Application logs
docker-compose logs -f api

# Database logs
docker-compose logs -f postgres

# All logs
docker-compose logs -f
```

## Upgrading

### Docker Compose
```bash
# Backup data
./scripts/backup.sh

# Pull latest images
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate
```

### Kubernetes
```bash
# Backup
./scripts/backup-k8s.sh

# Upgrade
helm upgrade black-cross black-cross/black-cross \
  --namespace black-cross \
  --values custom-values.yaml
```

## Security Hardening

1. Change all default passwords
2. Enable SSL/TLS
3. Configure firewall rules
4. Enable audit logging
5. Set up regular backups
6. Configure rate limiting
7. Enable security headers
8. Review and harden database access

## Next Steps

- Complete the [Quick Start Guide](./quick-start.md)
- Read the [User Guide](./user-guide/)
- Configure [Integrations](./integrations/)
- Set up [Backup and Recovery](./backup-recovery.md)
- Review [Security Best Practices](./security-best-practices.md)

## Support

For installation support:
- Documentation: https://docs.black-cross.io
- Community Forum: https://community.black-cross.io
- Email: support@black-cross.io
