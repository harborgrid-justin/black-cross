import SiemEvent from '../models/SiemEvent';
import logger from '../utils/logger';

class SiemService {
  async create(data: any) {
    const item = new SiemEvent(data);
    await item.save();
    logger.info(`Item created: ${item.id}`);
    return item;
  }

  async getById(id: string) {
    const item = await SiemEvent.findOne({ id });
    if (!item) throw new Error('SiemEvent not found');
    return item;
  }

  async list(filters: Record<string, any> = {}) {
    return SiemEvent.find(filters).sort('-created_at');
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

export default new SiemService();

