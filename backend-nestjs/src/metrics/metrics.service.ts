import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';

@Injectable()
export class MetricsService extends BaseService<any> {
  getRepository() {
    // Return repository when implemented
    return null;
  }

  // Additional metrics specific methods can be added here
}
