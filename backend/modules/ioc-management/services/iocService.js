const IoC = require('../models/IoC');
const logger = require('../utils/logger');

class IocService {
  async create(data) {
    const item = new IoC(data);
    await item.save();
    logger.info(`IoC created: ${item.name}`);
    return item;
  }

  async getById(id) {
    const item = await IoC.findOne({ id });
    if (!item) throw new Error('IoC not found');
    return item;
  }

  async list(filters = {}) {
    return await IoC.find(filters).sort('-created_at');
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

module.exports = new IocService();
