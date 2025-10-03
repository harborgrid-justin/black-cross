/**
 * Threat Actor Profiling Tests
 * 
 * Comprehensive test suite for threat actor profiling module
 */

const request = require('supertest');
const app = require('../../src/index');

describe('Threat Actor Profiling Module', () => {
  let actorId;
  let campaignId;
  let attributionId;

  // Clean up after tests
  afterAll(async () => {
    const { 
      threatActorRepository, 
      campaignRepository,
      attributionRepository
    } = require('../../src/modules/threat-actor-profiling/repositories');
    
    await threatActorRepository.clear();
    await campaignRepository.clear();
    await attributionRepository.clear();
  });

  describe('Module Health', () => {
    test('should return module health status', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/health')
        .expect(200);

      expect(response.body.module).toBe('threat-actor-profiling');
      expect(response.body.status).toBe('operational');
      expect(response.body.features).toContain('actor-database-tracking');
    });
  });

  describe('Threat Actor Operations', () => {
    test('should create a threat actor', async () => {
      const response = await request(app)
        .post('/api/v1/threat-actors')
        .send({
          name: 'Test APT Group',
          type: 'apt',
          sophistication: 'advanced',
          motivation: ['espionage', 'financial'],
          origin_country: 'Unknown',
          description: 'Advanced persistent threat group for testing',
          targets: {
            industries: ['technology', 'finance'],
            countries: ['USA', 'UK']
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test APT Group');
      actorId = response.body.data.id;
    });

    test('should get threat actor by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(actorId);
      expect(response.body.data.name).toBe('Test APT Group');
    });

    test('should list threat actors', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should update threat actor', async () => {
      const response = await request(app)
        .patch(`/api/v1/threat-actors/${actorId}`)
        .send({
          description: 'Updated description',
          status: 'active'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated description');
    });

    test('should add alias to threat actor', async () => {
      const response = await request(app)
        .post(`/api/v1/threat-actors/${actorId}/aliases`)
        .send({
          alias: 'APT-TEST-01'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.aliases).toContain('APT-TEST-01');
    });

    test('should get threat actor statistics', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
    });

    test('should calculate threat score', async () => {
      const response = await request(app)
        .post(`/api/v1/threat-actors/${actorId}/calculate-score`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('threat_score');
      expect(typeof response.body.data.threat_score).toBe('number');
    });
  });

  describe('TTP Mapping Operations', () => {
    test('should add TTP to threat actor', async () => {
      const response = await request(app)
        .post(`/api/v1/threat-actors/${actorId}/ttps`)
        .send({
          tactic: 'Initial Access',
          technique: 'Phishing',
          technique_id: 'T1566',
          procedure: 'Spear phishing emails with malicious attachments',
          frequency: 10,
          confidence: 85
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('TTP added successfully');
    });

    test('should get TTPs for threat actor', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/ttps`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should get TTP frequency analysis', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/ttps/frequency`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_ttps');
      expect(response.body.data).toHaveProperty('by_tactic');
    });

    test('should get defensive recommendations', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/ttps/recommendations`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('recommendations');
    });

    test('should get TTP evolution', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/ttps/evolution`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('timeline');
    });
  });

  describe('Campaign Operations', () => {
    test('should create a campaign', async () => {
      const response = await request(app)
        .post('/api/v1/threat-actors/campaigns')
        .send({
          name: 'Operation Test',
          threat_actor_id: actorId,
          start_date: new Date('2024-01-01'),
          status: 'active',
          objectives: ['Data exfiltration', 'Espionage'],
          targets: {
            industries: ['technology'],
            countries: ['USA']
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Operation Test');
      campaignId = response.body.data.id;
    });

    test('should get campaign by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/campaigns/${campaignId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(campaignId);
    });

    test('should list campaigns', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/campaigns')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should add target to campaign', async () => {
      const response = await request(app)
        .post(`/api/v1/threat-actors/campaigns/${campaignId}/targets`)
        .send({
          name: 'Test Corporation',
          type: 'enterprise',
          country: 'USA',
          compromised: false
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should add timeline event to campaign', async () => {
      const response = await request(app)
        .post(`/api/v1/threat-actors/campaigns/${campaignId}/timeline`)
        .send({
          event_type: 'initial_access',
          description: 'Initial compromise detected',
          indicators: ['malicious.domain.com']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should get campaign timeline', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/campaigns/${campaignId}/timeline`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('events');
    });

    test('should get campaign impact analysis', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/campaigns/${campaignId}/impact`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('campaign_name');
    });
  });

  describe('Attribution Operations', () => {
    test('should perform attribution analysis', async () => {
      const response = await request(app)
        .post('/api/v1/threat-actors/attribute')
        .send({
          incident_id: 'INC-TEST-001',
          incident_name: 'Test Incident',
          incident_date: new Date(),
          technical_indicators: {
            malware_hashes: ['abc123def456'],
            domains: ['malicious.example.com'],
            ips: ['192.0.2.1']
          },
          behavioral_indicators: {
            ttps_observed: [{
              tactic: 'Initial Access',
              technique: 'Phishing',
              technique_id: 'T1566'
            }]
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overall_confidence');
      attributionId = response.body.data.id;
    });

    test('should get attribution by incident ID', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/attribution/INC-TEST-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.incident_id).toBe('INC-TEST-001');
    });
  });

  describe('Assessment Operations', () => {
    test('should get capability assessment', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/assessment`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should update capability assessment', async () => {
      const response = await request(app)
        .put(`/api/v1/threat-actors/${actorId}/assessment`)
        .send({
          technical_capability: 75,
          operational_capability: 80,
          resource_level: 'high',
          funding_source: 'State-sponsored'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should get comprehensive assessment', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/assessment/comprehensive`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('technical_assessment');
      expect(response.body.data).toHaveProperty('operational_assessment');
      expect(response.body.data).toHaveProperty('motivation_assessment');
    });

    test('should get motivation assessment', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/motivation`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('primary_motivations');
    });
  });

  describe('Targeting Analysis Operations', () => {
    test('should get actor targeting profile', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/targets`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('targets');
    });

    test('should get geographic heat map', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/targeting-trends/geographic')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('heat_map');
    });

    test('should get industry sector analysis', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/targeting-trends/industry')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sector_analysis');
    });

    test('should get targeting trends', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/targeting-trends?period=90d')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('industry_trends');
    });

    test('should get defensive recommendations for industry', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/defensive-recommendations?industry=technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });

  describe('Relationship Operations', () => {
    test('should get relationships for actor', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/relationships`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('relationships');
    });

    test('should get infrastructure sharing analysis', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/relationships/infrastructure`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('infrastructure_sharing');
    });

    test('should get tool sharing analysis', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/relationships/tools`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tool_sharing');
      expect(response.body.data).toHaveProperty('malware_sharing');
    });

    test('should detect collaboration', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/relationships/collaboration`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('potential_collaborations');
    });

    test('should get relationship network', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/relationships/network?depth=1`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nodes');
      expect(response.body.data).toHaveProperty('edges');
    });

    test('should track nation-state affiliation', async () => {
      const response = await request(app)
        .get(`/api/v1/threat-actors/${actorId}/affiliation`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('confidence');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent actor', async () => {
      const response = await request(app)
        .get('/api/v1/threat-actors/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 for invalid actor data', async () => {
      const response = await request(app)
        .post('/api/v1/threat-actors')
        .send({
          name: 'Test Actor',
          type: 'invalid-type' // Invalid type
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 for invalid TTP data', async () => {
      const response = await request(app)
        .post(`/api/v1/threat-actors/${actorId}/ttps`)
        .send({
          // Missing required fields
          procedure: 'Some procedure'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
