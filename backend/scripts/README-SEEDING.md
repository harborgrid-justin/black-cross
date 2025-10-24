# Database Seeding Guide

Comprehensive guide for seeding the Black-Cross threat intelligence platform database with realistic sample data.

## Overview

The `seed-database.ts` script populates the PostgreSQL database with realistic cybersecurity data across all 15 security modules:

1. **Threat Intelligence** - Real threat data and indicators
2. **Incident Response** - Security incident scenarios
3. **Threat Hunting** - Proactive threat hunting data
4. **Vulnerability Management** - Real CVEs with CVSS scores
5. **SIEM** - Security event and log data
6. **Threat Actors** - APT groups and threat profiles
7. **IOC Management** - Indicators of Compromise
8. **Threat Feeds** - Threat intelligence sources
9. **Risk Assessment** - Risk scoring and analysis
10. **Collaboration** - Team communication data
11. **Reporting** - Report templates and exports
12. **Malware Analysis** - Malware samples and analysis
13. **Dark Web Monitoring** - Dark web intelligence
14. **Compliance** - Regulatory compliance tracking
15. **Automation/Playbooks** - Security automation workflows

## Quick Start

### Basic Seeding (Default Mode)

```bash
# From project root
npm run db:seed

# From backend directory
cd backend
npm run db:seed
```

This creates:
- 5 users (admin, analyst, hunter, manager, viewer)
- 7 incidents (ransomware, phishing, data breach, etc.)
- 5 vulnerabilities (real CVEs)
- 5 assets (servers, workstations, network devices)
- 5 IOCs (malicious IPs, domains, hashes)
- 5 threat actors (APT groups)
- 5 audit logs
- 5 playbook executions

### Full Comprehensive Seeding

```bash
npm run db:seed -- --full
```

This creates 10+ records per entity with additional:
- More diverse incident types
- Additional CVEs from 2023-2025
- Cloud resources and network devices
- Complex IOC relationships
- More threat actor profiles
- Extended audit trails

### Force Reseed (Clear and Reseed)

```bash
npm run db:seed -- --force
```

**⚠️ WARNING**: This will delete ALL existing data before seeding!

### Combined Flags

```bash
npm run db:seed -- --force --full
```

## Command-Line Flags

| Flag | Description | Use Case |
|------|-------------|----------|
| `--minimal` | Minimal data set (5 records each) | Quick testing, CI/CD |
| `--full` | Comprehensive data set (10+ records) | Demo, development, training |
| `--force` | Clear existing data before seeding | Fresh start, reset database |

## Sample Data Details

### Users

All users have the same password: **`Password123!`**

| Email | Username | Role | Capabilities |
|-------|----------|------|--------------|
| admin@blackcross.com | admin | admin | Full access, AI, bypass enterprise |
| analyst@blackcross.com | analyst | analyst | Incident management, knowledge creation |
| hunter@blackcross.com | hunter | hunter | Threat hunting, AI access |
| manager@blackcross.com | manager | manager | SOC management, reporting |
| viewer@blackcross.com | viewer | viewer | Read-only access |

**Full mode adds**:
- ir-lead@blackcross.com (Incident Response Lead)
- compliance@blackcross.com (Compliance Officer)
- malware-analyst@blackcross.com (Malware Analyst)

### Incidents

Realistic security incident scenarios:

- **Critical**: Ransomware attacks, data exfiltration, APT activity
- **High**: Phishing campaigns, DDoS attacks, malware infections
- **Medium**: Brute force attempts, unauthorized access
- Statuses: open, investigating, contained, resolved, closed
- Categories: Ransomware, Phishing, Data Breach, Malware, DDoS, APT

### Vulnerabilities

Real CVEs with accurate information:

- **CVE-2024-21762**: FortiOS SSL VPN Buffer Overflow (CVSS 9.6)
- **CVE-2024-3400**: Palo Alto PAN-OS Command Injection (CVSS 10.0)
- **CVE-2023-44487**: HTTP/2 Rapid Reset DDoS (CVSS 7.5)
- **CVE-2024-1086**: Linux Kernel Privilege Escalation (CVSS 7.8)
- **CVE-2023-4863**: libwebp Heap Buffer Overflow (CVSS 10.0)

Full mode includes 10+ CVEs from 2023-2025.

### Assets

IT infrastructure inventory:

- **Servers**: Web, database, application servers
- **Workstations**: Security analyst workstations
- **Network Devices**: Firewalls, VPN gateways
- **Cloud Resources**: Kubernetes clusters, cloud services
- **Databases**: PostgreSQL, Redis, Elasticsearch

Criticality levels: low, medium, high, critical
Environments: production, staging, development, testing

### IOCs (Indicators of Compromise)

Real threat intelligence data:

- **IP Addresses**: Known C2 servers, malicious infrastructure
- **Domains**: Phishing sites, malware distribution
- **File Hashes**: MD5/SHA256 of known malware (Emotet, TrickBot, Cobalt Strike)
- **URLs**: Malware download links, exploit kits
- **Email Addresses**: Phishing campaign sources

Sources: VirusTotal, URLhaus, PhishTank, Abuse.ch, ThreatConnect

### Threat Actors

Real APT groups and threat profiles:

- **APT28 (Fancy Bear)**: Russian GRU cyber espionage
- **APT29 (Cozy Bear)**: Russian SVR, SolarWinds attackers
- **Lazarus Group**: North Korean state-sponsored, WannaCry
- **APT41 (Double Dragon)**: Chinese dual-use threat actor
- **Conti**: Russian ransomware-as-a-service (defunct)

Full mode includes 10+ threat actors with detailed TTPs.

### Playbook Executions

Security automation workflows:

- Ransomware Incident Response
- Phishing Email Analysis
- Vulnerability Scanning
- Threat Hunting (APT TTPs)
- Compliance Checks (SOC2)
- IOC Enrichment
- Incident Containment
- Malware Sandbox Analysis

## Prerequisites

Before seeding:

1. **PostgreSQL Running**:
   ```bash
   docker-compose up -d postgres
   ```

2. **Database Synced**:
   ```bash
   npm run db:sync
   ```

3. **Environment Configured**:
   - `backend/.env` exists with valid `DATABASE_URL`
   - PostgreSQL connection working

## Verification

### Check Seeded Data

```bash
# Connect to PostgreSQL
psql -h localhost -U blackcross -d blackcross

# Count records
SELECT 'Users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'Incidents', COUNT(*) FROM incidents
UNION ALL
SELECT 'Vulnerabilities', COUNT(*) FROM vulnerabilities
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets
UNION ALL
SELECT 'IOCs', COUNT(*) FROM iocs
UNION ALL
SELECT 'Threat Actors', COUNT(*) FROM threat_actors
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'Playbooks', COUNT(*) FROM playbook_executions;
```

### Test Login

```bash
# Start backend
npm run dev:backend

# Test login via curl
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@blackcross.com", "password": "Password123!"}'
```

### Browse Data in Frontend

```bash
# Start full application
npm run dev

# Open browser
open http://localhost:3000

# Login with:
# Email: admin@blackcross.com
# Password: Password123!
```

## Troubleshooting

### Database Connection Error

```
❌ PostgreSQL (Sequelize) connection failed: connect ECONNREFUSED
```

**Solution**: Ensure PostgreSQL is running:
```bash
docker-compose up -d postgres
# Wait 5 seconds for startup
npm run db:seed
```

### Foreign Key Constraint Error

```
❌ Foreign key constraint error
```

**Solution**: Clear database and reseed:
```bash
npm run db:seed -- --force
```

### "Users already exist" Message

```
✓ Users already exist (5 found), skipping...
```

**Solution**: This is normal behavior. Use `--force` to clear and reseed:
```bash
npm run db:seed -- --force
```

### TypeScript Compilation Error

```
❌ Cannot find module './models/User'
```

**Solution**: Ensure backend dependencies are installed:
```bash
cd backend
npm install
npm run db:seed
```

## Development Workflow

### Typical Development Setup

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Sync database schema
npm run db:sync

# 3. Seed sample data
npm run db:seed

# 4. Start development servers
npm run dev
```

### Testing Workflow

```bash
# 1. Fresh database for testing
npm run db:seed -- --force --minimal

# 2. Run backend tests
npm run test:backend

# 3. Run E2E tests
npm run test:e2e
```

### Demo Preparation

```bash
# Full comprehensive data for demos
npm run db:seed -- --force --full
```

## Data Relationships

Understanding foreign key dependencies:

```
Users
  ├── Incidents (assignedToId)
  ├── AuditLogs (userId)
  └── PlaybookExecutions (triggeredBy)

Incidents
  └── Users (assignedTo)

Assets (independent)
Vulnerabilities (independent)
IOCs (independent)
ThreatActors (independent)
```

## Security Considerations

### Production Warning

**⚠️ NEVER use seeded data in production!**

- Default password (`Password123!`) is insecure
- Sample data is for development/testing only
- IOCs and threat data are examples, not live intelligence

### Password Security

For production, always:
- Use strong, unique passwords
- Implement password complexity requirements
- Enable multi-factor authentication (MFA)
- Rotate credentials regularly

### Data Privacy

Sample data includes:
- Fictional user profiles
- Simulated security incidents
- Example IP addresses (RFC 5737 ranges)
- Test domain names

No real personal or organizational data is included.

## Script Architecture

### Code Structure

```typescript
// CLI argument parsing
parseArgs() → { force, minimal, full }

// Database initialization
initializeSequelize()
syncDatabase()

// Optional data clearing
clearDatabase() // if --force

// Sequential seeding (respects FK constraints)
seedUsers()
seedVulnerabilities()
seedAssets()
seedIOCs()
seedThreatActors()
seedIncidents(users)
seedAuditLogs(users)
seedPlaybookExecutions(users)
```

### Type Safety

All seeding functions:
- Use TypeScript strict mode
- Implement explicit type annotations
- Leverage Sequelize model types
- Include comprehensive JSDoc documentation

### Error Handling

- Try-catch blocks around all async operations
- Descriptive error messages with context
- Graceful degradation for optional services
- Proper exit codes (0 = success, 1 = failure)

## Extending the Script

### Adding New Entities

1. Create seeding function:
```typescript
async function seedNewEntity(config: SeedConfig): Promise<NewEntity[]> {
  console.log('🌱 Seeding new entities...');

  const existing = await NewEntity.count();
  if (existing > 0 && !config.force) {
    return await NewEntity.findAll();
  }

  const entities = await NewEntity.bulkCreate([/* data */]);
  console.log(`   ✓ Created ${entities.length} entities\n`);
  return entities;
}
```

2. Add to main() function:
```typescript
const newEntities = await seedNewEntity(config);
```

3. Update summary output.

### Adding More Sample Data

Modify existing functions to add more realistic data:
- Research actual CVEs from NVD
- Include real threat actor names from MITRE ATT&CK
- Use legitimate IOC sources (VirusTotal, URLhaus)
- Reference actual malware families

## Additional Resources

### External References

- **CVE Database**: [https://nvd.nist.gov/](https://nvd.nist.gov/)
- **MITRE ATT&CK**: [https://attack.mitre.org/](https://attack.mitre.org/)
- **VirusTotal**: [https://www.virustotal.com/](https://www.virustotal.com/)
- **URLhaus**: [https://urlhaus.abuse.ch/](https://urlhaus.abuse.ch/)
- **PhishTank**: [https://phishtank.org/](https://phishtank.org/)

### Internal Documentation

- [Backend Models](../models/README.md)
- [Database Schema](../config/sequelize.ts)
- [API Documentation](../README.md)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review database logs: `docker-compose logs postgres`
3. Verify environment configuration: `backend/.env`
4. Open an issue on the project repository

---

**Last Updated**: 2025-10-24
**Script Version**: 1.0.0
**Compatible with**: Black-Cross v1.0.0+
