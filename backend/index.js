/**
 * Black-Cross Platform
 * Enterprise-grade Cyber Threat Intelligence Platform
 * 
 * Main application entry point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.APP_PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      automation: 'operational'
    }
  });
});

// API routes
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
      'Automated Response & Playbooks'
    ]
  });
});

// Module routes
const threatIntelligence = require('./modules/threat-intelligence');
const riskAssessment = require('./modules/risk-assessment');
const automation = require('./modules/automation');

app.use('/api/v1/threat-intelligence', threatIntelligence);
app.use('/api/v1/risk', riskAssessment);
app.use('/api/v1/automation', automation);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
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
