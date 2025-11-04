import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CodeReviewService } from './code-review.service';
import { BaseController } from '../common/base.controller';

@ApiTags('code-review')
@Controller('code-review')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CodeReviewController extends BaseController<any> {
  constructor(private readonly codereviewService: CodeReviewService) {
    super();
  }

  getService() {
    return this.codereviewService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for code-review module' })
  getHealth() {
    return {
      module: 'code-review',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'static-analysis',
        'security-scanning',
        'vulnerability-detection',
        'code-quality',
        'recommendations',
        'reporting',
      ],
    };
  }
}
