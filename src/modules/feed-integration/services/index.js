/**
 * Feed Integration Services Export
 */

const feedAggregationService = require('./FeedAggregationService');
const parsingService = require('./ParsingService');
const deduplicationService = require('./DeduplicationService');
const feedReliabilityService = require('./FeedReliabilityService');
const customFeedService = require('./CustomFeedService');
const feedSchedulingService = require('./FeedSchedulingService');
const feedSourceManagementService = require('./FeedSourceManagementService');

module.exports = {
  feedAggregationService,
  parsingService,
  deduplicationService,
  feedReliabilityService,
  customFeedService,
  feedSchedulingService,
  feedSourceManagementService
};
