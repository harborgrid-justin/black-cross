const ThreatActor = require('../models/ThreatActor');
const logger = require('../utils/logger');

class ActorService {
  async create(data) {
    const item = new ThreatActor(data);
    await item.save();
    logger.info(`ThreatActor created: ${item.name}`);
    return item;
  }

  async getById(id) {
    const item = await ThreatActor.findOne({ id });
    if (!item) throw new Error('ThreatActor not found');
    return item;
  }

  async list(filters = {}) {
    return await ThreatActor.find(filters).sort('-created_at');
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

module.exports = new ActorService();
