import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThreatFeedsService } from './threat-feeds.service';
import { BaseController } from '../common/base.controller';

@ApiTags('threat-feeds')
@Controller('threat-feeds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThreatFeedsController extends BaseController<any> {
  constructor(private readonly threatfeedsService: ThreatFeedsService) {
    super();
  }

  getService() {
    return this.threatfeedsService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for threat-feeds module' })
  getHealth() {
    return {
      module: 'threat-feeds',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'feed-integration',
        'data-ingestion',
        'normalization',
        'filtering',
        'scheduling',
        'feed-health-monitoring',
      ],
    };
  }
}
