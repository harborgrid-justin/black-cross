/**
 * Black-Cross Platform
 * Enterprise-grade Cyber Threat Intelligence Platform
 *
 * Main application entry point
 */

import express, {
  type Request, type Response, type NextFunction, type Application,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { rateLimiter } from './middleware/rateLimiter';
import correlationId from './middleware/correlationId';
import requestLogger from './middleware/requestLogger';
import {
  APP, PORTS, RATE_LIMIT, ROUTES, MODULE_ROUTES, FEATURES, STATUS, ENVIRONMENT, MODULES, SWAGGER,
} from './constants';

// Module routes
import auth from './modules/auth';
import threatIntelligence from './modules/threat-intelligence';
import incidentResponse from './modules/incident-response';
import threatHunting from './modules/threat-hunting';
import vulnerabilityManagement from './modules/vulnerability-management';
import siem from './modules/siem';
import threatActors from './modules/threat-actors';
import iocManagement from './modules/ioc-management';
import threatFeeds from './modules/threat-feeds';
import riskAssessment from './modules/risk-assessment';
import collaboration from './modules/collaboration';
import reporting from './modules/reporting';
import malwareAnalysis from './modules/malware-analysis';
import darkWeb from './modules/dark-web';
import compliance from './modules/compliance';
import automation from './modules/automation';
import codeReview from './modules/code-review';
import notifications from './modules/notifications';
import caseManagement from './modules/case-management';
import metrics from './modules/metrics';
import draftWorkspace from './modules/draft-workspace';

const app: Application = express();
const PORT: string | number = process.env.APP_PORT || PORTS.APP;

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
  windowMs: RATE_LIMIT.WINDOW_MS,
  maxRequests: RATE_LIMIT.MAX_REQUESTS_GLOBAL,
}));

// Health check endpoint
app.get(ROUTES.HEALTH, (req: Request, res: Response): void => {
  res.json({
    status: STATUS.OPERATIONAL,
    platform: APP.NAME,
    version: APP.VERSION,
    timestamp: new Date().toISOString(),
    modules: {
      threatIntelligence: STATUS.OPERATIONAL,
      incidentResponse: STATUS.OPERATIONAL,
      threatHunting: STATUS.OPERATIONAL,
      vulnerabilityManagement: STATUS.OPERATIONAL,
      siem: STATUS.OPERATIONAL,
      threatActors: STATUS.OPERATIONAL,
      iocManagement: STATUS.OPERATIONAL,
      threatFeeds: STATUS.OPERATIONAL,
      riskAssessment: STATUS.OPERATIONAL,
      collaboration: STATUS.OPERATIONAL,
      reporting: STATUS.OPERATIONAL,
      malwareAnalysis: STATUS.OPERATIONAL,
      darkWeb: STATUS.OPERATIONAL,
      compliance: STATUS.OPERATIONAL,
      automation: STATUS.OPERATIONAL,
      codeReview: STATUS.OPERATIONAL,
      notifications: STATUS.OPERATIONAL,
      caseManagement: STATUS.OPERATIONAL,
      metrics: STATUS.OPERATIONAL,
      draftWorkspace: STATUS.OPERATIONAL,
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
app.get(ROUTES.API_ROOT, (req: Request, res: Response): void => {
  res.json({
    message: `${APP.NAME} API v${APP.VERSION}`,
    documentation: ROUTES.API_DOCS,
    features: FEATURES,
  });
});

// API Documentation
app.use(ROUTES.API_DOCS, swaggerUi.serve);
app.get(ROUTES.API_DOCS, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: SWAGGER.CUSTOM_SITE_TITLE,
  customCss: SWAGGER.CUSTOM_CSS,
}));

app.use('/api/v1/auth', auth);
app.use(MODULE_ROUTES.THREAT_INTELLIGENCE, threatIntelligence);
app.use(MODULE_ROUTES.INCIDENT_RESPONSE, incidentResponse);
app.use(MODULE_ROUTES.THREAT_HUNTING, threatHunting);
app.use(MODULE_ROUTES.VULNERABILITY_MANAGEMENT, vulnerabilityManagement);
app.use(MODULE_ROUTES.SIEM, siem);
app.use(MODULE_ROUTES.THREAT_ACTORS, threatActors);
app.use(MODULE_ROUTES.IOC_MANAGEMENT, iocManagement);
app.use(MODULE_ROUTES.THREAT_FEEDS, threatFeeds);
app.use(MODULE_ROUTES.RISK_ASSESSMENT, riskAssessment);
app.use(MODULE_ROUTES.COLLABORATION, collaboration);
app.use(MODULE_ROUTES.REPORTING, reporting);
app.use(MODULE_ROUTES.MALWARE_ANALYSIS, malwareAnalysis);
app.use(MODULE_ROUTES.DARK_WEB, darkWeb);
app.use(MODULE_ROUTES.COMPLIANCE, compliance);
app.use(MODULE_ROUTES.AUTOMATION, automation);
app.use('/api/v1/code-review', codeReview);
app.use('/api/v1', notifications);
app.use('/api/v1', caseManagement);
app.use('/api/v1', metrics);
app.use('/api/v1', draftWorkspace);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response): void => {
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
║                      ${APP.NAME.toUpperCase()}                             ║
║          ${APP.TITLE}       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
📍 API: http://localhost:${PORT}${ROUTES.API_ROOT}
💚 Health: http://localhost:${PORT}${ROUTES.HEALTH}
📚 Docs: http://localhost:${PORT}${ROUTES.API_DOCS}

Features: ${MODULES.PRIMARY_COUNT} Primary | ${MODULES.SUB_FEATURES_COUNT}+ Sub-Features
Status: ${STATUS.OPERATIONAL}
Environment: ${process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT}
  `);
});

export default app;
