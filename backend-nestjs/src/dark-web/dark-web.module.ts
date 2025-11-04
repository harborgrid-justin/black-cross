import { Module } from '@nestjs/common';
import { DarkWebController } from './dark-web.controller';
import { DarkWebService } from './dark-web.service';

@Module({
  controllers: [DarkWebController],
  providers: [DarkWebService],
})
export class DarkWebModule {}
