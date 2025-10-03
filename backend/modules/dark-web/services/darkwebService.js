const DarkWebIntel = require('../models/DarkWebIntel');
const logger = require('../utils/logger');

class DarkwebService {
  async create(data) {
    const item = new DarkWebIntel(data);
    await item.save();
    logger.info(`DarkWebIntel created: ${item.name}`);
    return item;
  }

  async getById(id) {
    const item = await DarkWebIntel.findOne({ id });
    if (!item) throw new Error('DarkWebIntel not found');
    return item;
  }

  async list(filters = {}) {
    return await DarkWebIntel.find(filters).sort('-created_at');
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

module.exports = new DarkwebService();
