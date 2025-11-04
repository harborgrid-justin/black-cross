import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThreatActorsService } from './threat-actors.service';
import { BaseController } from '../common/base.controller';

@ApiTags('threat-actors')
@Controller('threat-actors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThreatActorsController extends BaseController<any> {
  constructor(private readonly threatactorsService: ThreatActorsService) {
    super();
  }

  getService() {
    return this.threatactorsService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for threat-actors module' })
  getHealth() {
    return {
      module: 'threat-actors',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'actor-profiling',
        'ttp-tracking',
        'campaign-analysis',
        'attribution',
        'intelligence-gathering',
        'relationship-mapping',
      ],
    };
  }
}
