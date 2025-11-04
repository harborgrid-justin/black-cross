import { Module } from '@nestjs/common';
import { DraftWorkspaceController } from './draft-workspace.controller';
import { DraftWorkspaceService } from './draft-workspace.service';

@Module({
  controllers: [DraftWorkspaceController],
  providers: [DraftWorkspaceService]
})
export class DraftWorkspaceModule {}
