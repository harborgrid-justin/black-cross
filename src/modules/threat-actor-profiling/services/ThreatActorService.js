/**
 * Threat Actor Service
 * Business logic for threat actor database and tracking
 */

const { threatActorRepository } = require('../repositories');

class ThreatActorService {
  /**
   * Create a new threat actor profile
   */
  async createActor(actorData) {
    // Validate required fields
    if (!actorData.name || !actorData.type) {
      throw new Error('Name and type are required');
    }

    // Check if actor already exists
    const existing = await threatActorRepository.findByName(actorData.name);
    if (existing) {
      throw new Error('Threat actor with this name already exists');
    }

    // Set default values
    const actor = {
      ...actorData,
      first_seen: actorData.first_seen || new Date(),
      last_seen: actorData.last_seen || new Date(),
      status: actorData.status || 'active',
      confidence_score: actorData.confidence_score || 50,
      threat_score: actorData.threat_score || 50
    };

    return await threatActorRepository.create(actor);
  }

  /**
   * Get threat actor by ID
   */
  async getActorById(id) {
    const actor = await threatActorRepository.findById(id);
    if (!actor) {
      throw new Error('Threat actor not found');
    }
    return actor;
  }

  /**
   * Update threat actor
   */
  async updateActor(id, updateData) {
    const actor = await threatActorRepository.findById(id);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    return await threatActorRepository.update(id, updateData);
  }

  /**
   * List threat actors with filtering
   */
  async listActors(filters) {
    return await threatActorRepository.list(filters);
  }

  /**
   * Add alias to threat actor
   */
  async addAlias(id, alias) {
    const actor = await threatActorRepository.findById(id);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    return await threatActorRepository.addAlias(id, alias);
  }

  /**
   * Update actor status
   */
  async updateStatus(id, status) {
    const validStatuses = ['active', 'dormant', 'defunct', 'unknown'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    return await threatActorRepository.update(id, { status });
  }

  /**
   * Track actor activity
   */
  async trackActivity(id, activityData) {
    const actor = await threatActorRepository.findById(id);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    // Update last seen date
    const updates = {
      last_seen: new Date(),
      status: 'active'
    };

    // Add activity to metadata if provided
    if (activityData) {
      updates.metadata = {
        ...actor.metadata,
        recent_activity: [
          ...(actor.metadata?.recent_activity || []),
          {
            ...activityData,
            timestamp: new Date()
          }
        ].slice(-50) // Keep last 50 activities
      };
    }

    return await threatActorRepository.update(id, updates);
  }

  /**
   * Search actors by infrastructure indicators
   */
  async searchByInfrastructure(indicator) {
    return await threatActorRepository.searchByInfrastructure(indicator);
  }

  /**
   * Get recently active actors
   */
  async getRecentlyActive(days = 90) {
    return await threatActorRepository.getRecentlyActive(days);
  }

  /**
   * Get actors by target profile
   */
  async getActorsByTarget(targetProfile) {
    const { industry, country, organization_type } = targetProfile;
    
    let actors = [];

    if (industry) {
      actors = await threatActorRepository.findByTargetIndustry(industry);
    } else if (country) {
      actors = await threatActorRepository.findByTargetCountry(country);
    } else {
      actors = await threatActorRepository.list({ limit: 100 });
      actors = actors.actors;
    }

    // Filter by organization type if provided
    if (organization_type && actors.length > 0) {
      actors = actors.filter(actor => 
        actor.targets?.organization_types?.includes(organization_type)
      );
    }

    return actors;
  }

  /**
   * Calculate threat score based on various factors
   */
  async calculateThreatScore(id) {
    const actor = await threatActorRepository.findById(id);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    let score = 0;

    // Sophistication level (0-30 points)
    const sophisticationScores = {
      'none': 0,
      'minimal': 5,
      'intermediate': 10,
      'advanced': 20,
      'expert': 25,
      'innovator': 28,
      'strategic': 30
    };
    score += sophisticationScores[actor.sophistication] || 10;

    // Activity level (0-20 points)
    if (actor.status === 'active') {
      const daysSinceLastSeen = Math.floor((Date.now() - actor.last_seen) / (1000 * 60 * 60 * 24));
      if (daysSinceLastSeen <= 30) score += 20;
      else if (daysSinceLastSeen <= 90) score += 15;
      else if (daysSinceLastSeen <= 180) score += 10;
      else score += 5;
    }

    // Number of campaigns (0-20 points)
    const campaignCount = actor.campaigns?.length || 0;
    score += Math.min(20, campaignCount * 2);

    // TTPs complexity (0-15 points)
    const ttpCount = actor.ttps?.length || 0;
    score += Math.min(15, ttpCount);

    // Target diversity (0-15 points)
    const targetIndustries = actor.targets?.industries?.length || 0;
    const targetCountries = actor.targets?.countries?.length || 0;
    score += Math.min(15, (targetIndustries + targetCountries) / 2);

    // Update the threat score
    await threatActorRepository.update(id, { threat_score: Math.min(100, score) });

    return Math.min(100, score);
  }

  /**
   * Get actor statistics
   */
  async getStatistics() {
    return await threatActorRepository.getStatistics();
  }

  /**
   * Delete threat actor
   */
  async deleteActor(id) {
    const actor = await threatActorRepository.findById(id);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    return await threatActorRepository.delete(id);
  }
}

module.exports = new ThreatActorService();
