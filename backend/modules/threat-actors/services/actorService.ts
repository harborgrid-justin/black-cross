import ThreatActor from '../models/ThreatActor';
import logger from '../utils/logger';

class ActorService {
  async create(data: any) {
    const item = new ThreatActor(data);
    await item.save();
    logger.info(`Item created: ${item.id}`);
    return item;
  }

  async getById(id: string) {
    const item = await ThreatActor.findOne({ id });
    if (!item) throw new Error('ThreatActor not found');
    return item;
  }

  async list(filters: Record<string, any> = {}) {
    return ThreatActor.find(filters).sort('-created_at');
  }

  async update(id: string, updates: any) {
    const item = await this.getById(id);
    Object.assign(item, updates);
    await item.save();
    return item;
  }

  async delete(id: string) {
    const item = await this.getById(id);
    await item.deleteOne();
    return { deleted: true, id };
  }
}

export default new ActorService();

