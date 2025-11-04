import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RiskAssessmentService } from './risk-assessment.service';
import { BaseController } from '../common/base.controller';

@ApiTags('risk-assessment')
@Controller('risk-assessment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RiskAssessmentController extends BaseController<any> {
  constructor(private readonly riskassessmentService: RiskAssessmentService) {
    super();
  }

  getService() {
    return this.riskassessmentService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for risk-assessment module' })
  getHealth() {
    return {
      module: 'risk-assessment',
      status: 'operational',
      version: '1.0.0',
      subFeatures: ['risk-scoring', 'impact-analysis', 'likelihood-assessment', 'risk-matrix', 'mitigation-planning', 'reporting'],
    };
  }
}
