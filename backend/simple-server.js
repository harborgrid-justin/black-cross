/**
 * Simple Express Server for Testing
 */
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'connected',
      redis: 'connected'
    }
  });
});

// API health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Simple auth endpoint
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple test login
  if (email === 'admin@blackcross.com' && password === 'admin') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'admin@blackcross.com',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Basic module endpoints
const modules = [
  'threat-intelligence',
  'incident-response', 
  'vulnerability-management',
  'ioc-management',
  'threat-actors',
  'threat-feeds',
  'siem',
  'threat-hunting',
  'risk-assessment',
  'collaboration',
  'reporting',
  'malware-analysis',
  'dark-web',
  'compliance',
  'automation'
];

modules.forEach(module => {
  app.get(`/api/v1/${module}/health`, (req, res) => {
    res.json({
      module,
      status: 'operational',
      version: '1.0.0'
    });
  });
  
  app.get(`/api/v1/${module}`, (req, res) => {
    res.json({
      success: true,
      data: [],
      total: 0,
      module
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Black-Cross Backend Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔐 API endpoints: http://localhost:${port}/api/v1`);
});