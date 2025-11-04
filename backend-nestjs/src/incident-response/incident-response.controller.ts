import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IncidentResponseService } from './incident-response.service';
import { BaseController } from '../common/base.controller';

@ApiTags('incident-response')
@Controller('incident-response')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IncidentResponseController extends BaseController<any> {
  constructor(private readonly incidentresponseService: IncidentResponseService) {
    super();
  }

  getService() {
    return this.incidentresponseService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for incident-response module' })
  getHealth() {
    return {
      module: 'incident-response',
      status: 'operational',
      version: '1.0.0',
      subFeatures: ['incident-tracking', 'response-workflow', 'escalation', 'timeline', 'collaboration', 'evidence-management', 'status-tracking'],
    };
  }
}
