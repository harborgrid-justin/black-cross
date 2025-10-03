const Workspace = require('../models/Workspace');
const logger = require('../utils/logger');

class CollaborationService {
  async create(data) {
    const item = new Workspace(data);
    await item.save();
    logger.info(`Workspace created: ${item.name}`);
    return item;
  }

  async getById(id) {
    const item = await Workspace.findOne({ id });
    if (!item) throw new Error('Workspace not found');
    return item;
  }

  async list(filters = {}) {
    return await Workspace.find(filters).sort('-created_at');
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

module.exports = new CollaborationService();
