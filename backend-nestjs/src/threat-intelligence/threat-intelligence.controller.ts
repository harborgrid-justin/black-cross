import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThreatIntelligenceService } from './threat-intelligence.service';
import { BaseController } from '../common/base.controller';

@ApiTags('threat-intelligence')
@Controller('threat-intelligence')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThreatIntelligenceController extends BaseController<any> {
  constructor(
    private readonly threatIntelligenceService: ThreatIntelligenceService,
  ) {
    super();
  }

  getService() {
    return this.threatIntelligenceService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for threat intelligence module' })
  getHealth() {
    return {
      module: 'threat-intelligence',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'real-time-collection',
        'categorization',
        'archival',
        'enrichment',
        'taxonomy-management',
        'correlation',
        'context-analysis',
      ],
    };
  }
}
