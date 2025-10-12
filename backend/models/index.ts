/**
 * Sequelize Models Index
 * Central export for all database models
 */

import User from './User';
import Incident from './Incident';
import Vulnerability from './Vulnerability';
import Asset from './Asset';
import AuditLog from './AuditLog';
import IOC from './IOC';
import ThreatActor from './ThreatActor';
import PlaybookExecution from './PlaybookExecution';

// Export all models
export {
  User,
  Incident,
  Vulnerability,
  Asset,
  AuditLog,
  IOC,
  ThreatActor,
  PlaybookExecution,
};

// Export model array for initialization
export const models = [
  User,
  Incident,
  Vulnerability,
  Asset,
  AuditLog,
  IOC,
  ThreatActor,
  PlaybookExecution,
];

export default {
  User,
  Incident,
  Vulnerability,
  Asset,
  AuditLog,
  IOC,
  ThreatActor,
  PlaybookExecution,
};
