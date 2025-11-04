import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { BaseController } from '../common/base.controller';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController extends BaseController<any> {
  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  getService() {
    return this.dashboardService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for dashboard module' })
  getHealth() {
    return {
      module: 'dashboard',
      status: 'operational',
      version: '1.0.0',
      subFeatures: ['overview', 'widgets', 'customization', 'real-time-updates', 'charts', 'statistics'],
    };
  }
}
