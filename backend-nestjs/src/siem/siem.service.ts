import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';

@Injectable()
export class SiemService extends BaseService<any> {
  getRepository() {
    // Return repository when implemented
    return null;
  }

  // Additional siem specific methods can be added here
}
