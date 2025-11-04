import { Module } from '@nestjs/common';
import { ThreatActorsController } from './threat-actors.controller';
import { ThreatActorsService } from './threat-actors.service';

@Module({
  controllers: [ThreatActorsController],
  providers: [ThreatActorsService]
})
export class ThreatActorsModule {}
