import { Module } from '@nestjs/common';
import { ThreatHuntingController } from './threat-hunting.controller';
import { ThreatHuntingService } from './threat-hunting.service';

@Module({
  controllers: [ThreatHuntingController],
  providers: [ThreatHuntingService],
})
export class ThreatHuntingModule {}
