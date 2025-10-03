const Report = require('../models/Report');
const logger = require('../utils/logger');

class ReportService {
  async create(data) {
    const item = new Report(data);
    await item.save();
    logger.info(`Report created: ${item.name}`);
    return item;
  }

  async getById(id) {
    const item = await Report.findOne({ id });
    if (!item) throw new Error('Report not found');
    return item;
  }

  async list(filters = {}) {
    return Report.find(filters).sort('-created_at');
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

module.exports = new ReportService();
