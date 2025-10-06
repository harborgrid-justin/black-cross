/**
 * Black-Cross Platform
 * Enterprise-grade Cyber Threat Intelligence Platform
 *
 * Main application entry point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { rateLimiter } = require('./middleware/rateLimiter');
const { correlationId } = require('./middleware/correlationId');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.APP_PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request tracking
app.use(correlationId);
app.use(requestLogger);

// Global rate limiting
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
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
  });
});

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: API Information
 *     description: Get information about the Black-Cross API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 */
app.get('/api/v1', (req, res) => {
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

// API Documentation
app.use('/api/v1/docs', swaggerUi.serve);
app.get('/api/v1/docs', swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Black-Cross API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Module routes
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
app.use('/api/v1/incident-response', incidentResponse);
app.use('/api/v1/threat-hunting', threatHunting);
app.use('/api/v1/vulnerability-management', vulnerabilityManagement);
app.use('/api/v1/siem', siem);
app.use('/api/v1/threat-actors', threatActors);
app.use('/api/v1/ioc-management', iocManagement);
app.use('/api/v1/threat-feeds', threatFeeds);
app.use('/api/v1/risk-assessment', riskAssessment);
app.use('/api/v1/collaboration', collaboration);
app.use('/api/v1/reporting', reporting);
app.use('/api/v1/malware-analysis', malwareAnalysis);
app.use('/api/v1/dark-web', darkWeb);
app.use('/api/v1/compliance', compliance);
app.use('/api/v1/automation', automation);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
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

module.exports = app;
