import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaseManagementService } from './case-management.service';
import { BaseController } from '../common/base.controller';

@ApiTags('case-management')
@Controller('case-management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CaseManagementController extends BaseController<any> {
  constructor(private readonly casemanagementService: CaseManagementService) {
    super();
  }

  getService() {
    return this.casemanagementService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for case-management module' })
  getHealth() {
    return {
      module: 'case-management',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'case-creation',
        'investigation-tracking',
        'evidence-management',
        'workflow',
        'collaboration',
        'reporting',
      ],
    };
  }
}
