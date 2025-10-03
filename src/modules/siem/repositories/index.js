/**
 * SIEM Repositories Export
 */

module.exports = {
  securityEventRepository: require('./SecurityEventRepository'),
  logSourceRepository: require('./LogSourceRepository'),
  alertRepository: require('./AlertRepository'),
  detectionRuleRepository: require('./DetectionRuleRepository'),
  correlationRuleRepository: require('./CorrelationRuleRepository'),
  dashboardRepository: require('./DashboardRepository'),
  forensicSessionRepository: require('./ForensicSessionRepository'),
  complianceReportRepository: require('./ComplianceReportRepository')
};
