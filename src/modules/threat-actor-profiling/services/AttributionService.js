/**
 * Attribution Service
 * Business logic for threat attribution and actor identification
 */

const { attributionRepository, threatActorRepository } = require('../repositories');

class AttributionService {
  /**
   * Perform attribution analysis
   */
  async performAttribution(incidentData) {
    // Validate required fields
    if (!incidentData.incident_id || !incidentData.incident_name) {
      throw new Error('Incident ID and name are required');
    }

    // Initialize attribution data
    const attribution = {
      incident_id: incidentData.incident_id,
      incident_name: incidentData.incident_name,
      incident_date: incidentData.incident_date || new Date(),
      attributed_actors: [],
      technical_indicators: incidentData.technical_indicators || {},
      behavioral_indicators: incidentData.behavioral_indicators || {},
      linguistic_indicators: incidentData.linguistic_indicators || {},
      infrastructure_analysis: incidentData.infrastructure_analysis || {},
      analysis_method: incidentData.analysis_method || 'automated',
      confidence_factors: {
        technical_indicators: 0,
        behavioral_patterns: 0,
        infrastructure_overlap: 0,
        timing_correlation: 0,
        linguistic_analysis: 0
      }
    };

    // Analyze technical indicators
    const technicalMatches = await this.analyzeTechnicalIndicators(
      attribution.technical_indicators
    );

    // Analyze behavioral patterns (TTPs)
    const behavioralMatches = await this.analyzeBehavioralPatterns(
      attribution.behavioral_indicators
    );

    // Analyze infrastructure overlap
    const infrastructureMatches = await this.analyzeInfrastructure(
      attribution.infrastructure_analysis
    );

    // Combine all matches and calculate confidence scores
    const allMatches = this.combineMatches([
      technicalMatches,
      behavioralMatches,
      infrastructureMatches
    ]);

    // Sort by confidence and take top matches
    attribution.attributed_actors = allMatches
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 5);

    // Calculate overall confidence
    attribution.overall_confidence = this.calculateOverallConfidence(
      attribution.attributed_actors,
      attribution.confidence_factors
    );

    // Save attribution
    return await attributionRepository.create(attribution);
  }

  /**
   * Analyze technical indicators (malware, hashes, IPs, domains)
   */
  async analyzeTechnicalIndicators(indicators) {
    const matches = [];

    // Search by malware hashes
    if (indicators.malware_hashes && indicators.malware_hashes.length > 0) {
      for (const hash of indicators.malware_hashes) {
        const actors = await this.findActorsByMalwareHash(hash);
        actors.forEach(actor => {
          matches.push({
            actor_id: actor.id,
            actor_name: actor.name,
            match_type: 'malware_hash',
            indicator: hash,
            weight: 40
          });
        });
      }
    }

    // Search by infrastructure (IPs, domains)
    if (indicators.ips && indicators.ips.length > 0) {
      for (const ip of indicators.ips) {
        const actors = await threatActorRepository.searchByInfrastructure(ip);
        actors.forEach(actor => {
          matches.push({
            actor_id: actor.id,
            actor_name: actor.name,
            match_type: 'ip_address',
            indicator: ip,
            weight: 30
          });
        });
      }
    }

    if (indicators.domains && indicators.domains.length > 0) {
      for (const domain of indicators.domains) {
        const actors = await threatActorRepository.searchByInfrastructure(domain);
        actors.forEach(actor => {
          matches.push({
            actor_id: actor.id,
            actor_name: actor.name,
            match_type: 'domain',
            indicator: domain,
            weight: 35
          });
        });
      }
    }

    return matches;
  }

  /**
   * Analyze behavioral patterns (TTPs)
   */
  async analyzeBehavioralPatterns(indicators) {
    const matches = [];

    if (!indicators.ttps_observed || indicators.ttps_observed.length === 0) {
      return matches;
    }

    // Get all actors
    const allActors = await threatActorRepository.list({ limit: 1000 });

    // Match TTPs
    allActors.actors.forEach(actor => {
      if (!actor.ttps || actor.ttps.length === 0) return;

      let matchCount = 0;
      const matchedTTPs = [];

      indicators.ttps_observed.forEach(observedTTP => {
        const match = actor.ttps.find(actorTTP => 
          actorTTP.technique_id === observedTTP.technique_id ||
          (actorTTP.tactic === observedTTP.tactic && 
           actorTTP.technique === observedTTP.technique)
        );

        if (match) {
          matchCount++;
          matchedTTPs.push(observedTTP.technique_id);
        }
      });

      if (matchCount > 0) {
        const weight = Math.min(50, (matchCount / indicators.ttps_observed.length) * 50);
        matches.push({
          actor_id: actor.id,
          actor_name: actor.name,
          match_type: 'ttp_pattern',
          indicator: matchedTTPs.join(', '),
          weight
        });
      }
    });

    return matches;
  }

  /**
   * Analyze infrastructure overlap
   */
  async analyzeInfrastructure(analysis) {
    const matches = [];

    if (!analysis.shared_infrastructure || analysis.shared_infrastructure.length === 0) {
      return matches;
    }

    analysis.shared_infrastructure.forEach(infra => {
      if (infra.shared_with_actors && infra.shared_with_actors.length > 0) {
        infra.shared_with_actors.forEach(actorId => {
          matches.push({
            actor_id: actorId,
            actor_name: actorId, // Will be resolved later
            match_type: 'shared_infrastructure',
            indicator: infra.resource,
            weight: 25
          });
        });
      }
    });

    return matches;
  }

  /**
   * Find actors by malware hash
   */
  async findActorsByMalwareHash(hash) {
    const allActors = await threatActorRepository.list({ limit: 1000 });
    return allActors.actors.filter(actor => 
      actor.associated_malware && 
      actor.associated_malware.some(malware => malware.hash === hash)
    );
  }

  /**
   * Combine matches from different sources
   */
  combineMatches(matchArrays) {
    const combined = {};

    matchArrays.forEach(matches => {
      matches.forEach(match => {
        if (!combined[match.actor_id]) {
          combined[match.actor_id] = {
            actor_id: match.actor_id,
            actor_name: match.actor_name,
            confidence_score: 0,
            supporting_evidence: [],
            reasoning: ''
          };
        }

        combined[match.actor_id].confidence_score += match.weight;
        combined[match.actor_id].supporting_evidence.push({
          type: match.match_type,
          indicator: match.indicator,
          match_type: match.match_type,
          weight: match.weight
        });
      });
    });

    // Cap confidence scores at 100 and generate reasoning
    return Object.values(combined).map(actor => {
      actor.confidence_score = Math.min(100, actor.confidence_score);
      actor.reasoning = this.generateReasoning(actor.supporting_evidence);
      return actor;
    });
  }

  /**
   * Generate human-readable reasoning
   */
  generateReasoning(evidence) {
    const counts = {};
    evidence.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });

    const parts = [];
    if (counts.malware_hash) {
      parts.push(`${counts.malware_hash} matching malware sample(s)`);
    }
    if (counts.ttp_pattern) {
      parts.push(`matching TTP patterns`);
    }
    if (counts.ip_address) {
      parts.push(`${counts.ip_address} infrastructure IP(s)`);
    }
    if (counts.domain) {
      parts.push(`${counts.domain} infrastructure domain(s)`);
    }
    if (counts.shared_infrastructure) {
      parts.push(`shared infrastructure`);
    }

    return parts.length > 0 
      ? `Attributed based on: ${parts.join(', ')}`
      : 'Low confidence attribution';
  }

  /**
   * Calculate overall confidence
   */
  calculateOverallConfidence(attributedActors, confidenceFactors) {
    if (attributedActors.length === 0) return 0;

    // Take the highest confidence actor
    const topConfidence = attributedActors[0].confidence_score;

    // Adjust based on number of independent indicators
    const evidenceTypes = new Set();
    attributedActors[0].supporting_evidence.forEach(e => {
      evidenceTypes.add(e.type);
    });

    // More diverse evidence increases confidence
    const diversityBonus = evidenceTypes.size * 5;

    return Math.min(100, topConfidence + diversityBonus);
  }

  /**
   * Get attribution by incident ID
   */
  async getAttribution(incidentId) {
    const attribution = await attributionRepository.findByIncidentId(incidentId);
    if (!attribution) {
      throw new Error('Attribution not found for this incident');
    }
    return attribution;
  }

  /**
   * Get attributions by actor
   */
  async getAttributionsByActor(actorId) {
    return await attributionRepository.findByActorId(actorId);
  }

  /**
   * Update verification status
   */
  async updateVerificationStatus(attributionId, status, verifiedBy) {
    const validStatuses = ['unverified', 'partially-verified', 'verified', 'disputed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid verification status');
    }

    return await attributionRepository.updateVerificationStatus(
      attributionId,
      status,
      verifiedBy
    );
  }

  /**
   * Get attribution statistics
   */
  async getStatistics() {
    return await attributionRepository.getStatistics();
  }
}

module.exports = new AttributionService();
