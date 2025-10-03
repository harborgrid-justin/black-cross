/**
 * IoC Lifecycle Management Service
 * 
 * Sub-feature 7.5: IoC Lifecycle Management
 * Manages IoC lifecycle from creation to expiration
 */

const { iocRepository } = require('../repositories');

class LifecycleService {
  /**
   * Update IoC lifecycle status
   */
  async updateLifecycle(iocId, status, options = {}) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    const validStatuses = ['active', 'inactive', 'expired', 'deprecated'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const oldStatus = ioc.status;
    ioc.updateLifecycle(status, options.expiration_date);

    // Add lifecycle event to metadata
    if (!ioc.metadata.lifecycle_events) {
      ioc.metadata.lifecycle_events = [];
    }

    ioc.metadata.lifecycle_events.push({
      from: oldStatus,
      to: status,
      reason: options.reason || null,
      timestamp: new Date()
    });

    await iocRepository.update(iocId, ioc);

    return {
      ioc_id: iocId,
      old_status: oldStatus,
      new_status: status,
      expiration_date: ioc.expiration,
      updated_at: new Date()
    };
  }

  /**
   * Get lifecycle status for an IoC
   */
  async getLifecycleStatus(iocId) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    const ageInDays = (new Date() - new Date(ioc.first_seen)) / (1000 * 60 * 60 * 24);
    const isExpired = ioc.isExpired();

    return {
      ioc_id: iocId,
      value: ioc.value,
      type: ioc.type,
      status: ioc.status,
      first_seen: ioc.first_seen,
      last_seen: ioc.last_seen,
      expiration: ioc.expiration,
      age_days: ageInDays.toFixed(0),
      is_expired: isExpired,
      sightings_count: ioc.sightings.length,
      recent_sightings: this.getRecentSightingsCount(ioc),
      lifecycle_stage: this.determineLifecycleStage(ioc),
      lifecycle_events: ioc.metadata.lifecycle_events || []
    };
  }

  /**
   * Get recent sightings count (last 30 days)
   */
  getRecentSightingsCount(ioc) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return ioc.sightings.filter(s => new Date(s.timestamp) >= thirtyDaysAgo).length;
  }

  /**
   * Determine lifecycle stage
   */
  determineLifecycleStage(ioc) {
    const ageInDays = (new Date() - new Date(ioc.first_seen)) / (1000 * 60 * 60 * 24);
    const recentSightings = this.getRecentSightingsCount(ioc);

    if (ioc.status === 'expired' || ioc.isExpired()) {
      return 'expired';
    }

    if (ioc.status === 'deprecated') {
      return 'deprecated';
    }

    if (ioc.status === 'inactive') {
      return 'inactive';
    }

    if (recentSightings > 5) {
      return 'highly_active';
    }

    if (recentSightings > 0) {
      return 'active';
    }

    if (ageInDays > 180) {
      return 'aging';
    }

    if (ageInDays > 90) {
      return 'mature';
    }

    if (ageInDays < 7) {
      return 'new';
    }

    return 'established';
  }

  /**
   * Get all lifecycle statuses
   */
  async getAllLifecycleStatus(filters = {}) {
    const iocs = await iocRepository.find(filters);

    return {
      total: iocs.length,
      statuses: iocs.map(ioc => ({
        ioc_id: ioc.id,
        value: ioc.value,
        type: ioc.type,
        status: ioc.status,
        lifecycle_stage: this.determineLifecycleStage(ioc),
        age_days: ((new Date() - new Date(ioc.first_seen)) / (1000 * 60 * 60 * 24)).toFixed(0)
      }))
    };
  }

  /**
   * Track IoC sighting
   */
  async trackSighting(iocId, sightingData) {
    const ioc = await iocRepository.findById(iocId);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    ioc.addSighting({
      timestamp: sightingData.timestamp || new Date(),
      source: sightingData.source || 'unknown',
      location: sightingData.location || null,
      context: sightingData.context || null
    });

    // If IoC was inactive, reactivate it
    if (ioc.status === 'inactive') {
      ioc.status = 'active';
    }

    await iocRepository.update(iocId, ioc);

    return {
      ioc_id: iocId,
      sighting_added: true,
      total_sightings: ioc.sightings.length,
      last_seen: ioc.last_seen
    };
  }

  /**
   * Get effectiveness metrics for IoCs
   */
  async getEffectivenessMetrics() {
    const allIoCs = await iocRepository.find();

    const metrics = {
      total_iocs: allIoCs.length,
      with_sightings: 0,
      without_sightings: 0,
      high_value: 0,       // >10 sightings
      medium_value: 0,     // 3-10 sightings
      low_value: 0,        // 1-2 sightings
      no_value: 0,         // 0 sightings
      avg_sightings: 0
    };

    let totalSightings = 0;

    allIoCs.forEach(ioc => {
      const sightingCount = ioc.sightings.length;
      totalSightings += sightingCount;

      if (sightingCount > 0) {
        metrics.with_sightings++;
      } else {
        metrics.without_sightings++;
      }

      if (sightingCount > 10) {
        metrics.high_value++;
      } else if (sightingCount >= 3) {
        metrics.medium_value++;
      } else if (sightingCount > 0) {
        metrics.low_value++;
      } else {
        metrics.no_value++;
      }
    });

    metrics.avg_sightings = allIoCs.length > 0 
      ? (totalSightings / allIoCs.length).toFixed(2)
      : 0;

    return metrics;
  }

  /**
   * Automatically retire old IoCs
   */
  async autoRetireIoCs(criteria = {}) {
    const maxAge = criteria.max_age_days || 365;
    const minSightings = criteria.min_sightings || 0;

    const allIoCs = await iocRepository.find({ status: 'active' });
    const retired = [];

    for (const ioc of allIoCs) {
      const ageInDays = (new Date() - new Date(ioc.first_seen)) / (1000 * 60 * 60 * 24);
      const recentSightings = this.getRecentSightingsCount(ioc);

      // Retire if too old and no recent activity
      if (ageInDays > maxAge && recentSightings < minSightings) {
        await this.updateLifecycle(ioc.id, 'expired', {
          reason: 'Automatic retirement: exceeded max age with insufficient activity'
        });

        retired.push({
          ioc_id: ioc.id,
          value: ioc.value,
          age_days: ageInDays.toFixed(0),
          recent_sightings: recentSightings
        });
      }
    }

    return {
      total_evaluated: allIoCs.length,
      retired: retired.length,
      details: retired
    };
  }

  /**
   * Deprecate IoC with replacement
   */
  async deprecateWithReplacement(iocId, replacementIocId, reason = null) {
    const ioc = await iocRepository.findById(iocId);
    const replacement = await iocRepository.findById(replacementIocId);

    if (!ioc) {
      throw new Error('Original IoC not found');
    }

    if (!replacement) {
      throw new Error('Replacement IoC not found');
    }

    // Update original IoC
    await this.updateLifecycle(iocId, 'deprecated', {
      reason: reason || `Replaced by ${replacement.value}`
    });

    // Add metadata about replacement
    ioc.metadata.deprecated_by = replacementIocId;
    ioc.metadata.deprecated_at = new Date();
    await iocRepository.update(iocId, ioc);

    // Add metadata to replacement
    replacement.metadata.replaces = iocId;
    await iocRepository.update(replacementIocId, replacement);

    return {
      deprecated_ioc: ioc.id,
      replacement_ioc: replacement.id,
      deprecated_at: new Date()
    };
  }

  /**
   * Get lifecycle statistics
   */
  async getLifecycleStats() {
    const allIoCs = await iocRepository.find();

    const stats = {
      total: allIoCs.length,
      by_status: {
        active: 0,
        inactive: 0,
        expired: 0,
        deprecated: 0
      },
      by_stage: {
        new: 0,
        established: 0,
        mature: 0,
        aging: 0,
        highly_active: 0,
        inactive: 0,
        deprecated: 0,
        expired: 0
      },
      expiring_soon: 0  // Next 30 days
    };

    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    allIoCs.forEach(ioc => {
      // By status
      stats.by_status[ioc.status]++;

      // By stage
      const stage = this.determineLifecycleStage(ioc);
      stats.by_stage[stage]++;

      // Expiring soon
      if (ioc.expiration && new Date(ioc.expiration) <= thirtyDaysFromNow && new Date(ioc.expiration) > new Date()) {
        stats.expiring_soon++;
      }
    });

    return stats;
  }
}

module.exports = new LifecycleService();
