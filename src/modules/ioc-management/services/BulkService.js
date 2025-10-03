/**
 * Bulk IoC Import/Export Service
 * 
 * Sub-feature 7.6: Bulk IoC Import/Export
 * Handles large-scale IoC operations and batch processing
 */

const { iocRepository } = require('../repositories');
const formatService = require('./FormatService');

class BulkService {
  /**
   * Bulk import IoCs
   */
  async bulkImport(data, options = {}) {
    const {
      format = 'json',
      source = null,
      validate = true,
      skip_duplicates = true,
      update_existing = false
    } = options;

    const results = {
      total: 0,
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      progress: 0
    };

    try {
      // Parse data based on format
      const iocsData = await formatService.parseFormat(data, format);
      results.total = iocsData.length;

      // Process each IoC
      for (let i = 0; i < iocsData.length; i++) {
        const iocData = iocsData[i];
        
        try {
          // Add source info if provided
          if (source) {
            iocData.sources = iocData.sources || [];
            iocData.sources.push({
              name: source,
              imported_at: new Date()
            });
          }

          // Check for duplicates
          const existing = await iocRepository.findByValue(iocData.value, iocData.type);

          if (existing) {
            if (skip_duplicates && !update_existing) {
              results.skipped++;
              continue;
            }

            if (update_existing) {
              await iocRepository.update(existing.id, {
                ...iocData,
                sources: [...existing.sources, ...(iocData.sources || [])],
                tags: [...new Set([...existing.tags, ...(iocData.tags || [])])],
                updated_at: new Date()
              });
              results.updated++;
              continue;
            }
          }

          // Create new IoC
          await iocRepository.create(iocData);
          results.imported++;

        } catch (error) {
          results.failed++;
          results.errors.push({
            index: i,
            data: iocData,
            error: error.message
          });
        }

        // Update progress
        results.progress = ((i + 1) / results.total * 100).toFixed(2);
      }

      return {
        success: true,
        ...results,
        completed_at: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        ...results
      };
    }
  }

  /**
   * Bulk export IoCs
   */
  async bulkExport(criteria = {}, options = {}) {
    const {
      format = 'json',
      fields = null,
      include_enrichment = true,
      include_sightings = false
    } = options;

    try {
      // Find IoCs matching criteria
      let iocs = await iocRepository.find(criteria);

      // Filter fields if specified
      if (fields && Array.isArray(fields)) {
        iocs = iocs.map(ioc => {
          const filtered = {};
          fields.forEach(field => {
            if (ioc[field] !== undefined) {
              filtered[field] = ioc[field];
            }
          });
          return filtered;
        });
      } else {
        // Convert to JSON format
        iocs = iocs.map(ioc => {
          const json = ioc.toJSON ? ioc.toJSON() : ioc;
          
          // Optionally exclude enrichment
          if (!include_enrichment) {
            delete json.enrichment;
          }
          
          // Optionally exclude sightings
          if (!include_sightings) {
            delete json.sightings;
          }
          
          return json;
        });
      }

      // Convert to requested format
      const exportData = await formatService.convertFormat(iocs, format);

      return {
        success: true,
        format,
        count: iocs.length,
        data: exportData,
        exported_at: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create sharing list for export
   */
  async createSharingList(name, criteria = {}, options = {}) {
    const iocs = await iocRepository.find(criteria);

    const sharingList = {
      name,
      created_at: new Date(),
      count: iocs.length,
      criteria,
      iocs: iocs.map(ioc => ({
        value: ioc.value,
        type: ioc.type,
        confidence: ioc.confidence,
        severity: ioc.severity,
        tags: ioc.tags,
        ...options.include_enrichment && { enrichment: ioc.enrichment }
      }))
    };

    return sharingList;
  }

  /**
   * Batch update IoCs
   */
  async batchUpdate(criteria, updates) {
    const iocs = await iocRepository.find(criteria);
    const results = {
      total: iocs.length,
      updated: 0,
      failed: 0,
      errors: []
    };

    for (const ioc of iocs) {
      try {
        await iocRepository.update(ioc.id, {
          ...updates,
          updated_at: new Date()
        });
        results.updated++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          ioc_id: ioc.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Batch delete IoCs
   */
  async batchDelete(criteria) {
    const iocs = await iocRepository.find(criteria);
    const results = {
      total: iocs.length,
      deleted: 0,
      failed: 0,
      errors: []
    };

    for (const ioc of iocs) {
      try {
        await iocRepository.delete(ioc.id);
        results.deleted++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          ioc_id: ioc.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Track bulk operation progress
   */
  async getOperationProgress(operationId) {
    // Mock progress tracking
    // In production, this would track actual async operations
    return {
      operation_id: operationId,
      status: 'completed',
      progress: 100,
      started_at: new Date(Date.now() - 60000),
      completed_at: new Date(),
      results: {
        total: 1000,
        processed: 1000,
        succeeded: 950,
        failed: 50
      }
    };
  }

  /**
   * Validate bulk import data before processing
   */
  async validateBulkData(data, format) {
    const results = {
      valid: true,
      total: 0,
      validation_errors: [],
      format_errors: []
    };

    try {
      // Parse format
      const iocsData = await formatService.parseFormat(data, format);
      results.total = iocsData.length;

      // Validate each IoC
      for (let i = 0; i < iocsData.length; i++) {
        const iocData = iocsData[i];
        
        if (!iocData.value) {
          results.valid = false;
          results.validation_errors.push({
            index: i,
            error: 'Missing required field: value'
          });
        }

        if (!iocData.type) {
          results.valid = false;
          results.validation_errors.push({
            index: i,
            error: 'Missing required field: type'
          });
        }
      }

    } catch (error) {
      results.valid = false;
      results.format_errors.push({
        error: error.message
      });
    }

    return results;
  }

  /**
   * Generate import template
   */
  async generateTemplate(format, includeExamples = true) {
    const template = {
      format,
      version: '1.0',
      fields: {
        required: ['value', 'type'],
        optional: ['confidence', 'severity', 'status', 'tags', 'sources']
      }
    };

    if (includeExamples) {
      template.examples = [
        {
          value: '192.168.1.1',
          type: 'ip',
          confidence: 75,
          severity: 'medium',
          status: 'active',
          tags: ['malware', 'c2'],
          sources: [{ name: 'Example Feed', reliability: 80 }]
        },
        {
          value: 'malicious.example.com',
          type: 'domain',
          confidence: 85,
          severity: 'high',
          status: 'active',
          tags: ['phishing'],
          sources: [{ name: 'Manual Entry', reliability: 100 }]
        }
      ];
    }

    return await formatService.convertFormat(template, format);
  }

  /**
   * Get bulk operation statistics
   */
  async getBulkStats() {
    const stats = await iocRepository.getStats();

    return {
      ...stats,
      bulk_capabilities: {
        max_import_size: 100000,
        max_export_size: 100000,
        supported_formats: ['json', 'csv', 'stix', 'openioc', 'plain'],
        batch_operations: ['import', 'export', 'update', 'delete']
      }
    };
  }
}

module.exports = new BulkService();
