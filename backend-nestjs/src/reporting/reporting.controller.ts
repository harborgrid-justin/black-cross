import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportingService } from './reporting.service';
import { BaseController } from '../common/base.controller';

@ApiTags('reporting')
@Controller('reporting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportingController extends BaseController<any> {
  constructor(private readonly reportingService: ReportingService) {
    super();
  }

  getService() {
    return this.reportingService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for reporting module' })
  getHealth() {
    return {
      module: 'reporting',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'report-generation',
        'templates',
        'scheduling',
        'export',
        'visualizations',
        'executive-summaries',
      ],
    };
  }
}
