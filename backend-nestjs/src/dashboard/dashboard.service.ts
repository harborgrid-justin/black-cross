import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';

@Injectable()
export class DashboardService extends BaseService<any> {
  getRepository() {
    // Return repository when implemented
    return null;
  }

  // Additional dashboard specific methods can be added here
}
