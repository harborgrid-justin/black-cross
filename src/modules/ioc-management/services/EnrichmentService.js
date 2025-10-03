/**
 * Automated IoC Enrichment Service
 * 
 * Sub-feature 7.4: Automated IoC Enrichment
 * Handles enrichment with geolocation, reputation, WHOIS, and other data
 */

const { iocRepository } = require('../repositories');

class EnrichmentService {
  /**
   * Enrich an IoC with additional context
   */
  async enrichIoC(iocId, sources = ['all']) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    const enrichmentData = {};

    // Perform enrichment based on sources
    if (sources.includes('all') || sources.includes('geolocation')) {
      enrichmentData.geolocation = await this.enrichGeolocation(ioc);
    }

    if (sources.includes('all') || sources.includes('reputation')) {
      enrichmentData.reputation = await this.enrichReputation(ioc);
    }

    if (sources.includes('all') || sources.includes('whois')) {
      enrichmentData.whois = await this.enrichWhois(ioc);
    }

    if (sources.includes('all') || sources.includes('dns')) {
      enrichmentData.dns = await this.enrichDNS(ioc);
    }

    if (sources.includes('all') || sources.includes('malware')) {
      enrichmentData.malware_families = await this.enrichMalware(ioc);
    }

    if (sources.includes('all') || sources.includes('threat_actor')) {
      enrichmentData.threat_actors = await this.enrichThreatActors(ioc);
    }

    // Update IoC with enrichment data
    ioc.enrichData(enrichmentData);
    await iocRepository.update(iocId, ioc);

    return {
      ioc_id: iocId,
      enrichment: enrichmentData,
      enriched_at: new Date()
    };
  }

  /**
   * Enrich with geolocation data
   */
  async enrichGeolocation(ioc) {
    // Simulate geolocation enrichment
    if (ioc.type !== 'ip') {
      return null;
    }

    // Mock data - in production, would call actual geolocation API
    return {
      country: 'US',
      country_code: 'US',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      isp: 'Example ISP',
      organization: 'Example Org',
      asn: 'AS12345',
      enriched_at: new Date()
    };
  }

  /**
   * Enrich with reputation data
   */
  async enrichReputation(ioc) {
    // Simulate reputation scoring
    // Mock data - in production, would call reputation services
    const baseScore = Math.floor(Math.random() * 40) + 10; // 10-50 range for malicious

    return {
      score: baseScore,
      category: baseScore < 30 ? 'malicious' : 'suspicious',
      detections: Math.floor(Math.random() * 100) + 1,
      vendors: {
        detected: Math.floor(Math.random() * 50) + 10,
        total: 70
      },
      last_analysis: new Date(),
      enriched_at: new Date()
    };
  }

  /**
   * Enrich with WHOIS data
   */
  async enrichWhois(ioc) {
    if (ioc.type !== 'domain' && ioc.type !== 'ip') {
      return null;
    }

    // Mock WHOIS data
    return {
      registrar: 'Example Registrar',
      registration_date: new Date('2020-01-01'),
      expiration_date: new Date('2025-01-01'),
      registrant: {
        name: 'Privacy Protected',
        organization: 'Privacy Service',
        country: 'US'
      },
      name_servers: ['ns1.example.com', 'ns2.example.com'],
      status: ['clientTransferProhibited'],
      enriched_at: new Date()
    };
  }

  /**
   * Enrich with DNS data
   */
  async enrichDNS(ioc) {
    if (ioc.type !== 'domain') {
      return null;
    }

    // Mock DNS data
    return {
      a_records: ['192.0.2.1', '192.0.2.2'],
      aaaa_records: [],
      mx_records: ['mail.example.com'],
      ns_records: ['ns1.example.com', 'ns2.example.com'],
      txt_records: ['v=spf1 include:example.com ~all'],
      cname_records: [],
      last_resolved: new Date(),
      enriched_at: new Date()
    };
  }

  /**
   * Enrich with malware family associations
   */
  async enrichMalware(ioc) {
    // Mock malware family data
    const malwareFamilies = ['Emotet', 'TrickBot', 'Ryuk', 'Dridex'];
    const randomFamily = malwareFamilies[Math.floor(Math.random() * malwareFamilies.length)];

    return [
      {
        family: randomFamily,
        confidence: Math.floor(Math.random() * 30) + 70,
        first_seen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        last_seen: new Date()
      }
    ];
  }

  /**
   * Enrich with threat actor attribution
   */
  async enrichThreatActors(ioc) {
    // Mock threat actor data
    const actors = ['APT28', 'APT29', 'Lazarus Group'];
    const randomActor = actors[Math.floor(Math.random() * actors.length)];

    return [
      {
        name: randomActor,
        confidence: Math.floor(Math.random() * 20) + 60,
        campaigns: ['Campaign X', 'Campaign Y'],
        first_attributed: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  /**
   * Get enrichment data for an IoC
   */
  async getEnrichment(iocId) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    return {
      ioc_id: iocId,
      value: ioc.value,
      type: ioc.type,
      enrichment: ioc.enrichment,
      last_updated: ioc.updated_at
    };
  }

  /**
   * Discover related IoCs
   */
  async discoverRelatedIoCs(iocId) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    const related = [];

    // Find IoCs with shared enrichment data
    const allIoCs = await iocRepository.find();

    for (const other of allIoCs) {
      if (other.id === ioc.id) continue;

      let relationshipScore = 0;

      // Check for shared malware families
      if (ioc.enrichment.malware_families && other.enrichment.malware_families) {
        const sharedFamilies = ioc.enrichment.malware_families.filter(f1 => 
          other.enrichment.malware_families.some(f2 => f2.family === f1.family)
        );
        relationshipScore += sharedFamilies.length * 20;
      }

      // Check for shared threat actors
      if (ioc.enrichment.threat_actors && other.enrichment.threat_actors) {
        const sharedActors = ioc.enrichment.threat_actors.filter(a1 => 
          other.enrichment.threat_actors.some(a2 => a2.name === a1.name)
        );
        relationshipScore += sharedActors.length * 15;
      }

      // Check for shared tags
      const sharedTags = ioc.tags.filter(t => other.tags.includes(t));
      relationshipScore += sharedTags.length * 5;

      // Check for temporal proximity
      const timeDiff = Math.abs(new Date(ioc.first_seen) - new Date(other.first_seen));
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      if (daysDiff < 7) {
        relationshipScore += 10;
      }

      if (relationshipScore > 20) {
        related.push({
          ioc_id: other.id,
          value: other.value,
          type: other.type,
          relationship_score: relationshipScore,
          relationship_type: this.determineRelationshipType(relationshipScore)
        });
      }
    }

    return {
      ioc_id: iocId,
      related_iocs: related.sort((a, b) => b.relationship_score - a.relationship_score)
    };
  }

  /**
   * Determine relationship type based on score
   */
  determineRelationshipType(score) {
    if (score >= 50) return 'strong';
    if (score >= 30) return 'moderate';
    return 'weak';
  }

  /**
   * Batch enrich multiple IoCs
   */
  async batchEnrich(iocIds, sources = ['all']) {
    const results = [];

    for (const iocId of iocIds) {
      try {
        const result = await this.enrichIoC(iocId, sources);
        results.push({
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          success: false,
          ioc_id: iocId,
          error: error.message
        });
      }
    }

    return {
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Get enrichment statistics
   */
  async getEnrichmentStats() {
    const allIoCs = await iocRepository.find();

    const stats = {
      total_iocs: allIoCs.length,
      enriched: 0,
      partially_enriched: 0,
      not_enriched: 0,
      enrichment_sources: {
        geolocation: 0,
        reputation: 0,
        whois: 0,
        dns: 0,
        malware: 0,
        threat_actor: 0
      }
    };

    allIoCs.forEach(ioc => {
      let enrichmentCount = 0;

      if (ioc.enrichment.geolocation) {
        enrichmentCount++;
        stats.enrichment_sources.geolocation++;
      }
      if (ioc.enrichment.reputation) {
        enrichmentCount++;
        stats.enrichment_sources.reputation++;
      }
      if (ioc.enrichment.whois) {
        enrichmentCount++;
        stats.enrichment_sources.whois++;
      }
      if (ioc.enrichment.dns) {
        enrichmentCount++;
        stats.enrichment_sources.dns++;
      }
      if (ioc.enrichment.malware_families && ioc.enrichment.malware_families.length > 0) {
        enrichmentCount++;
        stats.enrichment_sources.malware++;
      }
      if (ioc.enrichment.threat_actors && ioc.enrichment.threat_actors.length > 0) {
        enrichmentCount++;
        stats.enrichment_sources.threat_actor++;
      }

      if (enrichmentCount >= 3) {
        stats.enriched++;
      } else if (enrichmentCount > 0) {
        stats.partially_enriched++;
      } else {
        stats.not_enriched++;
      }
    });

    return stats;
  }
}

module.exports = new EnrichmentService();
