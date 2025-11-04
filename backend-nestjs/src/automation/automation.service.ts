import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';

@Injectable()
export class AutomationService extends BaseService<any> {
  getRepository() {
    // Return repository when implemented
    return null;
  }

  // Additional automation specific methods can be added here
}
