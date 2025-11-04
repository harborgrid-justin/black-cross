import { Module } from '@nestjs/common';
import { CaseManagementController } from './case-management.controller';
import { CaseManagementService } from './case-management.service';

@Module({
  controllers: [CaseManagementController],
  providers: [CaseManagementService]
})
export class CaseManagementModule {}
