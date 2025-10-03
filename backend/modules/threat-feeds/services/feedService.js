const ThreatFeed = require('../models/ThreatFeed');
const logger = require('../utils/logger');

class FeedService {
  async create(data) {
    const item = new ThreatFeed(data);
    await item.save();
    logger.info(`ThreatFeed created: ${item.name}`);
    return item;
  }

  async getById(id) {
    const item = await ThreatFeed.findOne({ id });
    if (!item) throw new Error('ThreatFeed not found');
    return item;
  }

  async list(filters = {}) {
    return await ThreatFeed.find(filters).sort('-created_at');
  }

  async update(id, updates) {
    const item = await this.getById(id);
    Object.assign(item, updates);
    await item.save();
    return item;
  }

  async delete(id) {
    const item = await this.getById(id);
    await item.remove();
    return { deleted: true, id };
  }
}

module.exports = new FeedService();
