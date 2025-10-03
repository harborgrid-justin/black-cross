/**
 * IoC Confidence Scoring Service
 * 
 * Sub-feature 7.3: IoC Confidence Scoring
 * Handles multi-factor confidence calculation and trend tracking
 */

const { iocRepository } = require('../repositories');

class ConfidenceService {
  /**
   * Calculate confidence score for an IoC
   */
  async calculateConfidence(iocId, factors = {}) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    // Calculate using IoC's built-in method
    const baseScore = ioc.calculateConfidence();

    // Apply additional factors if provided
    let adjustedScore = baseScore;

    // Manual adjustment
    if (factors.manual_adjustment !== undefined) {
      adjustedScore = factors.manual_adjustment;
    }

    // Validation-based adjustment
    if (factors.validation_status) {
      switch (factors.validation_status) {
        case 'verified':
          adjustedScore = Math.min(100, adjustedScore + 15);
          break;
        case 'disputed':
          adjustedScore = Math.max(0, adjustedScore - 20);
          break;
        case 'unverified':
          // No change
          break;
      }
    }

    // Update IoC
    await iocRepository.update(iocId, { confidence: adjustedScore });

    return {
      ioc_id: iocId,
      previous_confidence: baseScore,
      new_confidence: adjustedScore,
      factors_applied: factors,
      timestamp: new Date()
    };
  }

  /**
   * Get confidence score
   */
  async getConfidence(iocId) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    return {
      ioc_id: iocId,
      value: ioc.value,
      type: ioc.type,
      confidence: ioc.confidence,
      factors: this.analyzeConfidenceFactors(ioc),
      last_calculated: ioc.updated_at
    };
  }

  /**
   * Analyze confidence factors for an IoC
   */
  analyzeConfidenceFactors(ioc) {
    const factors = {
      base_score: 50,
      adjustments: []
    };

    // Source reliability
    if (ioc.sources.length > 0) {
      const avgReliability = ioc.sources.reduce((sum, s) => sum + (s.reliability || 50), 0) / ioc.sources.length;
      factors.adjustments.push({
        factor: 'source_reliability',
        impact: (avgReliability - 50) / 5,
        description: `Average source reliability: ${avgReliability.toFixed(2)}%`
      });
    }

    // Age decay
    const ageInDays = (new Date() - new Date(ioc.first_seen)) / (1000 * 60 * 60 * 24);
    const ageDecay = Math.max(0, 1 - (ageInDays / 365));
    factors.adjustments.push({
      factor: 'age_decay',
      impact: (ageDecay - 0.5) * 20,
      description: `IoC age: ${ageInDays.toFixed(0)} days`
    });

    // Sighting frequency
    const recentSightings = ioc.sightings.filter(s => {
      const sightingAge = (new Date() - new Date(s.timestamp)) / (1000 * 60 * 60 * 24);
      return sightingAge < 30;
    }).length;

    if (recentSightings > 0) {
      factors.adjustments.push({
        factor: 'sighting_frequency',
        impact: Math.min(20, recentSightings * 2),
        description: `${recentSightings} recent sightings (last 30 days)`
      });
    }

    // Enrichment data
    if (ioc.enrichment.reputation && ioc.enrichment.reputation.score) {
      factors.adjustments.push({
        factor: 'reputation_score',
        impact: (ioc.enrichment.reputation.score - 50) / 5,
        description: `Reputation score: ${ioc.enrichment.reputation.score}`
      });
    }

    // Multiple sources boost
    if (ioc.sources.length > 1) {
      factors.adjustments.push({
        factor: 'multiple_sources',
        impact: Math.min(15, (ioc.sources.length - 1) * 3),
        description: `${ioc.sources.length} independent sources`
      });
    }

    return factors;
  }

  /**
   * Update confidence manually
   */
  async updateConfidence(iocId, newConfidence, reason = null) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    if (newConfidence < 0 || newConfidence > 100) {
      throw new Error('Confidence must be between 0 and 100');
    }

    const oldConfidence = ioc.confidence;
    await iocRepository.update(iocId, { 
      confidence: newConfidence,
      'metadata.confidence_history': [
        ...(ioc.metadata.confidence_history || []),
        {
          from: oldConfidence,
          to: newConfidence,
          reason,
          timestamp: new Date()
        }
      ]
    });

    return {
      ioc_id: iocId,
      old_confidence: oldConfidence,
      new_confidence: newConfidence,
      reason,
      updated_at: new Date()
    };
  }

  /**
   * Get confidence trend for an IoC
   */
  async getConfidenceTrend(iocId) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    const history = ioc.metadata.confidence_history || [];
    
    return {
      ioc_id: iocId,
      current_confidence: ioc.confidence,
      history: history.map(h => ({
        from: h.from,
        to: h.to,
        change: h.to - h.from,
        reason: h.reason,
        timestamp: h.timestamp
      })),
      trend: this.calculateTrend(history)
    };
  }

  /**
   * Calculate confidence trend
   */
  calculateTrend(history) {
    if (history.length < 2) {
      return 'stable';
    }

    const recentChanges = history.slice(-5);
    const totalChange = recentChanges.reduce((sum, h) => sum + (h.to - h.from), 0);

    if (totalChange > 10) {
      return 'increasing';
    } else if (totalChange < -10) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  /**
   * Batch recalculate confidence for multiple IoCs
   */
  async batchRecalculate(criteria = {}) {
    const iocs = await iocRepository.find(criteria);
    const results = [];

    for (const ioc of iocs) {
      try {
        const newConfidence = ioc.calculateConfidence();
        await iocRepository.update(ioc.id, { confidence: newConfidence });
        results.push({
          ioc_id: ioc.id,
          old_confidence: ioc.confidence,
          new_confidence: newConfidence
        });
      } catch (error) {
        results.push({
          ioc_id: ioc.id,
          error: error.message
        });
      }
    }

    return {
      processed: results.length,
      results
    };
  }

  /**
   * Apply confidence decay based on age
   */
  async applyAgeBasedDecay() {
    const allIoCs = await iocRepository.find({ status: 'active' });
    const updated = [];

    for (const ioc of allIoCs) {
      const ageInDays = (new Date() - new Date(ioc.first_seen)) / (1000 * 60 * 60 * 24);
      
      // Apply decay for IoCs older than 30 days
      if (ageInDays > 30) {
        const decayFactor = Math.max(0.5, 1 - (ageInDays / 730)); // Max 50% decay over 2 years
        const newConfidence = Math.round(ioc.confidence * decayFactor);
        
        if (newConfidence !== ioc.confidence) {
          await iocRepository.update(ioc.id, { confidence: newConfidence });
          updated.push({
            ioc_id: ioc.id,
            old_confidence: ioc.confidence,
            new_confidence: newConfidence,
            age_days: ageInDays.toFixed(0)
          });
        }
      }
    }

    return {
      processed: allIoCs.length,
      updated: updated.length,
      details: updated
    };
  }

  /**
   * Get confidence statistics
   */
  async getConfidenceStats() {
    const allIoCs = await iocRepository.find();

    const ranges = {
      high: 0,      // 80-100
      medium: 0,    // 50-79
      low: 0,       // 0-49
    };

    let totalConfidence = 0;

    allIoCs.forEach(ioc => {
      totalConfidence += ioc.confidence;
      
      if (ioc.confidence >= 80) {
        ranges.high++;
      } else if (ioc.confidence >= 50) {
        ranges.medium++;
      } else {
        ranges.low++;
      }
    });

    return {
      total_iocs: allIoCs.length,
      average_confidence: allIoCs.length > 0 ? (totalConfidence / allIoCs.length).toFixed(2) : 0,
      confidence_ranges: ranges,
      high_confidence_percentage: allIoCs.length > 0 
        ? ((ranges.high / allIoCs.length) * 100).toFixed(2)
        : 0
    };
  }
}

module.exports = new ConfidenceService();
