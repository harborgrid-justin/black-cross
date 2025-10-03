/**
 * Campaign Service
 * Business logic for campaign tracking and linking
 */

const { campaignRepository, threatActorRepository } = require('../repositories');

class CampaignService {
  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    // Validate required fields
    if (!campaignData.name || !campaignData.threat_actor_id || !campaignData.start_date) {
      throw new Error('Name, threat actor ID, and start date are required');
    }

    // Verify threat actor exists
    const actor = await threatActorRepository.findById(campaignData.threat_actor_id);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    // Create campaign
    const campaign = await campaignRepository.create({
      ...campaignData,
      status: campaignData.status || 'active'
    });

    // Add campaign reference to threat actor
    await threatActorRepository.addCampaign(campaignData.threat_actor_id, campaign.id);

    return campaign;
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(id) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return campaign;
  }

  /**
   * Update campaign
   */
  async updateCampaign(id, updateData) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return await campaignRepository.update(id, updateData);
  }

  /**
   * List campaigns with filtering
   */
  async listCampaigns(filters) {
    return await campaignRepository.list(filters);
  }

  /**
   * Get campaigns by threat actor
   */
  async getCampaignsByActor(actorId) {
    return await campaignRepository.findByThreatActorId(actorId);
  }

  /**
   * Add target organization to campaign
   */
  async addTarget(campaignId, organization) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return await campaignRepository.addTargetOrganization(campaignId, {
      ...organization,
      compromised: organization.compromised || false,
      compromise_date: organization.compromised ? (organization.compromise_date || new Date()) : null
    });
  }

  /**
   * Add timeline event to campaign
   */
  async addTimelineEvent(campaignId, event) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return await campaignRepository.addTimelineEvent(campaignId, {
      ...event,
      date: event.date || new Date()
    });
  }

  /**
   * Link related campaigns
   */
  async linkCampaigns(campaignId, linkedCampaignId, relationship, confidence = 50) {
    const campaign = await campaignRepository.findById(campaignId);
    const linkedCampaign = await campaignRepository.findById(linkedCampaignId);

    if (!campaign || !linkedCampaign) {
      throw new Error('One or both campaigns not found');
    }

    // Add link to both campaigns
    await campaignRepository.linkCampaigns(campaignId, {
      campaign_id: linkedCampaignId,
      relationship,
      confidence
    });

    await campaignRepository.linkCampaigns(linkedCampaignId, {
      campaign_id: campaignId,
      relationship,
      confidence
    });

    return {
      campaign_id: campaignId,
      linked_campaign_id: linkedCampaignId,
      relationship,
      confidence
    };
  }

  /**
   * Analyze campaign impact
   */
  async analyzeCampaignImpact(campaignId) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const impact = campaign.impact || {};
    const targets = campaign.targets?.organizations || [];

    // Calculate metrics
    const totalTargets = targets.length;
    const compromisedTargets = targets.filter(t => t.compromised).length;
    const compromiseRate = totalTargets > 0 ? (compromisedTargets / totalTargets) * 100 : 0;

    // Countries and industries affected
    const countriesAffected = [...new Set(targets.map(t => t.country).filter(Boolean))];
    const industriesAffected = campaign.targets?.industries || [];

    return {
      campaign_id: campaignId,
      campaign_name: campaign.name,
      status: campaign.status,
      duration_days: campaign.duration_days,
      total_targets: totalTargets,
      compromised_targets: compromisedTargets,
      compromise_rate: compromiseRate.toFixed(2) + '%',
      countries_affected: countriesAffected,
      industries_affected: industriesAffected,
      estimated_victims: impact.estimated_victims || 0,
      estimated_financial_loss: impact.estimated_financial_loss || 0,
      severity: impact.severity || 'unknown'
    };
  }

  /**
   * Get campaign timeline
   */
  async getCampaignTimeline(campaignId) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const events = campaign.timeline_events || [];
    const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      campaign_id: campaignId,
      campaign_name: campaign.name,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      status: campaign.status,
      events: sortedEvents,
      total_events: sortedEvents.length
    };
  }

  /**
   * Get active campaigns
   */
  async getActiveCampaigns() {
    return await campaignRepository.getActiveCampaigns();
  }

  /**
   * Get campaign TTPs
   */
  async getCampaignTTPs(campaignId) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const ttps = campaign.ttps || [];

    // Group by tactic
    const byTactic = ttps.reduce((acc, ttp) => {
      if (!acc[ttp.tactic]) {
        acc[ttp.tactic] = [];
      }
      acc[ttp.tactic].push(ttp);
      return acc;
    }, {});

    return {
      campaign_id: campaignId,
      campaign_name: campaign.name,
      total_ttps: ttps.length,
      ttps: ttps,
      by_tactic: byTactic,
      tactics_used: Object.keys(byTactic)
    };
  }

  /**
   * Correlate campaigns by TTPs
   */
  async correlateCampaignsByTTPs(campaignId) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const ttps = campaign.ttps || [];
    if (ttps.length === 0) {
      return { related_campaigns: [] };
    }

    // Get all campaigns from the same actor
    const actorCampaigns = await campaignRepository.findByThreatActorId(campaign.threat_actor_id);

    // Find campaigns with TTP overlap
    const relatedCampaigns = [];

    for (const otherCampaign of actorCampaigns) {
      if (otherCampaign.id === campaignId) continue;

      const otherTTPs = otherCampaign.ttps || [];
      const overlap = ttps.filter(ttp => 
        otherTTPs.some(ottp => ottp.technique_id === ttp.technique_id)
      );

      if (overlap.length > 0) {
        const similarityScore = (overlap.length / Math.max(ttps.length, otherTTPs.length)) * 100;
        relatedCampaigns.push({
          campaign_id: otherCampaign.id,
          campaign_name: otherCampaign.name,
          similarity_score: similarityScore.toFixed(2),
          overlapping_ttps: overlap.length
        });
      }
    }

    // Sort by similarity
    relatedCampaigns.sort((a, b) => parseFloat(b.similarity_score) - parseFloat(a.similarity_score));

    return {
      campaign_id: campaignId,
      campaign_name: campaign.name,
      related_campaigns: relatedCampaigns
    };
  }

  /**
   * End campaign
   */
  async endCampaign(campaignId, endDate = new Date()) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return await campaignRepository.update(campaignId, {
      status: 'concluded',
      end_date: endDate
    });
  }

  /**
   * Get campaign statistics
   */
  async getStatistics() {
    return await campaignRepository.getStatistics();
  }
}

module.exports = new CampaignService();
