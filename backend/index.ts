/**
 * Black-Cross Platform
 * Enterprise-grade Cyber Threat Intelligence Platform
 *
 * Main application entry point
 */

import express, {
  Request, Response, NextFunction, Application,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PlatformHealth } from './types';

const app: Application = express();
const PORT = process.env.APP_PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  const health: PlatformHealth = {
    status: 'operational',
    platform: 'Black-Cross',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    modules: {
      threatIntelligence: 'operational',
      incidentResponse: 'operational',
      threatHunting: 'operational',
      vulnerabilityManagement: 'operational',
      siem: 'operational',
      threatActors: 'operational',
      iocManagement: 'operational',
      threatFeeds: 'operational',
      riskAssessment: 'operational',
      collaboration: 'operational',
      reporting: 'operational',
      malwareAnalysis: 'operational',
      darkWeb: 'operational',
      compliance: 'operational',
      automation: 'operational',
    },
  };
  res.json(health);
});

// API routes
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    message: 'Black-Cross API v1.0',
    documentation: '/api/v1/docs',
    features: [
      'Threat Intelligence Management',
      'Incident Response & Management',
      'Threat Hunting Platform',
      'Vulnerability Management',
      'SIEM Integration',
      'Threat Actor Profiling',
      'IoC Management',
      'Threat Intelligence Feeds Integration',
      'Risk Assessment & Scoring',
      'Collaboration & Workflow',
      'Reporting & Analytics',
      'Malware Analysis & Sandbox',
      'Dark Web Monitoring',
      'Compliance & Audit Management',
      'Automated Response & Playbooks',
    ],
  });
});

// Module routes - Keep importing JS modules for backward compatibility
// These will be migrated to TypeScript incrementally
const threatIntelligence = require('./modules/threat-intelligence');
const incidentResponse = require('./modules/incident-response');
const threatHunting = require('./modules/threat-hunting');
const vulnerabilityManagement = require('./modules/vulnerability-management');
const siem = require('./modules/siem');
const threatActors = require('./modules/threat-actors');
const iocManagement = require('./modules/ioc-management');
const threatFeeds = require('./modules/threat-feeds');
const riskAssessment = require('./modules/risk-assessment');
const collaboration = require('./modules/collaboration');
const reporting = require('./modules/reporting');
const malwareAnalysis = require('./modules/malware-analysis');
const darkWeb = require('./modules/dark-web');
const compliance = require('./modules/compliance');
const automation = require('./modules/automation');

app.use('/api/v1/threat-intelligence', threatIntelligence);
app.use('/api/v1/incidents', incidentResponse);
app.use('/api/v1/hunting', threatHunting);
app.use('/api/v1/vulnerabilities', vulnerabilityManagement);
app.use('/api/v1/siem', siem);
app.use('/api/v1/threat-actors', threatActors);
app.use('/api/v1/iocs', iocManagement);
app.use('/api/v1/feeds', threatFeeds);
app.use('/api/v1/risk', riskAssessment);
app.use('/api/v1/collaboration', collaboration);
app.use('/api/v1/reports', reporting);
app.use('/api/v1/malware', malwareAnalysis);
app.use('/api/v1/darkweb', darkWeb);
app.use('/api/v1/compliance', compliance);
app.use('/api/v1/automation', automation);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                      BLACK-CROSS                             ║
║          Enterprise Cyber Threat Intelligence Platform       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
📍 API: http://localhost:${PORT}/api/v1
💚 Health: http://localhost:${PORT}/health
📚 Docs: http://localhost:${PORT}/api/v1/docs

Features: 15 Primary | 105+ Sub-Features
Status: Operational
Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;
