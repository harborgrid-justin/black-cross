/**
 * Threat Enrichment Service
 * Handles threat intelligence enrichment
 */

const Threat = require('../models/Threat');
const logger = require('../utils/logger');

class EnrichmentService {
  /**
   * Enrich threat with additional data
   * @param {string} threatId - Threat ID
   * @param {Array} sources - Enrichment sources
   * @returns {Promise<Object>} Enriched threat
   */
  async enrichThreat(threatId, sources = ['all']) {
    try {
      logger.info('Enriching threat', { threatId, sources });

      const threat = await Threat.findOne({ id: threatId });
      if (!threat) {
        throw new Error('Threat not found');
      }

      const enrichmentData = threat.enrichment_data || {};

      // Perform enrichment based on sources
      if (sources.includes('all') || sources.includes('geolocation')) {
        enrichmentData.geolocation = await this.enrichGeolocation(threat);
      }

      if (sources.includes('all') || sources.includes('reputation')) {
        enrichmentData.reputation = await this.enrichReputation(threat);
      }

      if (sources.includes('all') || sources.includes('osint')) {
        enrichmentData.osint = await this.enrichOSINT(threat);
      }

      if (sources.includes('all') || sources.includes('dns')) {
        enrichmentData.dns = await this.enrichDNS(threat);
      }

      // Update threat with enrichment data
      threat.enrichment_data = enrichmentData;
      await threat.save();

      logger.info('Threat enriched successfully', { threatId });
      return threat;
    } catch (error) {
      logger.error('Error enriching threat', { error: error.message });
      throw error;
    }
  }

  /**
   * Enrich with geolocation data
   * @param {Object} threat - Threat object
   * @returns {Promise<Object>} Geolocation data
   */
  async enrichGeolocation(threat) {
    try {
      // Extract IP addresses from indicators
      const ipIndicators = threat.indicators?.filter(i => i.type === 'ip') || [];
      
      if (ipIndicators.length === 0) {
        return null;
      }

      // Mock geolocation enrichment (in production, use real geolocation API)
      const geoData = {
        locations: ipIndicators.map(ip => ({
          ip: ip.value,
          country: this.mockGetCountry(ip.value),
          city: 'Unknown',
          coordinates: { lat: 0, lng: 0 }
        })),
        primary_location: {
          country: this.mockGetCountry(ipIndicators[0].value),
          city: 'Unknown',
          coordinates: { lat: 0, lng: 0 }
        }
      };

      return geoData;
    } catch (error) {
      logger.error('Error enriching geolocation', { error: error.message });
      return null;
    }
  }

  /**
   * Enrich with reputation data
   * @param {Object} threat - Threat object
   * @returns {Promise<Object>} Reputation data
   */
  async enrichReputation(threat) {
    try {
      // Mock reputation scoring (in production, use real reputation APIs)
      const indicators = threat.indicators || [];
      const scores = [];

      for (const indicator of indicators) {
        const score = this.mockCalculateReputation(indicator);
        scores.push({
          indicator: indicator.value,
          type: indicator.type,
          score: score,
          category: score < 30 ? 'malicious' : score < 70 ? 'suspicious' : 'clean'
        });
      }

      const avgScore = scores.length > 0 
        ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length 
        : 50;

      return {
        overall_score: Math.round(avgScore),
        indicators: scores,
        vendors: [
          { name: 'VirusTotal', score: Math.round(avgScore * 0.95) },
          { name: 'AlienVault', score: Math.round(avgScore * 1.05) }
        ]
      };
    } catch (error) {
      logger.error('Error enriching reputation', { error: error.message });
      return null;
    }
  }

  /**
   * Enrich with OSINT data
   * @param {Object} threat - Threat object
   * @returns {Promise<Object>} OSINT data
   */
  async enrichOSINT(threat) {
    try {
      // Mock OSINT enrichment (in production, use real OSINT sources)
      const osintData = {
        mentions: Math.floor(Math.random() * 100),
        first_seen_online: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        sources: ['SecurityBlog', 'ThreatPost', 'DarkReading'],
        related_campaigns: [],
        industry_targeting: this.mockIndustryTargeting(threat)
      };

      return osintData;
    } catch (error) {
      logger.error('Error enriching OSINT', { error: error.message });
      return null;
    }
  }

  /**
   * Enrich with DNS data
   * @param {Object} threat - Threat object
   * @returns {Promise<Object>} DNS data
   */
  async enrichDNS(threat) {
    try {
      // Extract domain indicators
      const domainIndicators = threat.indicators?.filter(
        i => i.type === 'domain' || i.type === 'url'
      ) || [];

      if (domainIndicators.length === 0) {
        return null;
      }

      // Mock DNS enrichment (in production, use real passive DNS APIs)
      const dnsData = {
        records: domainIndicators.map(d => ({
          domain: d.value,
          a_records: [`192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
          mx_records: [],
          ns_records: [],
          first_seen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          last_seen: new Date()
        })),
        historical_ips: [],
        related_domains: []
      };

      return dnsData;
    } catch (error) {
      logger.error('Error enriching DNS', { error: error.message });
      return null;
    }
  }

  /**
   * Batch enrich multiple threats
   * @param {Array} threatIds - Array of threat IDs
   * @param {Array} sources - Enrichment sources
   * @returns {Promise<Object>} Enrichment results
   */
  async batchEnrich(threatIds, sources = ['all']) {
    try {
      logger.info('Starting batch enrichment', { count: threatIds.length });

      const results = {
        enriched: [],
        failed: [],
        total: threatIds.length
      };

      for (const threatId of threatIds) {
        try {
          await this.enrichThreat(threatId, sources);
          results.enriched.push(threatId);
        } catch (error) {
          results.failed.push({ threatId, error: error.message });
        }
      }

      logger.info('Batch enrichment completed', results);
      return results;
    } catch (error) {
      logger.error('Error in batch enrichment', { error: error.message });
      throw error;
    }
  }

  /**
   * Get enriched threat data
   * @param {string} threatId - Threat ID
   * @returns {Promise<Object>} Enriched threat
   */
  async getEnrichedThreat(threatId) {
    try {
      const threat = await Threat.findOne({ id: threatId });
      if (!threat) {
        throw new Error('Threat not found');
      }

      return {
        id: threat.id,
        name: threat.name,
        type: threat.type,
        severity: threat.severity,
        enrichment_data: threat.enrichment_data,
        enriched_at: threat.updated_at
      };
    } catch (error) {
      logger.error('Error getting enriched threat', { error: error.message });
      throw error;
    }
  }

  // Mock helper methods (replace with real implementations in production)
  mockGetCountry(ip) {
    const countries = ['US', 'CN', 'RU', 'DE', 'GB', 'FR', 'JP', 'KR'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  mockCalculateReputation(indicator) {
    // Random reputation score (0-100, lower is worse)
    return Math.floor(Math.random() * 100);
  }

  mockIndustryTargeting(threat) {
    const industries = ['Financial', 'Healthcare', 'Government', 'Technology', 'Retail'];
    return industries.slice(0, Math.floor(Math.random() * 3) + 1);
  }
}

module.exports = new EnrichmentService();
