const ComplianceFramework = require('../models/ComplianceFramework');
const logger = require('../utils/logger');

class ComplianceService {
  async create(data) {
    const item = new ComplianceFramework(data);
    await item.save();
    logger.info(`ComplianceFramework created: ${item.name}`);
    return item;
  }

  async getById(id) {
    const item = await ComplianceFramework.findOne({ id });
    if (!item) throw new Error('ComplianceFramework not found');
    return item;
  }

  async list(filters = {}) {
    return await ComplianceFramework.find(filters).sort('-created_at');
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

module.exports = new ComplianceService();
