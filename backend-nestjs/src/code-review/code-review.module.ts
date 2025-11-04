import { Module } from '@nestjs/common';
import { CodeReviewController } from './code-review.controller';
import { CodeReviewService } from './code-review.service';

@Module({
  controllers: [CodeReviewController],
  providers: [CodeReviewService]
})
export class CodeReviewModule {}
