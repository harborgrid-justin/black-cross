/**
 * TTP Mapping Service
 * Business logic for MITRE ATT&CK and TTP mapping
 */

const { threatActorRepository } = require('../repositories');

class TTPMappingService {
  /**
   * Add TTP to threat actor
   */
  async addTTP(actorId, ttpData) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    // Validate TTP data
    if (!ttpData.tactic || !ttpData.technique) {
      throw new Error('Tactic and technique are required');
    }

    const ttp = {
      tactic: ttpData.tactic,
      technique: ttpData.technique,
      technique_id: ttpData.technique_id || null,
      procedure: ttpData.procedure || '',
      frequency: ttpData.frequency || 1,
      confidence: ttpData.confidence || 50,
      first_observed: ttpData.first_observed || new Date(),
      last_observed: ttpData.last_observed || new Date()
    };

    return await threatActorRepository.addTTP(actorId, ttp);
  }

  /**
   * Get TTPs for threat actor
   */
  async getTTPs(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    return actor.ttps || [];
  }

  /**
   * Update TTP frequency
   */
  async updateTTPFrequency(actorId, techniqueId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const ttps = actor.ttps || [];
    const ttpIndex = ttps.findIndex(t => t.technique_id === techniqueId);

    if (ttpIndex === -1) {
      throw new Error('TTP not found for this actor');
    }

    ttps[ttpIndex].frequency = (ttps[ttpIndex].frequency || 0) + 1;
    ttps[ttpIndex].last_observed = new Date();

    return await threatActorRepository.update(actorId, { ttps });
  }

  /**
   * Analyze TTP overlap between actors
   */
  async analyzeTTPOverlap(actorId1, actorId2) {
    const actor1 = await threatActorRepository.findById(actorId1);
    const actor2 = await threatActorRepository.findById(actorId2);

    if (!actor1 || !actor2) {
      throw new Error('One or both actors not found');
    }

    const ttps1 = actor1.ttps || [];
    const ttps2 = actor2.ttps || [];

    // Find overlapping TTPs
    const overlap = ttps1.filter(ttp1 => 
      ttps2.some(ttp2 => ttp2.technique_id === ttp1.technique_id)
    );

    // Calculate overlap percentage
    const totalUniqueTTPs = new Set([
      ...ttps1.map(t => t.technique_id),
      ...ttps2.map(t => t.technique_id)
    ]).size;

    const overlapPercentage = totalUniqueTTPs > 0 
      ? (overlap.length / totalUniqueTTPs) * 100 
      : 0;

    return {
      actor1: {
        id: actor1.id,
        name: actor1.name,
        ttp_count: ttps1.length
      },
      actor2: {
        id: actor2.id,
        name: actor2.name,
        ttp_count: ttps2.length
      },
      overlapping_ttps: overlap,
      overlap_count: overlap.length,
      overlap_percentage: overlapPercentage.toFixed(2),
      total_unique_ttps: totalUniqueTTPs
    };
  }

  /**
   * Get TTP frequency analysis
   */
  async getTTPFrequencyAnalysis(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const ttps = actor.ttps || [];

    // Sort by frequency
    const sorted = [...ttps].sort((a, b) => (b.frequency || 0) - (a.frequency || 0));

    // Group by tactic
    const byTactic = ttps.reduce((acc, ttp) => {
      if (!acc[ttp.tactic]) {
        acc[ttp.tactic] = [];
      }
      acc[ttp.tactic].push(ttp);
      return acc;
    }, {});

    return {
      total_ttps: ttps.length,
      most_frequent: sorted.slice(0, 10),
      by_tactic: byTactic,
      tactics_used: Object.keys(byTactic)
    };
  }

  /**
   * Get defensive recommendations based on TTPs
   */
  async getDefensiveRecommendations(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const ttps = actor.ttps || [];
    const tactics = [...new Set(ttps.map(t => t.tactic))];

    // Generate recommendations based on MITRE ATT&CK tactics
    const recommendations = {};

    // Mapping of tactics to defensive measures
    const tacticDefenses = {
      'Initial Access': [
        'Implement email filtering and anti-phishing solutions',
        'Deploy endpoint protection platforms',
        'Enforce multi-factor authentication',
        'Regular security awareness training'
      ],
      'Execution': [
        'Application whitelisting',
        'Script execution policies',
        'Disable unnecessary macro execution',
        'Regular patch management'
      ],
      'Persistence': [
        'Monitor registry and startup folder changes',
        'Implement privileged access management',
        'Regular system baseline checks',
        'Monitor scheduled task creation'
      ],
      'Privilege Escalation': [
        'Principle of least privilege',
        'Regular vulnerability patching',
        'Monitor privileged account usage',
        'Implement behavioral analytics'
      ],
      'Defense Evasion': [
        'Deploy EDR solutions',
        'File integrity monitoring',
        'Regular log review and SIEM alerts',
        'Network segmentation'
      ],
      'Credential Access': [
        'Enforce strong password policies',
        'Implement credential guard',
        'Monitor for credential dumping tools',
        'Use hardware security tokens'
      ],
      'Discovery': [
        'Network segmentation',
        'Limit network reconnaissance capabilities',
        'Monitor unusual network scanning',
        'Deploy deception technology'
      ],
      'Lateral Movement': [
        'Network segmentation',
        'Disable unnecessary protocols',
        'Monitor lateral movement indicators',
        'Implement zero trust architecture'
      ],
      'Collection': [
        'Data loss prevention (DLP)',
        'Monitor data staging activities',
        'Encrypt sensitive data',
        'Access controls on sensitive information'
      ],
      'Command and Control': [
        'Network traffic analysis',
        'Deploy proxy solutions',
        'Block known C2 infrastructure',
        'Monitor for beaconing behavior'
      ],
      'Exfiltration': [
        'Data loss prevention (DLP)',
        'Network egress filtering',
        'Monitor unusual data transfers',
        'Implement data classification'
      ],
      'Impact': [
        'Regular backups',
        'Incident response plan',
        'Business continuity planning',
        'Immutable backup storage'
      ]
    };

    tactics.forEach(tactic => {
      if (tacticDefenses[tactic]) {
        recommendations[tactic] = tacticDefenses[tactic];
      }
    });

    return {
      actor_id: actorId,
      actor_name: actor.name,
      tactics_observed: tactics,
      recommendations
    };
  }

  /**
   * Map custom TTP taxonomy
   */
  async mapCustomTTP(actorId, customTTP) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    // Store custom taxonomy in metadata
    const metadata = actor.metadata || {};
    metadata.custom_ttps = metadata.custom_ttps || [];
    metadata.custom_ttps.push({
      ...customTTP,
      added_at: new Date()
    });

    return await threatActorRepository.update(actorId, { metadata });
  }

  /**
   * Track TTP evolution over time
   */
  async getTTPEvolution(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const ttps = actor.ttps || [];

    // Sort by first observed date
    const timeline = ttps
      .filter(ttp => ttp.first_observed)
      .sort((a, b) => new Date(a.first_observed) - new Date(b.first_observed))
      .map(ttp => ({
        date: ttp.first_observed,
        tactic: ttp.tactic,
        technique: ttp.technique,
        technique_id: ttp.technique_id
      }));

    // Group by time period (months)
    const byMonth = timeline.reduce((acc, ttp) => {
      const monthKey = new Date(ttp.date).toISOString().substring(0, 7);
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(ttp);
      return acc;
    }, {});

    return {
      actor_id: actorId,
      actor_name: actor.name,
      timeline,
      by_month: byMonth,
      total_ttps: ttps.length,
      first_observed: ttps.length > 0 ? timeline[0]?.date : null,
      last_observed: ttps.length > 0 ? timeline[timeline.length - 1]?.date : null
    };
  }
}

module.exports = new TTPMappingService();
