import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ThreatIntelligenceModule } from './threat-intelligence/threat-intelligence.module';
import { IncidentResponseModule } from './incident-response/incident-response.module';
import { ThreatHuntingModule } from './threat-hunting/threat-hunting.module';
import { VulnerabilityManagementModule } from './vulnerability-management/vulnerability-management.module';
import { SiemModule } from './siem/siem.module';
import { ThreatActorsModule } from './threat-actors/threat-actors.module';
import { IocManagementModule } from './ioc-management/ioc-management.module';
import { ThreatFeedsModule } from './threat-feeds/threat-feeds.module';
import { RiskAssessmentModule } from './risk-assessment/risk-assessment.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { ReportingModule } from './reporting/reporting.module';
import { MalwareAnalysisModule } from './malware-analysis/malware-analysis.module';
import { DarkWebModule } from './dark-web/dark-web.module';
import { ComplianceModule } from './compliance/compliance.module';
import { AutomationModule } from './automation/automation.module';
import { CodeReviewModule } from './code-review/code-review.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CaseManagementModule } from './case-management/case-management.module';
import { MetricsModule } from './metrics/metrics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DraftWorkspaceModule } from './draft-workspace/draft-workspace.module';

@Module({
  imports: [ConfigModule, AuthModule, DatabaseModule, ThreatIntelligenceModule, IncidentResponseModule, ThreatHuntingModule, VulnerabilityManagementModule, SiemModule, ThreatActorsModule, IocManagementModule, ThreatFeedsModule, RiskAssessmentModule, CollaborationModule, ReportingModule, MalwareAnalysisModule, DarkWebModule, ComplianceModule, AutomationModule, CodeReviewModule, NotificationsModule, CaseManagementModule, MetricsModule, DashboardModule, DraftWorkspaceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
