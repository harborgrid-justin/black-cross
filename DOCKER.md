# Docker Setup Guide - Black-Cross Platform

Complete guide for running the Black-Cross cyber threat intelligence platform using Docker.

## Quick Start

### One-Command Setup (Recommended)

```bash
# Automated setup - creates network and starts all services
./setup-docker.sh

# Access the platform
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

### Manual Setup

```bash
# 1. Create environment files
npm run setup

# 2. Start all services
docker-compose up -d

# 3. View logs
docker-compose logs -f
```

### Minimal Setup (PostgreSQL Only)

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Run application locally
npm run dev
```

---

## Architecture Overview

Black-Cross uses a microservices architecture with 8 services:

```
┌─────────────────────────────────────────────┐
│          Load Balancer (NGINX)              │
│            Port 80/443                      │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐         ┌───▼────┐
    │Frontend │         │Backend │
    │Port 3000│◄────────│Port 8080│
    └─────────┘         └───┬────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐      ┌─────▼─────┐     ┌─────▼────┐
    │Postgres │      │  MongoDB  │     │  Redis   │
    │Port 5432│      │Port 27017 │     │Port 6379 │
    └─────────┘      └───────────┘     └──────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────────┐   ┌────▼─────┐
    │Elasticsearch│   │ RabbitMQ │
    │ 9200/9300   │   │5672/15672│
    └─────────────┘   └──────────┘
```

---

## Services Reference

### Required Services

| Service    | Port | Purpose                      |
|-----------|------|------------------------------|
| Frontend  | 3000 | React UI (Vite + nginx)      |
| Backend   | 8080 | Node.js API                  |
| PostgreSQL| 5432 | Primary database (Sequelize) |

### Optional Services

| Service        | Port(s)    | Purpose                |
|---------------|------------|------------------------|
| MongoDB       | 27017      | Unstructured data      |
| Redis         | 6379       | Cache/sessions         |
| Elasticsearch | 9200, 9300 | Search/SIEM            |
| RabbitMQ      | 5672, 15672| Message queue          |
| NGINX         | 80, 443    | Reverse proxy          |

---

## Common Operations

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d postgres
```

### Stopping Services

```bash
# Stop all services (keeps data)
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove everything including data (⚠️ DATA LOSS!)
docker-compose down -v
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Backend health endpoint
curl http://localhost:8080/health

# Check container health
docker inspect blackcross-backend --format='{{.State.Health.Status}}'
```

### Database Operations

```bash
# Access PostgreSQL shell
docker exec -it blackcross-postgres psql -U blackcross blackcross

# Run database migrations
npm run db:sync

# Create database backup
docker exec blackcross-postgres pg_dump -U blackcross blackcross > backup.sql

# Restore database
docker exec -i blackcross-postgres psql -U blackcross blackcross < backup.sql
```

---

## Port Reference

| Service        | Internal Port | Host Port | Purpose                |
|----------------|--------------|-----------|------------------------|
| Frontend       | 3000         | 3000      | React UI               |
| Backend        | 8080         | 8080      | REST API               |
| PostgreSQL     | 5432         | 5432      | Primary database       |
| MongoDB        | 27017        | 27017     | Document store         |
| Redis          | 6379         | 6379      | Cache/sessions         |
| Elasticsearch  | 9200, 9300   | 9200, 9300| Search API             |
| RabbitMQ       | 5672, 15672  | 5672, 15672| Message queue         |
| NGINX          | 80, 443      | 80, 443   | Load balancer          |

---

## Volume Management

### Persistent Volumes

All data is stored in Docker named volumes:

| Volume Name          | Service        | Purpose           |
|---------------------|----------------|-------------------|
| postgres-data       | PostgreSQL     | Database files    |
| mongodb-data        | MongoDB        | Document store    |
| redis-data          | Redis          | Cache data        |
| elasticsearch-data  | Elasticsearch  | Search indices    |
| rabbitmq-data       | RabbitMQ       | Queue data        |

### Volume Operations

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect postgres-data

# Backup volume
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volume
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## Environment Variables

### Backend (.env)

Required:
```env
NODE_ENV=development
DATABASE_URL=postgresql://blackcross:password@postgres:5432/blackcross
JWT_SECRET=your_secret_here
ENCRYPTION_KEY=exactly_32_characters_needed!!
SESSION_SECRET=your_session_secret_here
```

Optional:
```env
MONGODB_URI=mongodb://mongodb:27017/blackcross
REDIS_URL=redis://redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200
RABBITMQ_URL=amqp://rabbitmq:5672
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8080/api/v1
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check connection string uses 'postgres' hostname (not 'localhost')
# DATABASE_URL=postgresql://user:pass@postgres:5432/db
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Out of Memory (Elasticsearch)

```bash
# Reduce heap size in docker-compose.yml
environment:
  - "ES_JAVA_OPTS=-Xms1g -Xmx1g"  # Reduced to 1GB
```

---

## Production Deployment

### Pre-Production Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Generate strong ENCRYPTION_KEY (exactly 32 characters)
- [ ] Configure SSL/TLS certificates
- [ ] Enable Elasticsearch security
- [ ] Setup monitoring and alerting
- [ ] Configure automated backups
- [ ] Review firewall rules

### Security Hardening

```bash
# Generate secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For ENCRYPTION_KEY (pad to 32 chars)
```

### Resource Limits

Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## Cleanup

### Complete Cleanup

```bash
# Use cleanup script (interactive)
./cleanup-docker.sh

# Manual cleanup
docker-compose down -v  # ⚠️ Removes all data!
docker network rm blackcross-network
```

---

## Additional Resources

- **Main README**: `/README.md`
- **Development Guide**: `/CLAUDE.md`
- **Getting Started**: `/GETTING_STARTED.md`

---

## Support

- **GitHub Issues**: https://github.com/harborgrid-justin/black-cross/issues
- **Documentation**: `/docs`

---

**Version**: 1.0.0
**Maintained by**: Black-Cross Team
