/**
 * Threat Context Analysis Service
 * Provides comprehensive context for threats
 */

import Threat from '../models/Threat';
import ThreatCorrelation from '../models/ThreatCorrelation';
import logger from '../utils/logger';

class ContextService {
  /**
   * Get comprehensive context for a threat
   * @param {string} threatId - Threat ID
   * @returns {Promise<Object>} Threat context
   */
  async getThreatContext(threatId: any) {
    try {
      logger.info('Getting threat context', { threatId });

      const threat = await Threat.findOne({ id: threatId });
      if (!threat) {
        throw new Error('Threat not found');
      }

      const context = {
        threat_id: threat.id,
        basic_info: this.getBasicInfo(threat),
        attack_chain: await this.reconstructAttackChain(threat),
        industry_targeting: this.analyzeIndustryTargeting(threat),
        geographic_distribution: this.analyzeGeographicDistribution(threat),
        temporal_patterns: await this.analyzeTemporalPatterns(threat),
        impact_assessment: this.assessImpact(threat),
        confidence_analysis: this.analyzeConfidence(threat),
        related_threats: await this.getRelatedThreatsContext(threatId),
        recommendations: this.generateRecommendations(threat),
      };

      logger.info('Threat context generated', { threatId });
      return context;
    } catch (error) {
      logger.error('Error getting threat context', { error: error.message });
      throw error;
    }
  }

  /**
   * Get basic threat information
   * @param {Object} threat - Threat object
   * @returns {Object} Basic info
   */
  getBasicInfo(threat: any) {
    return {
      name: threat.name,
      type: threat.type,
      severity: threat.severity,
      confidence: threat.confidence,
      status: threat.status,
      first_seen: threat.first_seen,
      last_seen: threat.last_seen,
      age_days: Math.floor((Date.now() - threat.first_seen) / (1000 * 60 * 60 * 24)),
      indicators_count: threat.indicators?.length || 0,
      categories: threat.categories,
      tags: threat.tags,
    };
  }

  /**
   * Reconstruct attack chain from threat data
   * @param {Object} threat - Threat object
   * @returns {Object} Attack chain
   */
  async reconstructAttackChain(threat: any) {
    try {
      const chain = {
        kill_chain_phases: [],
        mitre_tactics: threat.mitre_attack?.tactics || [],
        mitre_techniques: threat.mitre_attack?.techniques || [],
        stages: [],
      };

      // Map MITRE tactics to kill chain phases
      const tacticToPhase = {
        reconnaissance: 'Reconnaissance',
        'resource-development': 'Weaponization',
        'initial-access': 'Delivery',
        execution: 'Exploitation',
        persistence: 'Installation',
        'privilege-escalation': 'Installation',
        'defense-evasion': 'Command & Control',
        'credential-access': 'Actions on Objectives',
        discovery: 'Actions on Objectives',
        'lateral-movement': 'Actions on Objectives',
        collection: 'Actions on Objectives',
        'command-and-control': 'Command & Control',
        exfiltration: 'Actions on Objectives',
        impact: 'Actions on Objectives',
      };

      chain.kill_chain_phases = [...new Set(
        (threat.mitre_attack?.tactics || []).map((t) => tacticToPhase[t.toLowerCase()] || 'Unknown'),
      )];

      // Reconstruct stages based on indicators and behavior
      if (threat.indicators?.some((i) => i.type === 'email')) {
        chain.stages.push({
          phase: 'Initial Access',
          method: 'Phishing/Email',
          indicators: threat.indicators.filter((i) => i.type === 'email'),
        });
      }

      if (threat.indicators?.some((i) => i.type === 'url' || i.type === 'domain')) {
        chain.stages.push({
          phase: 'Command & Control',
          method: 'Network Communication',
          indicators: threat.indicators.filter((i) => i.type === 'url' || i.type === 'domain' || i.type === 'ip'),
        });
      }

      if (threat.indicators?.some((i) => i.type === 'hash' || i.type === 'filename')) {
        chain.stages.push({
          phase: 'Execution',
          method: 'Malware Execution',
          indicators: threat.indicators.filter((i) => i.type === 'hash' || i.type === 'filename'),
        });
      }

      return chain;
    } catch (error) {
      logger.error('Error reconstructing attack chain', { error: error.message });
      return {};
    }
  }

  /**
   * Analyze industry targeting
   * @param {Object} threat - Threat object
   * @returns {Object} Industry analysis
   */
  analyzeIndustryTargeting(threat: any) {
    // Use enrichment data if available
    if (threat.enrichment_data?.osint?.industry_targeting) {
      return {
        targeted_industries: threat.enrichment_data.osint.industry_targeting,
        source: 'osint',
        confidence: 'medium',
      };
    }

    // Infer from threat type and description
    const industries = [];
    const desc = threat.description.toLowerCase();

    if (desc.includes('financial') || desc.includes('bank') || desc.includes('payment')) {
      industries.push('Financial Services');
    }
    if (desc.includes('healthcare') || desc.includes('hospital') || desc.includes('medical')) {
      industries.push('Healthcare');
    }
    if (desc.includes('government') || desc.includes('public sector')) {
      industries.push('Government');
    }
    if (desc.includes('retail') || desc.includes('ecommerce')) {
      industries.push('Retail');
    }
    if (desc.includes('technology') || desc.includes('software')) {
      industries.push('Technology');
    }

    return {
      targeted_industries: industries.length > 0 ? industries : ['Unknown'],
      source: 'inferred',
      confidence: 'low',
    };
  }

  /**
   * Analyze geographic distribution
   * @param {Object} threat - Threat object
   * @returns {Object} Geographic analysis
   */
  analyzeGeographicDistribution(threat: any) {
    const distribution = {
      countries: [],
      regions: [],
      source: 'geolocation',
    };

    // Use enrichment data if available
    if (threat.enrichment_data?.geolocation) {
      const geo = threat.enrichment_data.geolocation;

      if (geo.locations) {
        distribution.countries = [...new Set(geo.locations.map((l) => l.country))];
      } else if (geo.country) {
        distribution.countries = [geo.country];
      }

      // Map countries to regions
      distribution.regions = this.mapCountriesToRegions(distribution.countries);
    }

    return distribution;
  }

  /**
   * Analyze temporal patterns
   * @param {Object} threat - Threat object
   * @returns {Promise<Object>} Temporal analysis
   */
  async analyzeTemporalPatterns(threat: any) {
    try {
      const analysis: any = {
        first_seen: threat.first_seen,
        last_seen: threat.last_seen,
        active_period_days: Math.floor((threat.last_seen - threat.first_seen) / (1000 * 60 * 60 * 24)),
        pattern: 'unknown',
      };

      // Determine pattern
      if (analysis.active_period_days < 1) {
        analysis.pattern = 'single-day';
      } else if (analysis.active_period_days < 7) {
        analysis.pattern = 'short-term';
      } else if (analysis.active_period_days < 30) {
        analysis.pattern = 'campaign';
      } else {
        analysis.pattern = 'persistent';
      }

      // Find similar temporal patterns
      const similarThreats = await Threat.countDocuments({
        type: threat.type,
        first_seen: {
          $gte: new Date(threat.first_seen.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lte: new Date(threat.first_seen.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      analysis.concurrent_threats = similarThreats - 1;

      return analysis;
    } catch (error) {
      logger.error('Error analyzing temporal patterns', { error: error.message });
      return {};
    }
  }

  /**
   * Assess threat impact
   * @param {Object} threat - Threat object
   * @returns {Object} Impact assessment
   */
  assessImpact(threat: any) {
    const impact = {
      severity_level: threat.severity,
      potential_impact: [],
      affected_assets: 'unknown',
      business_impact: 'unknown',
    };

    // Determine potential impacts based on threat type
    switch (threat.type) {
      case 'ransomware':
        impact.potential_impact = ['Data Encryption', 'Business Disruption', 'Financial Loss'];
        impact.business_impact = 'critical';
        break;
      case 'malware':
        impact.potential_impact = ['System Compromise', 'Data Theft', 'Resource Consumption'];
        impact.business_impact = 'high';
        break;
      case 'phishing':
        impact.potential_impact = ['Credential Theft', 'Initial Access', 'Social Engineering'];
        impact.business_impact = 'medium';
        break;
      case 'ddos':
        impact.potential_impact = ['Service Disruption', 'Availability Loss'];
        impact.business_impact = 'high';
        break;
      default:
        impact.potential_impact = ['Unknown'];
        break;
    }

    return impact;
  }

  /**
   * Analyze confidence scoring
   * @param {Object} threat - Threat object
   * @returns {Object} Confidence analysis
   */
  analyzeConfidence(threat: any) {
    const factors = [];

    // Source reliability
    if (threat.source?.reliability) {
      factors.push({
        factor: 'Source Reliability',
        score: threat.source.reliability,
        weight: 0.3,
      });
    }

    // Indicator count
    const indicatorCount = threat.indicators?.length || 0;
    const indicatorScore = Math.min(100, indicatorCount * 10);
    factors.push({
      factor: 'Indicator Count',
      score: indicatorScore,
      weight: 0.2,
    });

    // Enrichment completeness
    const enrichmentScore = threat.enrichment_data ? 80 : 30;
    factors.push({
      factor: 'Enrichment Completeness',
      score: enrichmentScore,
      weight: 0.2,
    });

    // Age factor (newer threats have higher uncertainty)
    const ageDays = Math.floor((Date.now() - threat.first_seen) / (1000 * 60 * 60 * 24));
    const ageScore = Math.min(100, ageDays * 5);
    factors.push({
      factor: 'Data Maturity',
      score: ageScore,
      weight: 0.3,
    });

    let recommendation = 'low';
    if (threat.confidence >= 70) {
      recommendation = 'high';
    } else if (threat.confidence >= 50) {
      recommendation = 'medium';
    }

    return {
      overall_confidence: threat.confidence,
      factors,
      recommendation,
    };
  }

  /**
   * Get related threats context
   * @param {string} threatId - Threat ID
   * @returns {Promise<Array>} Related threats
   */
  async getRelatedThreatsContext(threatId: any) {
    try {
      const correlations = await ThreatCorrelation.find({
        $or: [
          { threat_id_1: threatId },
          { threat_id_2: threatId },
        ],
        status: { $ne: 'rejected' },
      }).limit(10).sort({ similarity_score: -1 });

      return correlations.map((c) => ({
        threat_id: c.threat_id_1 === threatId ? c.threat_id_2 : c.threat_id_1,
        correlation_type: c.correlation_type,
        similarity_score: c.similarity_score,
        relationship: this.determineRelationship(c.correlation_type),
      }));
    } catch (error) {
      logger.error('Error getting related threats context', { error: error.message });
      return [];
    }
  }

  /**
   * Generate recommendations
   * @param {Object} threat - Threat object
   * @returns {Array} Recommendations
   */
  generateRecommendations(threat: any) {
    const recommendations = [];

    // Severity-based recommendations
    if (threat.severity === 'critical' || threat.severity === 'high') {
      recommendations.push({
        priority: 'high',
        action: 'Immediate Investigation',
        description: 'This threat requires immediate security team attention',
      });
    }

    // Type-specific recommendations
    if (threat.type === 'ransomware') {
      recommendations.push({
        priority: 'high',
        action: 'Backup Verification',
        description: 'Verify all backups are current and offline copies exist',
      });
    }

    if (threat.type === 'phishing') {
      recommendations.push({
        priority: 'medium',
        action: 'User Awareness',
        description: 'Distribute phishing awareness notification to users',
      });
    }

    // Indicator-based recommendations
    if (threat.indicators?.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'IOC Blocking',
        description: 'Block identified IOCs at network and endpoint level',
      });
    }

    return recommendations;
  }

  /**
   * Map countries to regions
   * @param {Array} countries - Country codes
   * @returns {Array} Regions
   */
  mapCountriesToRegions(countries: any) {
    const regionMap = {
      US: 'North America',
      CA: 'North America',
      GB: 'Europe',
      DE: 'Europe',
      FR: 'Europe',
      CN: 'Asia Pacific',
      JP: 'Asia Pacific',
      KR: 'Asia Pacific',
      RU: 'Eastern Europe',
      IN: 'Asia Pacific',
    };

    return [...new Set(countries.map((c) => regionMap[c] || 'Other'))];
  }

  /**
   * Determine relationship type
   * @param {string} correlationType - Correlation type
   * @returns {string} Relationship description
   */
  determineRelationship(correlationType: any) {
    const relationships = {
      ioc_overlap: 'Shares indicators',
      temporal: 'Occurred at similar time',
      infrastructure: 'Uses shared infrastructure',
      campaign: 'Part of same campaign',
      behavioral: 'Similar behavior pattern',
    };

    return relationships[correlationType] || 'Related';
  }

  /**
   * Analyze multiple threats for patterns
   * @param {Array} threatIds - Array of threat IDs
   * @returns {Promise<Object>} Pattern analysis
   */
  async analyzePatterns(threatIds: any) {
    try {
      logger.info('Analyzing threat patterns', { count: threatIds.length });

      const threats = await Threat.find({ id: { $in: threatIds } });

      const analysis: any = {
        total_threats: threats.length,
        types: this.groupBy(threats, 'type'),
        severities: this.groupBy(threats, 'severity'),
        common_tactics: this.findCommonTactics(threats),
        common_targets: this.findCommonTargets(threats),
        temporal_clustering: this.analyzeTemporalClustering(threats),
        geographic_clustering: this.analyzeGeographicClustering(threats),
      };

      return analysis;
    } catch (error) {
      logger.error('Error analyzing patterns', { error: error.message });
      throw error;
    }
  }

  // Helper methods
  groupBy(array: any, key: any) {
    return array.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  findCommonTactics(threats: any) {
    const allTactics = threats.flatMap((t) => t.mitre_attack?.tactics || []);
    return this.groupBy(allTactics.map((t) => ({ mitre_attack: { tactics: t } })), 'mitre_attack.tactics');
  }

  findCommonTargets(threats: any) {
    const allIndustries = threats.flatMap((t) => t.enrichment_data?.osint?.industry_targeting || []);
    return [...new Set(allIndustries)];
  }

  analyzeTemporalClustering(threats: any) {
    const timestamps = threats.map((t) => t.first_seen.getTime()).sort();
    // Simple clustering: group threats within 7 days
    const clusters = [];
    let currentCluster = [timestamps[0]];

    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i - 1] <= 7 * 24 * 60 * 60 * 1000) {
        currentCluster.push(timestamps[i]);
      } else {
        clusters.push(currentCluster.length);
        currentCluster = [timestamps[i]];
      }
    }
    clusters.push(currentCluster.length);

    return {
      clusters: clusters.length,
      largest_cluster: Math.max(...clusters),
    };
  }

  analyzeGeographicClustering(threats: any) {
    const countries = threats.flatMap((t) => t.enrichment_data?.geolocation?.locations?.map((l) => l.country) || []);
    return this.groupBy(countries.map((c) => ({ country: c })), 'country');
  }
}

export default new ContextService();

