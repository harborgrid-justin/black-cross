/**
 * SIEM Models Export
 */

module.exports = {
  SecurityEvent: require('./SecurityEvent'),
  LogSource: require('./LogSource'),
  Alert: require('./Alert'),
  DetectionRule: require('./DetectionRule'),
  CorrelationRule: require('./CorrelationRule'),
  Dashboard: require('./Dashboard'),
  ForensicSession: require('./ForensicSession'),
  ComplianceReport: require('./ComplianceReport')
};
