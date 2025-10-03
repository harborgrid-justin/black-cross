# Threat Actor Profiling Module

## Overview
Complete implementation of the Threat Actor Profiling module for the Black-Cross platform with 100% full business logic, data logic, and database integration.

## Features

### 1. Threat Actor Database and Tracking
- Create, read, update, delete threat actor profiles
- Actor aliases and naming conventions
- Actor timeline tracking and historical activity
- Status tracking (active, dormant, defunct)
- Confidence and threat scoring
- Infrastructure tracking (domains, IPs, emails)

### 2. TTPs (Tactics, Techniques, Procedures) Mapping
- MITRE ATT&CK framework integration
- TTP frequency analysis
- TTP evolution tracking over time
- TTP overlap analysis between actors
- Defensive recommendations based on TTPs
- Custom TTP taxonomy support

### 3. Attribution Analysis Tools
- Technical indicator analysis (malware, infrastructure)
- Behavioral pattern matching (TTPs)
- Linguistic and cultural indicator analysis
- Multi-source evidence correlation
- Confidence scoring with detailed factors
- Attribution verification workflow

### 4. Campaign Tracking and Linking
- Campaign lifecycle management
- Target organization tracking
- Timeline event tracking
- Campaign impact assessment
- Campaign linking and correlation
- TTP analysis per campaign

### 5. Actor Motivation and Capability Assessment
- Technical capability scoring
- Operational capability scoring
- Motivation categorization and analysis
- Resource level assessment
- Success rate metrics
- Comprehensive threat assessment

### 6. Geographic and Sector Targeting Analysis
- Geographic targeting heat maps
- Industry sector analysis
- Targeting trends over time
- Temporal targeting patterns
- Attack vector preferences
- Defensive recommendations by industry/country

### 7. Threat Actor Relationship Mapping
- Actor-to-actor relationships
- Infrastructure sharing analysis
- Tool and malware sharing detection
- Collaboration detection
- Relationship network visualization
- Nation-state affiliation tracking
- Supply chain relationship analysis

## Architecture

### Data Models
- **ThreatActor** - Complete actor profile with all attributes
- **Campaign** - Campaign tracking with targets and timeline
- **Attribution** - Attribution analysis results and evidence

### Repositories
- **ThreatActorRepository** - Database operations for actors
- **CampaignRepository** - Database operations for campaigns
- **AttributionRepository** - Database operations for attributions

### Services
- **ThreatActorService** - Actor management business logic
- **TTPMappingService** - TTP mapping and analysis
- **AttributionService** - Attribution analysis engine
- **CampaignService** - Campaign tracking and linking
- **AssessmentService** - Capability and motivation assessment
- **TargetingAnalysisService** - Geographic and sector analysis
- **RelationshipService** - Relationship mapping and analysis

### Controllers
- **ThreatActorController** - HTTP request handlers

### Validators
- Comprehensive Joi schemas for all inputs
- Request validation for all endpoints

## API Endpoints

### Base Path: `/api/v1/threat-actors`

#### Actor Operations
- `POST /` - Create threat actor
- `GET /` - List threat actors
- `GET /statistics` - Get statistics
- `GET /recent` - Get recently active actors
- `GET /search/infrastructure` - Search by infrastructure
- `GET /:id` - Get actor by ID
- `PATCH /:id` - Update actor
- `DELETE /:id` - Delete actor
- `POST /:id/aliases` - Add alias
- `POST /:id/calculate-score` - Calculate threat score

#### TTP Operations
- `GET /:id/ttps` - Get TTPs
- `POST /:id/ttps` - Add TTP
- `GET /:id/ttps/frequency` - TTP frequency analysis
- `GET /:id/ttps/recommendations` - Defensive recommendations
- `GET /:id/ttps/evolution` - TTP evolution
- `GET /:id/ttps/overlap/:id2` - TTP overlap analysis

#### Attribution Operations
- `POST /attribute` - Perform attribution
- `GET /attribution/:incident_id` - Get attribution
- `GET /:id/attributions` - Get actor attributions
- `PUT /attribution/:id/verify` - Update verification
- `GET /attribution/statistics/all` - Attribution statistics

#### Campaign Operations
- `POST /campaigns` - Create campaign
- `GET /campaigns` - List campaigns
- `GET /campaigns/active/all` - Get active campaigns
- `GET /campaigns/statistics/all` - Campaign statistics
- `GET /campaigns/:id` - Get campaign
- `PATCH /campaigns/:id` - Update campaign
- `POST /campaigns/:id/targets` - Add target
- `POST /campaigns/:id/timeline` - Add timeline event
- `GET /campaigns/:id/timeline` - Get timeline
- `POST /campaigns/:id/link` - Link campaigns
- `GET /campaigns/:id/impact` - Impact analysis
- `GET /campaigns/:id/ttps` - Campaign TTPs

#### Assessment Operations
- `GET /:id/assessment` - Get assessment
- `PUT /:id/assessment` - Update assessment
- `GET /:id/assessment/comprehensive` - Comprehensive assessment
- `GET /:id/motivation` - Motivation assessment

#### Targeting Analysis Operations
- `GET /:id/targets` - Actor targeting profile
- `GET /targeting-trends/geographic` - Geographic heat map
- `GET /targeting-trends/industry` - Industry analysis
- `GET /targeting-trends` - Targeting trends
- `GET /:id/targeting/temporal` - Temporal patterns
- `GET /:id/targeting/vectors` - Attack vectors
- `GET /defensive-recommendations` - Defensive recommendations

#### Relationship Operations
- `GET /:id/relationships` - Get relationships
- `POST /:id/relationships` - Add relationship
- `GET /:id/relationships/infrastructure` - Infrastructure sharing
- `GET /:id/relationships/tools` - Tool sharing
- `GET /:id/relationships/collaboration` - Detect collaboration
- `GET /:id/relationships/network` - Relationship network
- `GET /:id/affiliation` - Nation-state affiliation

## Usage Examples

### Create a Threat Actor
```javascript
POST /api/v1/threat-actors
{
  "name": "APT29",
  "type": "apt",
  "sophistication": "expert",
  "motivation": ["espionage"],
  "origin_country": "Russia",
  "targets": {
    "industries": ["government", "technology"],
    "countries": ["USA", "UK", "Germany"]
  }
}
```

### Add TTP to Actor
```javascript
POST /api/v1/threat-actors/{id}/ttps
{
  "tactic": "Initial Access",
  "technique": "Spearphishing Attachment",
  "technique_id": "T1566.001",
  "procedure": "Uses malicious Office documents",
  "confidence": 90
}
```

### Perform Attribution
```javascript
POST /api/v1/threat-actors/attribute
{
  "incident_id": "INC-2024-001",
  "incident_name": "Data Breach Investigation",
  "technical_indicators": {
    "malware_hashes": ["abc123..."],
    "domains": ["malicious.com"]
  },
  "behavioral_indicators": {
    "ttps_observed": [{
      "technique_id": "T1566.001"
    }]
  }
}
```

### Create Campaign
```javascript
POST /api/v1/threat-actors/campaigns
{
  "name": "Operation Shadow",
  "threat_actor_id": "actor-id-123",
  "start_date": "2024-01-01",
  "status": "active",
  "objectives": ["Data exfiltration"],
  "targets": {
    "industries": ["finance"],
    "countries": ["USA"]
  }
}
```

## Testing

Run the test suite:
```bash
npm test
```

The module includes comprehensive tests covering:
- Actor CRUD operations
- TTP mapping and analysis
- Attribution analysis
- Campaign tracking
- Assessment operations
- Targeting analysis
- Relationship mapping
- Error handling

## Integration

The module is integrated into the main Black-Cross application and accessible at:
- Health Check: `GET /api/v1/threat-actors/health`
- All endpoints under: `/api/v1/threat-actors/*`

## Database

Uses MongoDB with Mongoose ODM for:
- Flexible schema design
- Complex queries and aggregations
- Relationship management
- Full-text search capabilities

## Future Enhancements

Potential areas for expansion:
- Machine learning for attribution confidence
- Real-time threat actor tracking
- Integration with external threat intelligence feeds
- Automated TTP extraction from reports
- Advanced graph analytics for relationship mapping
- Predictive analytics for actor behavior
- Integration with STIX/TAXII for threat sharing

## Contributing

Follow the project's contribution guidelines in CONTRIBUTING.md for:
- Code style and formatting
- Testing requirements
- Documentation standards
- Pull request process
