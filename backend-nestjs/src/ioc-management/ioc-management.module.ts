import { Module } from '@nestjs/common';
import { IocManagementController } from './ioc-management.controller';
import { IocManagementService } from './ioc-management.service';

@Module({
  controllers: [IocManagementController],
  providers: [IocManagementService]
})
export class IocManagementModule {}
