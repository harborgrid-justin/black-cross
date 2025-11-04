import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollaborationService } from './collaboration.service';
import { BaseController } from '../common/base.controller';

@ApiTags('collaboration')
@Controller('collaboration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollaborationController extends BaseController<any> {
  constructor(private readonly collaborationService: CollaborationService) {
    super();
  }

  getService() {
    return this.collaborationService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for collaboration module' })
  getHealth() {
    return {
      module: 'collaboration',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'team-chat',
        'task-assignment',
        'file-sharing',
        'notifications',
        'workflow-management',
        'audit-trail',
      ],
    };
  }
}
