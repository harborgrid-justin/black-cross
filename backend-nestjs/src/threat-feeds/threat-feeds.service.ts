import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';

@Injectable()
export class ThreatFeedsService extends BaseService<any> {
  getRepository() {
    // Return repository when implemented
    return null;
  }

  // Additional threat-feeds specific methods can be added here
}
