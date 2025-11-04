import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AutomationService } from './automation.service';
import { BaseController } from '../common/base.controller';

@ApiTags('automation')
@Controller('automation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AutomationController extends BaseController<any> {
  constructor(private readonly automationService: AutomationService) {
    super();
  }

  getService() {
    return this.automationService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for automation module' })
  getHealth() {
    return {
      module: 'automation',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'playbook-execution',
        'workflow-automation',
        'orchestration',
        'api-integration',
        'scheduling',
        'event-triggers',
      ],
    };
  }
}
