/**
 * Assessment Service
 * Business logic for actor motivation and capability assessment
 */

const { threatActorRepository } = require('../repositories');

class AssessmentService {
  /**
   * Get capability assessment for actor
   */
  async getAssessment(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    return actor.capability_assessment || {};
  }

  /**
   * Update capability assessment
   */
  async updateAssessment(actorId, assessmentData) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    // Validate assessment data
    const assessment = {
      technical_capability: this.validateScore(assessmentData.technical_capability),
      operational_capability: this.validateScore(assessmentData.operational_capability),
      resource_level: assessmentData.resource_level || 'medium',
      funding_source: assessmentData.funding_source || 'unknown',
      team_size_estimate: assessmentData.team_size_estimate || 'unknown'
    };

    return await threatActorRepository.updateCapabilityAssessment(actorId, assessment);
  }

  /**
   * Validate capability score (0-100)
   */
  validateScore(score) {
    if (score === undefined || score === null) return 50;
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess actor motivation
   */
  async assessMotivation(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const motivation = actor.motivation || [];
    const targets = actor.targets || {};
    const sophistication = actor.sophistication || 'intermediate';

    // Analyze motivation based on various factors
    const analysis = {
      primary_motivations: motivation,
      motivation_confidence: this.calculateMotivationConfidence(actor),
      likely_objectives: this.inferObjectives(motivation, targets, sophistication),
      target_selection_rationale: this.analyzeTargetSelection(targets, motivation)
    };

    return {
      actor_id: actorId,
      actor_name: actor.name,
      ...analysis
    };
  }

  /**
   * Calculate motivation confidence
   */
  calculateMotivationConfidence(actor) {
    let confidence = 50;

    // More campaigns increase confidence
    if (actor.campaigns && actor.campaigns.length > 5) confidence += 20;
    else if (actor.campaigns && actor.campaigns.length > 2) confidence += 10;

    // More TTPs increase confidence
    if (actor.ttps && actor.ttps.length > 10) confidence += 15;
    else if (actor.ttps && actor.ttps.length > 5) confidence += 10;

    // Clear targeting increases confidence
    if (actor.targets?.industries?.length > 0) confidence += 10;
    if (actor.targets?.countries?.length > 0) confidence += 5;

    return Math.min(100, confidence);
  }

  /**
   * Infer likely objectives
   */
  inferObjectives(motivation, targets, sophistication) {
    const objectives = [];

    if (motivation.includes('financial')) {
      objectives.push('Financial gain through ransomware, theft, or extortion');
      if (targets.industries?.includes('financial')) {
        objectives.push('Direct access to financial systems');
      }
    }

    if (motivation.includes('espionage')) {
      objectives.push('Intelligence gathering and data exfiltration');
      objectives.push('Long-term persistent access');
      if (targets.industries?.includes('government')) {
        objectives.push('State secrets and sensitive information');
      }
    }

    if (motivation.includes('ideology') || motivation.includes('hacktivist')) {
      objectives.push('Public disruption and attention');
      objectives.push('Data leaks and defacement');
    }

    if (motivation.includes('dominance')) {
      objectives.push('Demonstration of capabilities');
      objectives.push('Establishing market position');
    }

    if (sophistication === 'expert' || sophistication === 'strategic') {
      objectives.push('Advanced persistent threat (APT) operations');
    }

    return objectives;
  }

  /**
   * Analyze target selection
   */
  analyzeTargetSelection(targets, motivation) {
    const analysis = {
      industries: targets.industries || [],
      countries: targets.countries || [],
      patterns: []
    };

    // Analyze industry targeting
    if (targets.industries?.includes('financial') && motivation.includes('financial')) {
      analysis.patterns.push('Financial sector targeting aligns with financial motivation');
    }

    if (targets.industries?.includes('government') && motivation.includes('espionage')) {
      analysis.patterns.push('Government targeting aligns with espionage motivation');
    }

    if (targets.industries?.includes('critical-infrastructure')) {
      analysis.patterns.push('Critical infrastructure targeting suggests nation-state or advanced capability');
    }

    // Geographic analysis
    if (targets.countries && targets.countries.length === 1) {
      analysis.patterns.push('Single country focus suggests targeted campaign');
    } else if (targets.countries && targets.countries.length > 10) {
      analysis.patterns.push('Global targeting suggests opportunistic or widespread campaign');
    }

    return analysis;
  }

  /**
   * Assess technical capability
   */
  async assessTechnicalCapability(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    let score = 0;
    const factors = [];

    // Sophistication level
    const sophisticationScores = {
      'none': 0,
      'minimal': 10,
      'intermediate': 30,
      'advanced': 50,
      'expert': 70,
      'innovator': 85,
      'strategic': 95
    };
    score += sophisticationScores[actor.sophistication] || 30;
    factors.push({
      factor: 'Sophistication Level',
      contribution: sophisticationScores[actor.sophistication] || 30,
      value: actor.sophistication
    });

    // TTP complexity
    const ttpCount = actor.ttps?.length || 0;
    const ttpScore = Math.min(20, ttpCount * 2);
    score += ttpScore;
    factors.push({
      factor: 'TTP Complexity',
      contribution: ttpScore,
      value: `${ttpCount} techniques`
    });

    // Malware usage
    const malwareCount = actor.associated_malware?.length || 0;
    const malwareScore = Math.min(15, malwareCount * 3);
    score += malwareScore;
    factors.push({
      factor: 'Malware Arsenal',
      contribution: malwareScore,
      value: `${malwareCount} families`
    });

    // Custom tools
    const toolCount = actor.associated_tools?.length || 0;
    const toolScore = Math.min(10, toolCount * 2);
    score += toolScore;
    factors.push({
      factor: 'Custom Tools',
      contribution: toolScore,
      value: `${toolCount} tools`
    });

    // Infrastructure sophistication
    const domainCount = actor.infrastructure?.domains?.length || 0;
    const infraScore = Math.min(10, domainCount);
    score += infraScore;
    factors.push({
      factor: 'Infrastructure',
      contribution: infraScore,
      value: `${domainCount} domains`
    });

    return {
      actor_id: actorId,
      actor_name: actor.name,
      technical_capability_score: Math.min(100, score),
      contributing_factors: factors,
      assessment_date: new Date()
    };
  }

  /**
   * Assess operational capability
   */
  async assessOperationalCapability(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    let score = 0;
    const factors = [];

    // Campaign success rate
    const campaignCount = actor.campaigns?.length || 0;
    const campaignScore = Math.min(25, campaignCount * 5);
    score += campaignScore;
    factors.push({
      factor: 'Campaign Experience',
      contribution: campaignScore,
      value: `${campaignCount} campaigns`
    });

    // Target diversity
    const industryCount = actor.targets?.industries?.length || 0;
    const countryCount = actor.targets?.countries?.length || 0;
    const diversityScore = Math.min(20, (industryCount + countryCount) * 2);
    score += diversityScore;
    factors.push({
      factor: 'Target Diversity',
      contribution: diversityScore,
      value: `${industryCount} industries, ${countryCount} countries`
    });

    // Activity duration
    const activityDays = actor.activity_duration_days || 0;
    const durationScore = Math.min(25, activityDays / 30); // 1 point per month, max 25
    score += durationScore;
    factors.push({
      factor: 'Activity Duration',
      contribution: durationScore,
      value: `${activityDays} days`
    });

    // Recent activity
    if (actor.is_recently_active) {
      score += 15;
      factors.push({
        factor: 'Recent Activity',
        contribution: 15,
        value: 'Active in last 90 days'
      });
    }

    // Relationship network
    const relationshipCount = actor.relationships?.length || 0;
    const relationshipScore = Math.min(15, relationshipCount * 3);
    score += relationshipScore;
    factors.push({
      factor: 'Network Relationships',
      contribution: relationshipScore,
      value: `${relationshipCount} relationships`
    });

    return {
      actor_id: actorId,
      actor_name: actor.name,
      operational_capability_score: Math.min(100, score),
      contributing_factors: factors,
      assessment_date: new Date()
    };
  }

  /**
   * Get comprehensive capability assessment
   */
  async getComprehensiveAssessment(actorId) {
    const [technical, operational, motivation] = await Promise.all([
      this.assessTechnicalCapability(actorId),
      this.assessOperationalCapability(actorId),
      this.assessMotivation(actorId)
    ]);

    const actor = await threatActorRepository.findById(actorId);

    // Calculate overall threat level
    const overallScore = (technical.technical_capability_score + operational.operational_capability_score) / 2;
    
    let threatLevel;
    if (overallScore >= 80) threatLevel = 'critical';
    else if (overallScore >= 60) threatLevel = 'high';
    else if (overallScore >= 40) threatLevel = 'medium';
    else threatLevel = 'low';

    return {
      actor_id: actorId,
      actor_name: actor.name,
      actor_type: actor.type,
      sophistication: actor.sophistication,
      technical_assessment: technical,
      operational_assessment: operational,
      motivation_assessment: motivation,
      overall_threat_score: overallScore.toFixed(2),
      threat_level: threatLevel,
      assessment_date: new Date()
    };
  }

  /**
   * Get success rate metrics
   */
  async getSuccessRateMetrics(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    // This would typically pull from campaign data
    const totalCampaigns = actor.campaigns?.length || 0;
    
    // For now, estimate based on sophistication and activity
    let estimatedSuccessRate = 50;
    
    if (actor.sophistication === 'expert' || actor.sophistication === 'strategic') {
      estimatedSuccessRate = 75;
    } else if (actor.sophistication === 'advanced') {
      estimatedSuccessRate = 60;
    } else if (actor.sophistication === 'minimal') {
      estimatedSuccessRate = 30;
    }

    return {
      actor_id: actorId,
      actor_name: actor.name,
      total_campaigns: totalCampaigns,
      estimated_success_rate: estimatedSuccessRate,
      sophistication: actor.sophistication,
      note: 'Success rate is estimated based on sophistication level and activity patterns'
    };
  }
}

module.exports = new AssessmentService();
