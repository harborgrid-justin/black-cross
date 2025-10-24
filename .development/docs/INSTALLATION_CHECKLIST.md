# Black-Cross Installation Checklist

Use this checklist to ensure your Black-Cross installation is complete and properly configured.

## ✅ Pre-Installation

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm 7+ installed (`npm --version`)
- [ ] Git installed (optional but recommended)
- [ ] PostgreSQL 13+ available (Docker or local installation)
- [ ] 16GB+ RAM available
- [ ] 10GB+ disk space available

## ✅ Installation Steps

### 1. Clone Repository
- [ ] Repository cloned successfully
- [ ] Changed into project directory (`cd black-cross`)

### 2. Automated Setup
- [ ] Run `npm run setup`
- [ ] All dependencies installed successfully
- [ ] No errors during installation
- [ ] Environment files created (`.env` files)

### 3. Environment Configuration

#### Backend Configuration (`backend/.env`)
- [ ] `DATABASE_URL` configured with correct PostgreSQL credentials
- [ ] `JWT_SECRET` changed from default (minimum 32 characters)
- [ ] `ENCRYPTION_KEY` set (exactly 32 characters)
- [ ] `SESSION_SECRET` changed from default
- [ ] Optional: Threat intelligence API keys added
  - [ ] VIRUSTOTAL_API_KEY
  - [ ] SHODAN_API_KEY
  - [ ] ALIENVAULT_API_KEY
  - [ ] ABUSEIPDB_API_KEY

#### Frontend Configuration (`frontend/.env`)
- [ ] `VITE_API_URL` set correctly (default: `http://localhost:8080/api/v1`)

### 4. Database Setup
- [ ] PostgreSQL running (`docker-compose ps postgres` or `pg_isready`)
- [ ] Database `blackcross` created
- [ ] Database user has proper permissions
- [ ] Connection string tested

### 5. Prisma Setup
- [ ] Prisma Client generated (`npm run prisma:generate`)
- [ ] Database migrations run (`npm run prisma:migrate`)
- [ ] No migration errors
- [ ] Tables created successfully

### 6. Verification
- [ ] Run `npm run verify` - all checks pass
- [ ] All documentation files present
- [ ] All npm scripts available

## ✅ Post-Installation

### 7. Start Application
- [ ] Backend started successfully (`npm run dev:backend`)
- [ ] Frontend started successfully (`npm run dev:frontend`)
- [ ] No startup errors in console
- [ ] Backend accessible at http://localhost:8080
- [ ] Frontend accessible at http://localhost:3000

### 8. Initial Login
- [ ] Can access frontend at http://localhost:3000
- [ ] Login page loads correctly
- [ ] Can login with default credentials (admin@black-cross.io / admin)
- [ ] Dashboard loads after login
- [ ] **CRITICAL**: Changed default admin password immediately

### 9. Basic Functionality
- [ ] Dashboard displays correctly
- [ ] Can navigate between different sections
- [ ] API endpoints responding (check Network tab)
- [ ] No console errors in browser
- [ ] WebSocket connection established (if applicable)

### 10. Optional Services
- [ ] MongoDB running (if using legacy modules)
  - [ ] `docker-compose up -d mongodb`
  - [ ] MONGODB_URI configured in backend/.env
- [ ] Redis running (if using caching)
  - [ ] `docker-compose up -d redis`
  - [ ] REDIS_URL configured in backend/.env
- [ ] Elasticsearch running (if using advanced search)
  - [ ] `docker-compose up -d elasticsearch`
  - [ ] ELASTICSEARCH_URL configured in backend/.env

## ✅ Security Checklist

### Critical Security Tasks
- [ ] **Default admin password changed**
- [ ] Strong PostgreSQL password set
- [ ] JWT_SECRET is random and secure (32+ characters)
- [ ] ENCRYPTION_KEY is random and secure (32 characters)
- [ ] SESSION_SECRET is random and secure (32+ characters)
- [ ] All `.env` files added to `.gitignore`
- [ ] `.env` files not committed to version control

### Recommended Security Measures
- [ ] Enable MFA for admin account
- [ ] Create individual user accounts (not using shared admin)
- [ ] Review and adjust CORS settings in backend/.env
- [ ] Set up SSL/TLS for production
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Review audit logging configuration

## ✅ Testing & Validation

### Backend Tests
- [ ] Run `npm run test:backend`
- [ ] All tests pass
- [ ] No critical warnings

### Frontend Tests
- [ ] Run `npm run test:frontend`
- [ ] All tests pass
- [ ] No critical warnings

### Integration Tests
- [ ] API health endpoint responding (`curl http://localhost:8080/health`)
- [ ] Database connectivity working
- [ ] Can create/read/update/delete test data

### Performance Checks
- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 500ms
- [ ] No memory leaks detected
- [ ] CPU usage reasonable (< 50% idle)

## ✅ Documentation Review

- [ ] Read [README.md](./README.md)
- [ ] Read [SETUP.md](./SETUP.md)
- [ ] Read [GETTING_STARTED.md](./GETTING_STARTED.md)
- [ ] Reviewed [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- [ ] Familiar with available npm scripts
- [ ] Know where to find help (GitHub issues, docs)

## ✅ Optional Configuration

### Integrations
- [ ] SIEM integration configured
- [ ] EDR/XDR connections set up
- [ ] Email gateway configured (SMTP settings)
- [ ] Notification channels configured
  - [ ] Slack webhook
  - [ ] Microsoft Teams webhook
  - [ ] Email notifications

### Data Import
- [ ] Initial threat intelligence imported
- [ ] Asset inventory imported
- [ ] User accounts created
- [ ] Custom configurations applied

### Monitoring
- [ ] Application logs accessible
- [ ] Database logs accessible
- [ ] Error tracking configured
- [ ] Performance monitoring set up

## ✅ Production Readiness (If Applicable)

### Infrastructure
- [ ] High availability setup configured
- [ ] Load balancer configured
- [ ] Backup system in place
- [ ] Disaster recovery plan documented
- [ ] Monitoring and alerting configured

### Performance
- [ ] Database indices optimized
- [ ] Caching configured (Redis)
- [ ] CDN configured for static assets
- [ ] Rate limiting configured
- [ ] Connection pooling optimized

### Security Hardening
- [ ] SSL/TLS certificates installed
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Rate limiting active
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection verified

### Compliance
- [ ] Audit logging enabled
- [ ] Data retention policies configured
- [ ] Privacy policy reviewed
- [ ] Terms of service reviewed
- [ ] Compliance requirements met (GDPR, HIPAA, etc.)

## 📝 Installation Summary

**Date Completed**: _______________

**Installed By**: _______________

**Version**: _______________

**Environment**: [ ] Development [ ] Staging [ ] Production

**Notes**:
```
_________________________________________________________
_________________________________________________________
_________________________________________________________
```

## 🆘 Troubleshooting Checklist

If you encounter issues, verify:

- [ ] All prerequisites met
- [ ] Latest version of code pulled
- [ ] Dependencies installed correctly (`npm run clean && npm run setup`)
- [ ] Environment files configured properly
- [ ] Database running and accessible
- [ ] Correct Node.js version (16+)
- [ ] No port conflicts (8080, 3000, 5432)
- [ ] No firewall blocking connections
- [ ] Sufficient disk space
- [ ] Sufficient memory

For detailed troubleshooting, see [SETUP.md](./SETUP.md#troubleshooting).

## ✅ Sign-Off

Installation completed and verified by:

**Name**: _______________

**Date**: _______________

**Signature**: _______________

---

**Congratulations!** Your Black-Cross installation is complete! 🎉

For ongoing maintenance and updates, refer to:
- [README.md](./README.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
