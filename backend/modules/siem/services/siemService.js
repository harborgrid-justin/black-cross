const SiemEvent = require('../models/SiemEvent');
const logger = require('../utils/logger');

class SiemService {
  async create(data) {
    const item = new SiemEvent(data);
    await item.save();
    logger.info(`SiemEvent created: ${item.name}`);
    return item;
  }

  async getById(id) {
    const item = await SiemEvent.findOne({ id });
    if (!item) throw new Error('SiemEvent not found');
    return item;
  }

  async list(filters = {}) {
    return SiemEvent.find(filters).sort('-created_at');
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

module.exports = new SiemService();
