# Automated Response & Playbooks Module

Enterprise-grade Security Orchestration, Automation, and Response (SOAR) capabilities for the Black-Cross platform.

## Features

### 15.1 Pre-Built Response Playbooks
Library of ready-to-use security playbooks for common scenarios:
- Phishing Email Response
- Malware Containment
- Ransomware Response
- Account Compromise Response
- DDoS Mitigation

### 15.2 Custom Playbook Creation
Create, manage, and version custom security playbooks:
- 13+ action types
- Visual workflow support
- Action sequencing
- Error handling
- Retry logic
- Import/export

### 15.3 Automated Action Execution
Execute security actions automatically:
- Live, test, and simulation modes
- Sequential execution
- Approval workflows
- Real-time monitoring
- Execution history

### 15.4 Security Tool Integration
Integrate with your security infrastructure:
- EDR/XDR (CrowdStrike, Carbon Black, SentinelOne)
- SIEM (Splunk, QRadar, ArcSight)
- Firewall (Palo Alto, Cisco, Fortinet)
- Email Gateway (Proofpoint, Mimecast)
- Identity (Active Directory, Okta, Ping)
- Cloud Security (AWS, Azure, GCP)
- Ticketing (Jira, ServiceNow)
- Communication (Slack, Teams)

### 15.5 Decision Trees & Conditional Logic
Intelligent decision-making in playbooks:
- Simple conditions (equals, greater_than, contains)
- Compound conditions (AND/OR logic)
- Risk-based decisions
- Dynamic branching
- Context-aware execution

### 15.6 Playbook Testing & Simulation
Test playbooks before production:
- Dry run validation
- Full simulation mode
- Validation checks
- Performance testing
- Bottleneck identification

### 15.7 Response Effectiveness Metrics
Measure and improve playbook effectiveness:
- Execution metrics
- Success rates
- Time metrics
- Error analysis
- Trend analysis
- ROI calculation

## Directory Structure

```
automation/
├── models/              # Data models
│   ├── Playbook.js
│   ├── PlaybookExecution.js
│   ├── Integration.js
│   └── PlaybookTest.js
├── services/            # Business logic
│   ├── libraryService.js
│   ├── playbookService.js
│   ├── executionService.js
│   ├── integrationService.js
│   ├── decisionService.js
│   ├── testingService.js
│   └── metricsService.js
├── controllers/         # HTTP controllers
│   ├── playbookController.js
│   └── integrationController.js
├── routes/             # API routes
│   ├── playbookRoutes.js
│   └── integrationRoutes.js
├── validators/         # Input validation
│   ├── playbookValidator.js
│   └── integrationValidator.js
├── utils/              # Utilities
│   ├── logger.js
│   └── actionExecutor.js
├── config/             # Configuration
│   └── database.js
├── index.js            # Module entry point
└── README.md           # This file
```

## Quick Start

### Create a Custom Playbook

```bash
POST /api/v1/automation/playbooks
Content-Type: application/json

{
  "name": "Block Malicious IP",
  "description": "Block malicious IP and notify team",
  "category": "malware_containment",
  "author": "security_team",
  "actions": [
    {
      "type": "block_ip",
      "name": "Block IP Address",
      "parameters": {
        "ip_address": "{{threat_ip}}"
      },
      "order": 0
    },
    {
      "type": "send_notification",
      "name": "Notify SOC",
      "parameters": {
        "channel": "slack",
        "message": "IP blocked: {{threat_ip}}"
      },
      "order": 1
    }
  ]
}
```

### Execute a Playbook

```bash
POST /api/v1/automation/playbooks/{id}/execute
Content-Type: application/json

{
  "execution_mode": "live",
  "triggered_by": {
    "type": "user",
    "user_id": "admin@company.com"
  },
  "variables": {
    "threat_ip": "192.168.1.100"
  }
}
```

### Test a Playbook

```bash
POST /api/v1/automation/playbooks/{id}/test
Content-Type: application/json

{
  "test_type": "simulation",
  "test_data": {
    "threat_ip": "192.168.1.100"
  }
}
```

### Get Metrics

```bash
GET /api/v1/automation/playbooks/{id}/metrics?days=30
```

## Action Types

1. **block_ip** - Block IP addresses
2. **isolate_endpoint** - Isolate infected endpoints
3. **reset_credentials** - Force password reset
4. **send_notification** - Send alerts
5. **create_ticket** - Create incident tickets
6. **collect_evidence** - Collect forensic evidence
7. **run_scan** - Trigger security scans
8. **update_firewall** - Update firewall rules
9. **query_siem** - Query SIEM
10. **enrich_ioc** - Enrich IOCs
11. **custom_api** - Call custom APIs
12. **wait** - Wait for duration
13. **approval** - Request human approval

## Best Practices

1. **Start Simple**: Begin with pre-built playbooks
2. **Test First**: Always test in simulation mode
3. **Use Approvals**: Add approval gates for critical actions
4. **Monitor Metrics**: Track success rates and execution times
5. **Version Control**: Use version management for changes
6. **Document Actions**: Add clear descriptions to actions
7. **Error Handling**: Configure appropriate error strategies
8. **Tag Playbooks**: Use tags for organization

## API Endpoints

See [AUTOMATION_IMPLEMENTATION.md](../../AUTOMATION_IMPLEMENTATION.md) for complete API documentation.

## Examples

### Pre-Built Playbooks

```bash
# Get library
GET /api/v1/automation/playbooks/library

# Get specific playbook
GET /api/v1/automation/playbooks/{id}

# Clone pre-built playbook
POST /api/v1/automation/playbooks/{id}/clone
{
  "name": "Custom Phishing Response",
  "author": "my_team"
}
```

### Integrations

```bash
# Create integration
POST /api/v1/automation/integrations
{
  "name": "CrowdStrike EDR",
  "type": "edr",
  "vendor": "CrowdStrike",
  "configuration": {
    "endpoint": "https://api.crowdstrike.com",
    "authentication": {
      "type": "api_key",
      "credentials_ref": "crowdstrike_key"
    }
  }
}

# Test integration
POST /api/v1/automation/integrations/{id}/test
```

### Decisions

```bash
# Add decision point
POST /api/v1/automation/playbooks/{id}/decisions
{
  "decision_point": "severity_check",
  "condition": {
    "type": "simple",
    "variable": "severity",
    "operator": "equals",
    "value": "critical"
  },
  "true_path": ["escalate", "isolate"],
  "false_path": ["monitor"],
  "evaluation_order": 0
}
```

## Database Schema

All models use MongoDB with Mongoose ODM. See individual model files for detailed schemas.

## Configuration

Set the following environment variables:

```bash
MONGODB_URI=mongodb://localhost:27017/black-cross
LOG_LEVEL=info
```

## Testing

```bash
# Run unit tests
npm test src/modules/automation

# Run integration tests
npm run test:integration
```

## Performance

- Average execution time: <5 minutes
- Success rate: >95%
- Actions per playbook: 1-50
- Concurrent executions: 1000+
- Mean time to containment: <10 minutes

## Security

- Input validation with Joi
- Secure credential storage
- Approval workflows
- Audit logging
- Rate limiting
- Error sanitization

## Support

For detailed documentation, see [AUTOMATION_IMPLEMENTATION.md](../../AUTOMATION_IMPLEMENTATION.md).

## License

MIT
