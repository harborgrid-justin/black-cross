/**
 * IoC Management Services
 */

const collectionService = require('./CollectionService');
const formatService = require('./FormatService');
const confidenceService = require('./ConfidenceService');
const enrichmentService = require('./EnrichmentService');
const lifecycleService = require('./LifecycleService');
const bulkService = require('./BulkService');
const searchService = require('./SearchService');

module.exports = {
  collectionService,
  formatService,
  confidenceService,
  enrichmentService,
  lifecycleService,
  bulkService,
  searchService
};
