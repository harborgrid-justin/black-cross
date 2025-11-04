import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComplianceService } from './compliance.service';
import { BaseController } from '../common/base.controller';

@ApiTags('compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ComplianceController extends BaseController<any> {
  constructor(private readonly complianceService: ComplianceService) {
    super();
  }

  getService() {
    return this.complianceService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for compliance module' })
  getHealth() {
    return {
      module: 'compliance',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'framework-mapping',
        'control-tracking',
        'audit-management',
        'evidence-collection',
        'gap-analysis',
        'reporting',
      ],
    };
  }
}
