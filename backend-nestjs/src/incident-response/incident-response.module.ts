import { Module } from '@nestjs/common';
import { IncidentResponseController } from './incident-response.controller';
import { IncidentResponseService } from './incident-response.service';

@Module({
  controllers: [IncidentResponseController],
  providers: [IncidentResponseService],
})
export class IncidentResponseModule {}
