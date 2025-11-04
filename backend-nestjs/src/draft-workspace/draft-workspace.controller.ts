import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DraftWorkspaceService } from './draft-workspace.service';
import { BaseController } from '../common/base.controller';

@ApiTags('draft-workspace')
@Controller('draft-workspace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DraftWorkspaceController extends BaseController<any> {
  constructor(private readonly draftworkspaceService: DraftWorkspaceService) {
    super();
  }

  getService() {
    return this.draftworkspaceService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for draft-workspace module' })
  getHealth() {
    return {
      module: 'draft-workspace',
      status: 'operational',
      version: '1.0.0',
      subFeatures: ['draft-management', 'auto-save', 'versioning', 'collaboration', 'publishing', 'preview'],
    };
  }
}
