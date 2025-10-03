/**
 * IoC Collection and Validation Service
 * 
 * Sub-feature 7.1: IoC Collection and Validation
 * Handles multi-source IoC ingestion, validation, and duplicate detection
 */

const { iocRepository, sourceRepository } = require('../repositories');
const { IoC } = require('../models');

class CollectionService {
  /**
   * Ingest IoCs from external sources
   */
  async ingestIoCs(iocsData, sourceInfo = {}) {
    const results = {
      ingested: [],
      duplicates: [],
      invalid: [],
      errors: []
    };

    // Get or create source
    let source = null;
    if (sourceInfo.name) {
      source = await sourceRepository.findByName(sourceInfo.name);
      if (!source) {
        source = await sourceRepository.create(sourceInfo);
      }
    }

    for (const iocData of iocsData) {
      try {
        // Create IoC instance for validation
        const ioc = new IoC(iocData);
        
        // Add source info
        if (source) {
          ioc.sources.push({
            id: source.id,
            name: source.name,
            reliability: source.reliability,
            ingested_at: new Date()
          });
        }

        // Validate
        const validation = ioc.validate();
        if (!validation.valid) {
          results.invalid.push({
            value: ioc.value,
            type: ioc.type,
            errors: validation.errors
          });
          continue;
        }

        // Check for duplicates
        const existing = await iocRepository.findByValue(ioc.value, ioc.type);
        if (existing) {
          // Merge sources and sightings
          existing.sources.push(...ioc.sources);
          existing.last_seen = new Date();
          await iocRepository.update(existing.id, existing);
          
          results.duplicates.push({
            id: existing.id,
            value: existing.value,
            type: existing.type
          });
          continue;
        }

        // Create new IoC
        const created = await iocRepository.create(ioc);
        
        // Update source stats
        if (source) {
          source.incrementIoCCount();
          await sourceRepository.update(source.id, source);
        }

        results.ingested.push(created.toJSON());
      } catch (error) {
        results.errors.push({
          data: iocData,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Validate a single IoC
   */
  async validateIoC(iocData) {
    const ioc = new IoC(iocData);
    const validation = ioc.validate();

    // Check for duplicates
    let duplicate = null;
    if (validation.valid) {
      const existing = await iocRepository.findByValue(ioc.value, ioc.type);
      if (existing) {
        duplicate = {
          id: existing.id,
          value: existing.value,
          type: existing.type,
          confidence: existing.confidence
        };
      }
    }

    return {
      valid: validation.valid,
      errors: validation.errors,
      duplicate,
      normalized_value: ioc.value,
      detected_type: ioc.type
    };
  }

  /**
   * Batch validate IoCs
   */
  async batchValidate(iocsData) {
    const results = {
      valid: [],
      invalid: [],
      duplicates: []
    };

    for (const iocData of iocsData) {
      const validation = await this.validateIoC(iocData);
      
      if (validation.valid && !validation.duplicate) {
        results.valid.push(iocData);
      } else if (!validation.valid) {
        results.invalid.push({
          data: iocData,
          errors: validation.errors
        });
      } else if (validation.duplicate) {
        results.duplicates.push({
          data: iocData,
          duplicate: validation.duplicate
        });
      }
    }

    return results;
  }

  /**
   * Detect duplicates in the database
   */
  async detectDuplicates() {
    return await iocRepository.findDuplicates();
  }

  /**
   * Track IoC age
   */
  async getAgeAnalysis() {
    const allIoCs = await iocRepository.find();
    const now = new Date();

    const ageGroups = {
      fresh: 0,        // < 7 days
      recent: 0,       // 7-30 days
      moderate: 0,     // 30-90 days
      aged: 0,         // 90-365 days
      stale: 0         // > 365 days
    };

    allIoCs.forEach(ioc => {
      const ageInDays = (now - new Date(ioc.first_seen)) / (1000 * 60 * 60 * 24);
      
      if (ageInDays < 7) {
        ageGroups.fresh++;
      } else if (ageInDays < 30) {
        ageGroups.recent++;
      } else if (ageInDays < 90) {
        ageGroups.moderate++;
      } else if (ageInDays < 365) {
        ageGroups.aged++;
      } else {
        ageGroups.stale++;
      }
    });

    return {
      total: allIoCs.length,
      age_groups: ageGroups,
      avg_age_days: allIoCs.length > 0
        ? (allIoCs.reduce((sum, ioc) => {
            return sum + ((now - new Date(ioc.first_seen)) / (1000 * 60 * 60 * 24));
          }, 0) / allIoCs.length).toFixed(2)
        : 0
    };
  }

  /**
   * Get source reliability tracking
   */
  async getSourceReliability() {
    const sources = await sourceRepository.findAll();
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      reliability: source.reliability,
      ioc_count: source.ioc_count,
      active: source.active,
      last_updated: source.last_updated
    })).sort((a, b) => b.reliability - a.reliability);
  }
}

module.exports = new CollectionService();
