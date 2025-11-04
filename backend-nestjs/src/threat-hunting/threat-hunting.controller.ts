import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThreatHuntingService } from './threat-hunting.service';
import { BaseController } from '../common/base.controller';

@ApiTags('threat-hunting')
@Controller('threat-hunting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThreatHuntingController extends BaseController<any> {
  constructor(private readonly threathuntingService: ThreatHuntingService) {
    super();
  }

  getService() {
    return this.threathuntingService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for threat-hunting module' })
  getHealth() {
    return {
      module: 'threat-hunting',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'hypothesis-testing',
        'data-analysis',
        'ioc-extraction',
        'threat-detection',
        'hunting-queries',
        'report-generation',
      ],
    };
  }
}
