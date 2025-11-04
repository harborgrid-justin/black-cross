import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SiemService } from './siem.service';
import { BaseController } from '../common/base.controller';

@ApiTags('siem')
@Controller('siem')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SiemController extends BaseController<any> {
  constructor(private readonly siemService: SiemService) {
    super();
  }

  getService() {
    return this.siemService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for siem module' })
  getHealth() {
    return {
      module: 'siem',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'log-collection',
        'event-correlation',
        'alert-generation',
        'dashboard',
        'search',
        'real-time-monitoring',
      ],
    };
  }
}
