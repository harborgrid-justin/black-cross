import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IocManagementService } from './ioc-management.service';
import { BaseController } from '../common/base.controller';

@ApiTags('ioc-management')
@Controller('ioc-management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IocManagementController extends BaseController<any> {
  constructor(private readonly iocmanagementService: IocManagementService) {
    super();
  }

  getService() {
    return this.iocmanagementService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for ioc-management module' })
  getHealth() {
    return {
      module: 'ioc-management',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'ioc-collection',
        'validation',
        'enrichment',
        'deduplication',
        'expiration-tracking',
        'bulk-operations',
      ],
    };
  }
}
