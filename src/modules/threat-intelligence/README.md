# Threat Intelligence Management Module

## Overview

Complete implementation of the Threat Intelligence Management module with full business logic, data logic, and database integration.

## Features Implemented

### 1. Real-time Threat Data Collection and Aggregation
- Multi-source data ingestion
- Automatic deduplication
- Data validation and sanitization
- Batch collection support
- Real-time streaming

### 2. Threat Categorization and Tagging System
- Custom category creation
- Multi-level tagging
- Automated categorization using rules
- MITRE ATT&CK framework integration
- Tag-based search and filtering

### 3. Historical Threat Data Archival
- Automated data retention policies
- Time-based archival
- Archive search functionality
- Restoration capability
- Archival statistics

### 4. Threat Intelligence Enrichment
- Automated OSINT enrichment
- Geolocation data addition
- Reputation scoring
- DNS enrichment
- Batch enrichment support

### 5. Custom Threat Taxonomy Management
- Custom taxonomy builder
- Import/export taxonomies
- Taxonomy versioning
- Mapping to standard frameworks
- Hierarchy management

### 6. Automated Threat Correlation
- IOC overlap detection
- Temporal correlation analysis
- Infrastructure overlap detection
- Behavioral similarity analysis
- Campaign identification

### 7. Threat Context Analysis
- Attack chain reconstruction
- Industry targeting analysis
- Geographic distribution mapping
- Temporal pattern analysis
- Impact assessment
- Confidence scoring

## Architecture

```
threat-intelligence/
├── config/           # Database configuration
├── models/          # MongoDB data models
│   ├── Threat.js
│   ├── Taxonomy.js
│   └── ThreatCorrelation.js
├── services/        # Business logic layer
│   ├── collectionService.js
│   ├── categorizationService.js
│   ├── archivalService.js
│   ├── enrichmentService.js
│   ├── taxonomyService.js
│   ├── correlationService.js
│   └── contextService.js
├── controllers/     # HTTP request handlers
│   ├── threatController.js
│   └── taxonomyController.js
├── routes/          # API route definitions
│   ├── threatRoutes.js
│   └── taxonomyRoutes.js
├── validators/      # Input validation schemas
│   ├── threatValidator.js
│   └── taxonomyValidator.js
├── utils/           # Helper utilities
│   ├── logger.js
│   └── deduplication.js
└── index.js         # Module entry point
```

## API Endpoints

### Threat Collection
- `POST /api/v1/threat-intelligence/threats/collect` - Collect threat intelligence
- `GET /api/v1/threat-intelligence/threats/stream` - Stream real-time threats

### Threat Categorization
- `POST /api/v1/threat-intelligence/threats/categorize` - Categorize threats
- `GET /api/v1/threat-intelligence/threats/categories` - List categories

### Threat Archival
- `POST /api/v1/threat-intelligence/threats/archive` - Archive threats
- `GET /api/v1/threat-intelligence/threats/history` - Get historical threats

### Threat Enrichment
- `POST /api/v1/threat-intelligence/threats/enrich` - Enrich threat data
- `GET /api/v1/threat-intelligence/threats/:id/enriched` - Get enriched threat

### Taxonomy Management
- `POST /api/v1/threat-intelligence/taxonomies` - Create taxonomy
- `PUT /api/v1/threat-intelligence/taxonomies/:id` - Update taxonomy
- `GET /api/v1/threat-intelligence/taxonomies/:id` - Get taxonomy
- `GET /api/v1/threat-intelligence/taxonomies` - List taxonomies
- `DELETE /api/v1/threat-intelligence/taxonomies/:id` - Delete taxonomy

### Threat Correlation
- `POST /api/v1/threat-intelligence/threats/correlate` - Correlate threats
- `GET /api/v1/threat-intelligence/threats/:id/related` - Get related threats

### Threat Context
- `GET /api/v1/threat-intelligence/threats/:id/context` - Get threat context
- `POST /api/v1/threat-intelligence/threats/analyze` - Analyze threats

## Data Models

### Threat Object
```javascript
{
  id: String (UUID),
  name: String,
  type: Enum (malware, phishing, ransomware, etc.),
  severity: Enum (critical, high, medium, low, info),
  confidence: Number (0-100),
  categories: [String],
  tags: [String],
  description: String,
  indicators: [{
    type: Enum (ip, domain, url, hash, etc.),
    value: String,
    context: String
  }],
  relationships: [{
    threat_id: String,
    relationship_type: Enum,
    confidence: Number
  }],
  source: {
    name: String,
    url: String,
    reliability: Number
  },
  status: Enum (active, inactive, archived),
  enrichment_data: {
    geolocation: Object,
    reputation: Object,
    osint: Object,
    dns: Object
  },
  mitre_attack: {
    tactics: [String],
    techniques: [String],
    groups: [String]
  }
}
```

### Taxonomy Object
```javascript
{
  id: String (UUID),
  name: String,
  description: String,
  version: String,
  type: Enum (category, framework, custom),
  categories: [{
    id: String,
    name: String,
    description: String,
    level: Number,
    parent_category_id: String
  }],
  mappings: [{
    framework: Enum (mitre_attack, kill_chain, etc.),
    external_id: String,
    mapping_type: Enum
  }]
}
```

### Threat Correlation Object
```javascript
{
  id: String (UUID),
  threat_id_1: String,
  threat_id_2: String,
  correlation_type: Enum,
  similarity_score: Number (0-100),
  confidence: Number (0-100),
  evidence: [{
    type: String,
    description: String,
    weight: Number,
    data: Object
  }],
  status: Enum (pending, confirmed, rejected)
}
```

## Usage Examples

### Collect a Threat
```bash
curl -X POST http://localhost:8080/api/v1/threat-intelligence/threats/collect \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emotet Banking Trojan",
    "type": "malware",
    "severity": "high",
    "confidence": 85,
    "description": "Emotet is a banking trojan that steals financial credentials",
    "indicators": [
      {"type": "hash", "value": "a1b2c3d4e5f6", "context": "malware sample"},
      {"type": "ip", "value": "192.168.1.100", "context": "c2 server"}
    ],
    "categories": ["banking-trojan", "credential-theft"],
    "tags": ["emotet", "trojan", "banking"]
  }'
```

### Auto-Categorize a Threat
```bash
curl -X POST http://localhost:8080/api/v1/threat-intelligence/threats/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "threat_id": "threat-uuid",
    "auto_categorize": true
  }'
```

### Enrich a Threat
```bash
curl -X POST http://localhost:8080/api/v1/threat-intelligence/threats/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "threat_id": "threat-uuid",
    "sources": ["geolocation", "reputation", "osint"]
  }'
```

### Correlate Threats
```bash
curl -X POST http://localhost:8080/api/v1/threat-intelligence/threats/correlate \
  -H "Content-Type: application/json" \
  -d '{
    "threat_id": "threat-uuid",
    "min_similarity": 70,
    "correlation_types": ["ioc_overlap", "temporal", "infrastructure"]
  }'
```

### Get Threat Context
```bash
curl http://localhost:8080/api/v1/threat-intelligence/threats/{threat-id}/context
```

## Database Requirements

- **MongoDB**: Primary database for threat storage
- **Connection String**: Set in `MONGODB_URI` environment variable
- **Default**: `mongodb://localhost:27017/blackcross`

## Configuration

Environment variables:
```
MONGODB_URI=mongodb://localhost:27017/blackcross
LOG_LEVEL=info
```

## Business Logic Highlights

### Deduplication
- Automatic detection of duplicate threats using hash-based comparison
- Merges duplicate threats with existing records
- Preserves unique indicators and tags

### Correlation Algorithm
- Multi-factor correlation scoring
- Supports IOC overlap, temporal patterns, infrastructure sharing, and behavioral similarity
- Configurable similarity thresholds
- Evidence-based correlation storage

### Enrichment Pipeline
- Modular enrichment sources
- Parallel enrichment processing
- Graceful handling of enrichment failures
- Cached enrichment data

### Context Analysis
- Attack chain reconstruction from MITRE ATT&CK data
- Industry targeting inference
- Geographic distribution mapping
- Temporal pattern detection
- Impact assessment based on threat type

## Performance Considerations

- Indexed fields for fast queries
- Batch operations for high-volume data
- Pagination support for large result sets
- Connection pooling for database efficiency
- Async/await for non-blocking operations

## Security

- Input validation using Joi schemas
- Sanitized database queries
- Audit logging for all operations
- Encryption support for sensitive data
- Access control ready for integration

## Testing

The module includes comprehensive business logic that can be tested with:
```bash
npm test src/modules/threat-intelligence
```

## Future Enhancements

- Machine learning-based auto-categorization
- Real external API integrations (VirusTotal, AlienVault, etc.)
- Elasticsearch integration for advanced search
- Redis caching layer
- WebSocket support for real-time streaming
- GraphQL API endpoints
