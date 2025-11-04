import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';

@Injectable()
export class IocManagementService extends BaseService<any> {
  getRepository() {
    // Return repository when implemented
    return null;
  }

  // Additional ioc-management specific methods can be added here
}
