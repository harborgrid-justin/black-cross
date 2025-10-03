/**
 * SIEM Services Export
 */

module.exports = {
  logCollectionService: require('./LogCollectionService'),
  eventCorrelationService: require('./EventCorrelationService'),
  ruleEngineService: require('./RuleEngineService'),
  alertManagementService: require('./AlertManagementService'),
  dashboardService: require('./DashboardService'),
  forensicAnalysisService: require('./ForensicAnalysisService'),
  complianceReportingService: require('./ComplianceReportingService')
};
