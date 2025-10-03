/**
 * Targeting Analysis Service
 * Business logic for geographic and sector targeting analysis
 */

const { threatActorRepository, campaignRepository } = require('../repositories');

class TargetingAnalysisService {
  /**
   * Get actor targeting profile
   */
  async getActorTargets(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    return {
      actor_id: actorId,
      actor_name: actor.name,
      targets: actor.targets || {},
      targeting_summary: this.summarizeTargets(actor.targets)
    };
  }

  /**
   * Summarize targeting information
   */
  summarizeTargets(targets) {
    if (!targets) return {};

    return {
      total_industries: targets.industries?.length || 0,
      total_countries: targets.countries?.length || 0,
      total_organization_types: targets.organization_types?.length || 0,
      primary_industry: targets.industries?.[0] || 'unknown',
      primary_country: targets.countries?.[0] || 'unknown'
    };
  }

  /**
   * Get geographic targeting heat map
   */
  async getGeographicHeatMap() {
    const allActors = await threatActorRepository.list({ limit: 1000 });
    const countryTargeting = {};

    // Aggregate targeting by country
    allActors.actors.forEach(actor => {
      const countries = actor.targets?.countries || [];
      countries.forEach(country => {
        if (!countryTargeting[country]) {
          countryTargeting[country] = {
            country,
            actor_count: 0,
            actors: [],
            threat_levels: { critical: 0, high: 0, medium: 0, low: 0 }
          };
        }
        countryTargeting[country].actor_count++;
        countryTargeting[country].actors.push({
          id: actor.id,
          name: actor.name,
          sophistication: actor.sophistication
        });

        // Categorize threat level
        const threatScore = actor.threat_score || 50;
        if (threatScore >= 80) countryTargeting[country].threat_levels.critical++;
        else if (threatScore >= 60) countryTargeting[country].threat_levels.high++;
        else if (threatScore >= 40) countryTargeting[country].threat_levels.medium++;
        else countryTargeting[country].threat_levels.low++;
      });
    });

    // Convert to array and sort by actor count
    const heatMapData = Object.values(countryTargeting)
      .sort((a, b) => b.actor_count - a.actor_count);

    return {
      total_countries: heatMapData.length,
      heat_map: heatMapData,
      top_targeted: heatMapData.slice(0, 10)
    };
  }

  /**
   * Get industry sector analysis
   */
  async getIndustrySectorAnalysis() {
    const allActors = await threatActorRepository.list({ limit: 1000 });
    const industryTargeting = {};

    // Aggregate targeting by industry
    allActors.actors.forEach(actor => {
      const industries = actor.targets?.industries || [];
      industries.forEach(industry => {
        if (!industryTargeting[industry]) {
          industryTargeting[industry] = {
            industry,
            actor_count: 0,
            actors: [],
            sophistication_levels: {},
            motivations: {}
          };
        }
        industryTargeting[industry].actor_count++;
        industryTargeting[industry].actors.push({
          id: actor.id,
          name: actor.name,
          sophistication: actor.sophistication,
          motivation: actor.motivation
        });

        // Track sophistication levels
        const soph = actor.sophistication || 'unknown';
        industryTargeting[industry].sophistication_levels[soph] = 
          (industryTargeting[industry].sophistication_levels[soph] || 0) + 1;

        // Track motivations
        (actor.motivation || []).forEach(motivation => {
          industryTargeting[industry].motivations[motivation] = 
            (industryTargeting[industry].motivations[motivation] || 0) + 1;
        });
      });
    });

    // Convert to array and sort by actor count
    const sectorData = Object.values(industryTargeting)
      .sort((a, b) => b.actor_count - a.actor_count);

    return {
      total_industries: sectorData.length,
      sector_analysis: sectorData,
      most_targeted: sectorData.slice(0, 10)
    };
  }

  /**
   * Get targeting trends over time
   */
  async getTargetingTrends(period = '90d') {
    const days = parseInt(period.replace('d', ''));
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get campaigns in the time period
    const campaigns = await campaignRepository.findByDateRange(cutoffDate, new Date());

    // Analyze trends
    const industryTrends = {};
    const countryTrends = {};
    const monthlyData = {};

    campaigns.forEach(campaign => {
      const monthKey = new Date(campaign.start_date).toISOString().substring(0, 7);
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          campaigns: 0,
          industries: {},
          countries: {}
        };
      }
      monthlyData[monthKey].campaigns++;

      // Track industries
      (campaign.targets?.industries || []).forEach(industry => {
        industryTrends[industry] = (industryTrends[industry] || 0) + 1;
        monthlyData[monthKey].industries[industry] = 
          (monthlyData[monthKey].industries[industry] || 0) + 1;
      });

      // Track countries
      (campaign.targets?.countries || []).forEach(country => {
        countryTrends[country] = (countryTrends[country] || 0) + 1;
        monthlyData[monthKey].countries[country] = 
          (monthlyData[monthKey].countries[country] || 0) + 1;
      });
    });

    return {
      period,
      total_campaigns: campaigns.length,
      industry_trends: Object.entries(industryTrends)
        .map(([industry, count]) => ({ industry, count }))
        .sort((a, b) => b.count - a.count),
      country_trends: Object.entries(countryTrends)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
      monthly_breakdown: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
    };
  }

  /**
   * Analyze temporal targeting patterns
   */
  async getTemporalPatterns(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const campaigns = await campaignRepository.findByThreatActorId(actorId);

    // Analyze when campaigns start
    const byMonth = {};
    const byDayOfWeek = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const byHour = {};

    campaigns.forEach(campaign => {
      const date = new Date(campaign.start_date);
      
      // Month
      const monthKey = date.toISOString().substring(0, 7);
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;

      // Day of week
      const dayOfWeek = date.getDay();
      byDayOfWeek[dayOfWeek]++;

      // Hour (if available)
      const hour = date.getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });

    return {
      actor_id: actorId,
      actor_name: actor.name,
      total_campaigns_analyzed: campaigns.length,
      monthly_distribution: byMonth,
      day_of_week_distribution: byDayOfWeek,
      hourly_distribution: byHour,
      preferred_days: this.getPreferredDays(byDayOfWeek),
      operational_hours: actor.attribution_indicators?.operational_hours || 'unknown'
    };
  }

  /**
   * Get preferred days
   */
  getPreferredDays(byDayOfWeek) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return Object.entries(byDayOfWeek)
      .map(([day, count]) => ({ day: days[parseInt(day)], count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  /**
   * Get attack vector preferences
   */
  async getAttackVectorPreferences(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const campaigns = await campaignRepository.findByThreatActorId(actorId);

    // Aggregate attack vectors
    const vectorFrequency = {};
    campaigns.forEach(campaign => {
      (campaign.attack_vectors || []).forEach(vector => {
        vectorFrequency[vector] = (vectorFrequency[vector] || 0) + 1;
      });
    });

    const sortedVectors = Object.entries(vectorFrequency)
      .map(([vector, count]) => ({ vector, count, percentage: 0 }))
      .sort((a, b) => b.count - a.count);

    const total = sortedVectors.reduce((sum, v) => sum + v.count, 0);
    sortedVectors.forEach(v => {
      v.percentage = total > 0 ? ((v.count / total) * 100).toFixed(2) : 0;
    });

    return {
      actor_id: actorId,
      actor_name: actor.name,
      total_campaigns: campaigns.length,
      attack_vectors: sortedVectors,
      primary_vector: sortedVectors[0]?.vector || 'unknown'
    };
  }

  /**
   * Get target selection criteria analysis
   */
  async getTargetSelectionCriteria(actorId) {
    const actor = await threatActorRepository.findById(actorId);
    if (!actor) {
      throw new Error('Threat actor not found');
    }

    const targets = actor.targets || {};
    const campaigns = await campaignRepository.findByThreatActorId(actorId);

    // Analyze organization sizes targeted
    const orgSizes = {};
    const orgTypes = {};

    campaigns.forEach(campaign => {
      (campaign.targets?.organizations || []).forEach(org => {
        if (org.type) {
          orgTypes[org.type] = (orgTypes[org.type] || 0) + 1;
        }
      });
    });

    (targets.organization_sizes || []).forEach(size => {
      orgSizes[size] = (orgSizes[size] || 0) + 1;
    });

    return {
      actor_id: actorId,
      actor_name: actor.name,
      industries: targets.industries || [],
      countries: targets.countries || [],
      organization_types: Object.entries(orgTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      organization_sizes: Object.entries(orgSizes)
        .map(([size, count]) => ({ size, count }))
        .sort((a, b) => b.count - a.count),
      selection_pattern: this.inferSelectionPattern(actor)
    };
  }

  /**
   * Infer selection pattern
   */
  inferSelectionPattern(actor) {
    const patterns = [];

    if (actor.targets?.industries?.length === 1) {
      patterns.push('Highly focused industry targeting');
    } else if (actor.targets?.industries?.length > 10) {
      patterns.push('Opportunistic cross-industry targeting');
    }

    if (actor.targets?.countries?.length === 1) {
      patterns.push('Single country focus');
    } else if (actor.targets?.countries?.length > 20) {
      patterns.push('Global targeting');
    }

    if (actor.motivation?.includes('financial')) {
      patterns.push('Likely targets organizations with valuable data or payment capability');
    }

    if (actor.motivation?.includes('espionage')) {
      patterns.push('Likely targets organizations with strategic intelligence value');
    }

    if (actor.sophistication === 'expert' || actor.sophistication === 'strategic') {
      patterns.push('Selective targeting based on strategic value');
    }

    return patterns;
  }

  /**
   * Get defensive positioning recommendations
   */
  async getDefensiveRecommendations(industry, country = null) {
    // Get all actors targeting this industry/country
    let actors = await threatActorRepository.findByTargetIndustry(industry);

    if (country) {
      const countryActors = await threatActorRepository.findByTargetCountry(country);
      // Intersect the two sets
      const countryActorIds = new Set(countryActors.map(a => a.id));
      actors = actors.filter(a => countryActorIds.has(a.id));
    }

    // Aggregate TTPs from all relevant actors
    const allTTPs = [];
    const actorTypes = {};
    const sophisticationLevels = {};

    actors.forEach(actor => {
      actorTypes[actor.type] = (actorTypes[actor.type] || 0) + 1;
      sophisticationLevels[actor.sophistication] = (sophisticationLevels[actor.sophistication] || 0) + 1;
      if (actor.ttps) {
        allTTPs.push(...actor.ttps);
      }
    });

    // Get most common TTPs
    const ttpFrequency = {};
    allTTPs.forEach(ttp => {
      const key = ttp.technique_id || ttp.technique;
      ttpFrequency[key] = (ttpFrequency[key] || 0) + 1;
    });

    const topTTPs = Object.entries(ttpFrequency)
      .map(([ttp, count]) => ({ ttp, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      industry,
      country: country || 'all',
      threat_landscape: {
        total_actors_targeting: actors.length,
        actor_types: actorTypes,
        sophistication_levels: sophisticationLevels
      },
      most_common_ttps: topTTPs,
      recommendations: this.generateDefensiveRecommendations(actors, topTTPs)
    };
  }

  /**
   * Generate defensive recommendations
   */
  generateDefensiveRecommendations(actors, topTTPs) {
    const recommendations = [
      'Implement comprehensive logging and monitoring',
      'Deploy endpoint detection and response (EDR) solutions',
      'Conduct regular threat hunting exercises',
      'Implement network segmentation',
      'Enforce multi-factor authentication'
    ];

    // Add specific recommendations based on sophistication
    const hasExpertActors = actors.some(a => 
      a.sophistication === 'expert' || a.sophistication === 'strategic'
    );

    if (hasExpertActors) {
      recommendations.push('Implement advanced threat detection with behavioral analytics');
      recommendations.push('Consider threat intelligence platform integration');
      recommendations.push('Deploy deception technology (honeypots)');
    }

    // Add recommendations based on actor types
    const hasNationState = actors.some(a => a.type === 'nation-state' || a.type === 'apt');
    if (hasNationState) {
      recommendations.push('Implement zero trust architecture');
      recommendations.push('Regular security assessments by third-party experts');
      recommendations.push('Insider threat program');
    }

    return recommendations;
  }
}

module.exports = new TargetingAnalysisService();
