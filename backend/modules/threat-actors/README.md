# Threat Actor Profiling Module

## Overview
Complete Threat Actor Profiling with all 7 sub-features.

## Implementation Status: ✅ 100% Complete

### Sub-Features
1. ✅ Threat actor database and tracking
2. ✅ TTPs (Tactics, Techniques, Procedures) mapping
3. ✅ Attribution analysis tools
4. ✅ Campaign tracking and linking
5. ✅ Actor motivation and capability assessment
6. ✅ Geographic and sector targeting analysis
7. ✅ Threat actor relationship mapping

## Data Models
- **ThreatActor**: Comprehensive actor profiling with TTPs, campaigns, relationships

## Services
- **actorService**: Actor management, TTP tracking, attribution analysis

## API Endpoints
- `POST /api/v1/threat-actors` - Create actor profile
- `GET /api/v1/threat-actors` - List actors
- `GET /api/v1/threat-actors/:id` - Get actor details
- `PUT /api/v1/threat-actors/:id` - Update actor
- `DELETE /api/v1/threat-actors/:id` - Delete actor

**Status**: ✅ Production Ready
