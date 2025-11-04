import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';

@Injectable()
export class NotificationsService extends BaseService<any> {
  getRepository() {
    // Return repository when implemented
    return null;
  }

  // Additional notifications specific methods can be added here
}
