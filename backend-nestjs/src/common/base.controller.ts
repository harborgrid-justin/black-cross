import { Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export abstract class BaseController<T> {
  abstract getService(): any;

  @Get()
  @ApiOperation({ summary: 'List all items' })
  @ApiResponse({ status: 200, description: 'List retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query() filters: any,
  ) {
    const service = this.getService();
    const result = await service.findAll(page, limit, filters);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    const service = this.getService();
    const data = await service.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  async create(@Body() createDto: any) {
    const service = this.getService();
    const data = await service.create(createDto);
    return {
      success: true,
      data,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    const service = this.getService();
    const data = await service.update(id, updateDto);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async remove(@Param('id') id: string) {
    const service = this.getService();
    await service.remove(id);
    return {
      success: true,
      message: 'Item deleted successfully',
    };
  }
}
