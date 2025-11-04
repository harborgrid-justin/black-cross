import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MetricsService } from './metrics.service';
import { BaseController } from '../common/base.controller';

@ApiTags('metrics')
@Controller('metrics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MetricsController extends BaseController<any> {
  constructor(private readonly metricsService: MetricsService) {
    super();
  }

  getService() {
    return this.metricsService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for metrics module' })
  getHealth() {
    return {
      module: 'metrics',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'performance-metrics',
        'usage-analytics',
        'kpi-tracking',
        'trend-analysis',
        'dashboards',
        'export',
      ],
    };
  }
}
