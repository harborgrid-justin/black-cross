import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DarkWebService } from './dark-web.service';
import { BaseController } from '../common/base.controller';

@ApiTags('dark-web')
@Controller('dark-web')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DarkWebController extends BaseController<any> {
  constructor(private readonly darkwebService: DarkWebService) {
    super();
  }

  getService() {
    return this.darkwebService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for dark-web module' })
  getHealth() {
    return {
      module: 'dark-web',
      status: 'operational',
      version: '1.0.0',
      subFeatures: [
        'monitoring',
        'data-collection',
        'threat-detection',
        'brand-monitoring',
        'credential-tracking',
        'marketplace-tracking',
      ],
    };
  }
}
