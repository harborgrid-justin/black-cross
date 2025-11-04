import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { BaseController } from '../common/base.controller';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController extends BaseController<any> {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  getService() {
    return this.notificationsService;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for notifications module' })
  getHealth() {
    return {
      module: 'notifications',
      status: 'operational',
      version: '1.0.0',
      subFeatures: ['email-notifications', 'webhook-integration', 'alert-routing', 'escalation', 'notification-templates', 'delivery-tracking'],
    };
  }
}
