import { Module } from '@nestjs/common';
import { ThreatFeedsController } from './threat-feeds.controller';
import { ThreatFeedsService } from './threat-feeds.service';

@Module({
  controllers: [ThreatFeedsController],
  providers: [ThreatFeedsService]
})
export class ThreatFeedsModule {}
