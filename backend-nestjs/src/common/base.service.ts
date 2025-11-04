import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T> {
  abstract getRepository(): any;

  async findAll(page: number = 1, limit: number = 20, filters: any = {}) {
    const repository = this.getRepository();
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await repository.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<T> {
    const repository = this.getRepository();
    const item = await repository.findByPk(id);

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async create(createDto: any): Promise<T> {
    const repository = this.getRepository();
    return await repository.create(createDto);
  }

  async update(id: string, updateDto: any): Promise<T> {
    const repository = this.getRepository();
    const item: any = await this.findOne(id);

    await item.update(updateDto);
    return item;
  }

  async remove(id: string): Promise<void> {
    const item: any = await this.findOne(id);
    await item.destroy();
  }
}
