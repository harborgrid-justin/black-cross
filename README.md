# Black-Cross: Enterprise Cyber Threat Intelligence Platform

Black-Cross is a comprehensive, enterprise-grade cyber threat intelligence platform designed for security analysts and teams to effectively manage, analyze, and respond to cyber threats. The platform provides 15 core enterprise features, each with multiple sub-modules for complete threat lifecycle management.

## 🆕 OpenCTI Integration Analysis (NEW!)

We've conducted a comprehensive analysis of the OpenCTI platform to identify opportunities for enhancing Black-Cross. This analysis identified **20 advanced features** and **37,027 lines of production-ready code** that can accelerate development by 35-40% and save $225K-$300K.

**📚 Documentation:**
- **[OPENCTI_ANALYSIS_README.md](./OPENCTI_ANALYSIS_README.md)** - Start here! Complete overview and navigation guide
- **[OPENCTI_QUICK_REFERENCE.md](./OPENCTI_QUICK_REFERENCE.md)** - 5-minute executive summary
- **[OPENCTI_EXECUTIVE_SUMMARY.md](./OPENCTI_EXECUTIVE_SUMMARY.md)** - Business case and ROI (4-5x over 3 years)
- **[OPENCTI_FEATURE_ANALYSIS.md](./OPENCTI_FEATURE_ANALYSIS.md)** - Technical deep dive (20 features)
- **[OPENCTI_INTEGRATION_GUIDE.md](./OPENCTI_INTEGRATION_GUIDE.md)** - Implementation handbook with code
- **[OPENCTI_DELIVERY_SUMMARY.md](./OPENCTI_DELIVERY_SUMMARY.md)** - What was delivered

**Key Highlights:**
- ✅ 20 production-ready features identified
- ✅ $225K-$300K cost savings potential
- ✅ 4-5x ROI over 3 years
- ✅ 26-week implementation roadmap
- ✅ Low-Medium risk assessment

## 🚀 Key Features

### 1. Threat Intelligence Management
- Real-time threat data collection and aggregation
- Threat categorization and tagging system
- Historical threat data archival
- Threat intelligence enrichment
- Custom threat taxonomy management
- Automated threat correlation
- Threat context analysis

### 2. Incident Response & Management
- Incident ticket creation and tracking
- Automated incident prioritization
- Response workflow automation
- Post-incident analysis and reporting
- Incident timeline visualization
- Evidence collection and preservation
- Communication and notification system

### 3. Threat Hunting Platform
- Advanced query builder for threat hunting
- Custom hunting hypotheses management
- Automated hunting playbooks
- Behavioral analysis tools
- Pattern recognition and anomaly detection
- Hunt result documentation
- Collaborative hunting sessions

### 4. Vulnerability Management
- Vulnerability scanning integration
- CVE tracking and monitoring
- Asset vulnerability mapping
- Patch management workflow
- Risk-based vulnerability prioritization
- Remediation tracking and verification
- Vulnerability trend analysis

### 5. Security Information & Event Management (SIEM)
- Log collection and normalization
- Real-time event correlation
- Custom detection rules engine
- Alert management and tuning
- Security event dashboards
- Forensic analysis tools
- Compliance reporting

### 6. Threat Actor Profiling
- Threat actor database and tracking
- TTPs (Tactics, Techniques, Procedures) mapping
- Attribution analysis tools
- Campaign tracking and linking
- Actor motivation and capability assessment
- Geographic and sector targeting analysis
- Threat actor relationship mapping

### 7. Indicator of Compromise (IoC) Management
- IoC collection and validation
- Multi-format IoC support (IP, domain, hash, URL)
- IoC confidence scoring
- Automated IoC enrichment
- IoC lifecycle management
- Bulk IoC import/export
- IoC search and filtering

### 8. Threat Intelligence Feeds Integration
- Multi-source feed aggregation
- Commercial and open-source feed support
- Feed reliability scoring
- Automated feed parsing and normalization
- Custom feed creation
- Feed scheduling and management
- Duplicate detection and deduplication

### 9. Risk Assessment & Scoring
- Asset criticality assessment
- Threat impact analysis
- Risk calculation engine
- Risk-based prioritization
- Custom risk scoring models
- Risk trend visualization
- Executive risk reporting

### 10. Collaboration & Workflow
- Team workspace and project management
- Role-based access control
- Real-time collaboration tools
- Task assignment and tracking
- Knowledge base and wiki
- Secure chat and messaging
- Activity feeds and notifications

### 11. Reporting & Analytics
- Customizable report templates
- Automated scheduled reporting
- Executive dashboards
- Threat trend analysis
- Metric tracking and KPIs
- Data visualization tools
- Export capabilities (PDF, CSV, JSON)

### 12. Malware Analysis & Sandbox
- Automated malware submission
- Dynamic and static analysis
- Behavioral analysis reports
- Sandbox environment management
- Malware family classification
- IOC extraction from samples
- YARA rule generation

### 13. Dark Web Monitoring
- Dark web forum monitoring
- Credential leak detection
- Brand and asset monitoring
- Threat actor tracking on dark web
- Automated alert generation
- Dark web data collection
- Intelligence report generation

### 14. Compliance & Audit Management
- Compliance framework mapping (NIST, ISO, PCI-DSS)
- Audit trail and logging
- Compliance gap analysis
- Policy management and enforcement
- Automated compliance reporting
- Evidence collection for audits
- Regulatory requirement tracking

### 15. Automated Response & Playbooks
- Pre-built response playbooks
- Custom playbook creation
- Automated action execution
- Integration with security tools (SOAR)
- Decision trees and conditional logic
- Playbook testing and simulation
- Response effectiveness metrics

## 📋 Prerequisites

- Node.js 16+ or Python 3.8+
- Docker and Docker Compose
- PostgreSQL 13+
- MongoDB 4.4+
- Redis 6+
- Elasticsearch 7+
- 16GB RAM minimum (32GB recommended)
- 100GB storage minimum

## 📁 Project Structure

The project follows Google engineering best practices with a clean separation of concerns:

```
black-cross/
├── frontend/          # React 18 + TypeScript + TSX frontend application
├── backend/           # Node.js + TypeScript + Express backend API
│   ├── models/        # Sequelize ORM models for PostgreSQL
│   └── config/        # Database and application configuration
├── docs/              # Documentation
├── docker-compose.yml # Docker orchestration
└── package.json       # Root package for workspace management
```

## 🔧 Installation

### Quick Setup (5 Minutes)

The fastest way to get started with Black-Cross:

```bash
# 1. Clone the repository
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross

# 2. Run automated setup
npm run setup

# 3. Start PostgreSQL (using Docker)
docker-compose up -d postgres

# 4. Sync database models
npm run db:sync

# 5. Start the application
npm run dev

# Access the application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Default login: admin@black-cross.io / admin
```

**✅ That's it!** See [SETUP.md](./SETUP.md) for detailed instructions and troubleshooting.

### Alternative: Docker Compose (All Services)

To run with all services (PostgreSQL, MongoDB, Redis, Elasticsearch):

```bash
# Clone and start all services
git clone https://github.com/harborgrid-justin/black-cross.git
cd black-cross
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Manual Setup

For manual installation without the automated setup script:

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Sync database models with Sequelize
npm run db:sync

# Start development servers
npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

For detailed installation instructions, see:
- **[SETUP.md](./SETUP.md)** - Complete setup guide with troubleshooting
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick command reference
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Quick start guide
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Sequelize Migration Guide](./docs/SEQUELIZE_MIGRATION.md)
- [Full Installation Guide](./docs/INSTALLATION.md)

## 📖 Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Frontend Implementation](./FRONTEND_IMPLEMENTATION.md)
- [Frontend UI/UX Complete Alignment](./ISSUE_100_PERCENT_ALIGNMENT_COMPLETE.md) ✅
- [Threat Intelligence Implementation](./THREAT_INTELLIGENCE_IMPLEMENTATION.md)
- [Feature Documentation](./docs/features/)
- [API Reference](./docs/api/)
- [User Guide](./docs/user-guide/)
- [Administrator Guide](./docs/admin-guide/)
- [Development Guide](./docs/development/)

## 🔒 Security

Black-Cross implements enterprise-grade security features:
- End-to-end encryption
- Multi-factor authentication
- Role-based access control
- Audit logging
- Secure credential storage
- API rate limiting
- Network isolation

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📞 Support

For support and questions:
- Documentation: [docs/](./docs/)
- Issues: GitHub Issues
- Email: support@black-cross.io

## 🙏 Acknowledgments

Built for security analysts, by security analysts. Special thanks to the cybersecurity community for their continuous feedback and contributions.
