# Quick Start Guide

Get Black-Cross up and running in minutes!

## Prerequisites

- Docker and Docker Compose installed
- 16GB RAM minimum
- 20GB free disk space

## 5-Minute Setup

### 1. Clone the Repository

```bash
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (optional for quick start)
```

### 3. Start the Platform

```bash
docker-compose up -d
```

This will start:
- API Server (port 8080)
- Web UI (port 3000)
- PostgreSQL Database
- MongoDB
- Redis Cache
- Elasticsearch
- RabbitMQ
- NGINX Reverse Proxy

### 4. Wait for Services to Initialize

```bash
# Check service status
docker-compose ps

# Watch logs
docker-compose logs -f api
```

### 5. Access the Platform

- **Web UI**: http://localhost:3000
- **API**: http://localhost:8080/api/v1
- **API Health**: http://localhost:8080/health

### 6. Login

Default credentials (change immediately):
- **Email**: admin@black-cross.io
- **Password**: admin

## First Steps

### 1. Change Admin Password

```bash
curl -X POST http://localhost:8080/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "admin",
    "new_password": "YourSecurePassword123!"
  }'
```

### 2. Create Your First Threat Intelligence Entry

```bash
curl -X POST http://localhost:8080/api/v1/threat-intelligence/threats/collect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Threat",
    "type": "malware",
    "severity": "high",
    "description": "Sample threat for testing",
    "indicators": [
      {
        "type": "ip",
        "value": "192.168.1.100"
      }
    ]
  }'
```

### 3. Configure Threat Intelligence Feeds

Navigate to: Settings → Threat Feeds

Add your API keys for:
- VirusTotal
- AlienVault OTX
- Shodan
- Other feeds

### 4. Create Your First Incident

```bash
curl -X POST http://localhost:8080/api/v1/incidents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Suspicious Login Activity",
    "description": "Multiple failed login attempts detected",
    "priority": "high",
    "severity": "medium"
  }'
```

### 5. Set Up Integrations

1. **SIEM Integration**: Connect your SIEM (Splunk, QRadar, etc.)
2. **EDR Integration**: Connect EDR tools (CrowdStrike, Carbon Black, etc.)
3. **Email Gateway**: Configure email notifications
4. **Slack/Teams**: Set up chat notifications

### 6. Import Sample Data

```bash
# Import sample threats
docker-compose exec api npm run import -- \
  --type threat-intel \
  --file /app/data/sample-threats.json

# Import sample vulnerabilities
docker-compose exec api npm run import -- \
  --type vulnerabilities \
  --file /app/data/sample-vulns.csv
```

## Explore Features

### Threat Intelligence Management
1. Navigate to **Threats** in the main menu
2. View real-time threat stream
3. Filter and search threats
4. Enrich threat data

### Incident Response
1. Go to **Incidents**
2. View open incidents
3. Create new incident
4. Assign to team members

### Threat Hunting
1. Open **Threat Hunting**
2. Try the query builder
3. Execute sample hunting queries
4. Create hunting hypotheses

### Vulnerability Management
1. Navigate to **Vulnerabilities**
2. View vulnerability dashboard
3. Run a vulnerability scan
4. Prioritize by risk

### Reporting
1. Go to **Reports**
2. View executive dashboard
3. Generate a sample report
4. Schedule automated reports

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Stop Platform
```bash
docker-compose down
```

### Stop and Remove Data
```bash
docker-compose down -v
```

### Update Platform
```bash
git pull
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Services Not Starting

**Check Docker resources:**
```bash
docker stats
```

**Increase Docker memory:**
- Docker Desktop: Settings → Resources → Memory (16GB recommended)

### Cannot Connect to Database

**Check database status:**
```bash
docker-compose logs postgres
```

**Restart database:**
```bash
docker-compose restart postgres
```

### API Errors

**Check API logs:**
```bash
docker-compose logs api
```

**Verify environment variables:**
```bash
docker-compose exec api env | grep -E 'POSTGRES|MONGO|REDIS'
```

### Port Conflicts

**Check if ports are in use:**
```bash
netstat -an | grep -E '3000|8080|5432|27017|6379|9200'
```

**Change ports in docker-compose.yml:**
```yaml
ports:
  - "8081:8080"  # Change 8080 to 8081
```

## Next Steps

1. **Read Full Documentation**
   - [Architecture](./ARCHITECTURE.md)
   - [Feature Documentation](./features/)
   - [API Reference](./api/)

2. **Configure Security**
   - Enable SSL/TLS
   - Set up MFA
   - Configure RBAC
   - Review audit logs

3. **Integrate Tools**
   - Connect your SIEM
   - Set up EDR integration
   - Configure threat feeds
   - Enable webhooks

4. **Customize**
   - Create custom playbooks
   - Design custom dashboards
   - Set up custom alerts
   - Define custom workflows

5. **Scale**
   - Review [Kubernetes Deployment](./installation/kubernetes.md)
   - Set up high availability
   - Configure load balancing
   - Plan for disaster recovery

## Getting Help

- **Documentation**: [docs/](.)
- **Community Forum**: https://community.black-cross.io
- **GitHub Issues**: https://github.com/harborgrid-justin/black-cross/issues
- **Email Support**: support@black-cross.io

## Video Tutorials

- Platform Overview: [Watch Video](https://videos.black-cross.io/overview)
- Quick Start: [Watch Video](https://videos.black-cross.io/quickstart)
- Feature Tutorials: [Watch Playlist](https://videos.black-cross.io/tutorials)

## Training

- Free training: https://training.black-cross.io
- Certification programs available
- Live webinars every month

Welcome to Black-Cross! 🚀
