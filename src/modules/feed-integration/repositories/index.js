/**
 * Feed Integration Repositories Export
 */

const feedSourceRepository = require('./FeedSourceRepository');
const feedItemRepository = require('./FeedItemRepository');
const customFeedRepository = require('./CustomFeedRepository');

module.exports = {
  feedSourceRepository,
  feedItemRepository,
  customFeedRepository
};
