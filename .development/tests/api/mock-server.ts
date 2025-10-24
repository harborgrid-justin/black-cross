/**
 * Mock Backend Server for API Testing
 * 
 * This creates a lightweight Express server that mocks the Black-Cross backend API
 * for testing purposes. It provides mock responses for all 16 modules.
 */

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.MOCK_PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
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
      codeReview: 'operational',
    },
  });
});

// API root
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'Black-Cross API v1.0.0',
    documentation: '/api/v1/docs',
    features: [
      'Threat Intelligence',
      'Incident Response',
      'Threat Hunting',
      'Vulnerability Management',
      'SIEM',
      'Threat Actors',
      'IOC Management',
      'Threat Feeds',
      'Risk Assessment',
      'Collaboration',
      'Reporting',
      'Malware Analysis',
      'Dark Web Monitoring',
      'Compliance',
      'Automation',
      'Code Review',
    ],
  });
});

// Mock endpoints for each module
const modules = [
  'threat-intelligence',
  'incident-response',
  'threat-hunting',
  'vulnerability-management',
  'siem',
  'threat-actors',
  'ioc-management',
  'threat-feeds',
  'risk-assessment',
  'collaboration',
  'reporting',
  'malware-analysis',
  'dark-web',
  'compliance',
  'automation',
  'code-review',
];

// Create GET/POST handlers for each module
modules.forEach((module) => {
  const baseRoute = `/api/v1/${module}`;
  
  // List endpoint
  app.get(baseRoute, (req: Request, res: Response) => {
    res.json({
      success: true,
      data: [],
      total: 0,
      module,
    });
  });
  
  // Create endpoint
  app.post(baseRoute, (req: Request, res: Response) => {
    res.status(201).json({
      success: true,
      data: {
        id: `mock-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      },
    });
  });
  
  // Get by ID
  app.get(`${baseRoute}/:id`, (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        id: req.params.id,
        module,
      },
    });
  });
  
  // Update by ID
  app.put(`${baseRoute}/:id`, (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        id: req.params.id,
        ...req.body,
        updatedAt: new Date().toISOString(),
      },
    });
  });
  
  // Delete by ID
  app.delete(`${baseRoute}/:id`, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Deleted successfully',
    });
  });
  
  // Stats endpoint
  app.get(`${baseRoute}/stats`, (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        total: 0,
        module,
      },
    });
  });
  
  // Search endpoint
  app.get(`${baseRoute}/search`, (req: Request, res: Response) => {
    res.json({
      success: true,
      data: [],
      query: req.query.q,
    });
  });
});

// Auth endpoints
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: {
      id: 'mock-user-id',
      username: req.body.username,
    },
  });
});

app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    user: {
      id: `mock-user-${Date.now()}`,
      username: req.body.username,
      email: req.body.email,
    },
  });
});

// SIEM specific endpoints
app.get('/api/v1/siem/events', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

app.get('/api/v1/siem/alerts', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

app.get('/api/v1/siem/dashboard', (req: Request, res: Response) => {
  res.json({ success: true, data: {} });
});

app.post('/api/v1/siem/search', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

// Threat Hunting specific endpoints
app.get('/api/v1/threat-hunting/sessions', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

app.get('/api/v1/threat-hunting/queries', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

app.post('/api/v1/threat-hunting/sessions', (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: { id: `session-${Date.now()}` } });
});

app.get('/api/v1/threat-hunting/sessions/:id/results', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
