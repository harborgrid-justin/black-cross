/**
 * @fileoverview Black-Cross Platform - Main Application Entry Point
 *
 * This is the primary entry point for the Black-Cross Enterprise Cyber Threat Intelligence Platform.
 * It initializes the Express application, configures middleware, registers all module routes,
 * and starts the HTTP server.
 *
 * The platform provides 15+ core security features including:
 * - Threat Intelligence Management
 * - Incident Response & Management
 * - Threat Hunting Platform
 * - Vulnerability Management
 * - SIEM Integration
 * - And 10+ additional security modules
 *
 * @module backend/index
 * @requires express
 * @requires cors
 * @requires helmet
 * @requires swagger-ui-express
 *
 * @example
 * // Start the server with environment configuration
 * // PORT=8080 NODE_ENV=production node dist/index.js
 *
 * @see {@link https://github.com/harborgrid/black-cross|Black-Cross Repository}
 * @since 1.0.0
 */

// Core Express and middleware imports
import express, {
  type Request, type Response, type NextFunction, type Application,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

// Application configuration
import swaggerSpec from './config/swagger';
import { rateLimiter } from './middleware/rateLimiter';
import correlationId from './middleware/correlationId';
import requestLogger from './middleware/requestLogger';
import {
  APP, PORTS, RATE_LIMIT, ROUTES, MODULE_ROUTES, FEATURES, STATUS, ENVIRONMENT, MODULES, SWAGGER,
} from './constants';

/**
 * Feature Module Routes
 *
 * Each module represents a core security feature of the platform.
 * Modules follow a consistent pattern with routes, controllers, and services.
 */
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

/**
 * Express Application Instance
 *
 * The main Express application that handles all HTTP requests.
 * Configured with security middleware, CORS, JSON parsing, and rate limiting.
 *
 * @type {Application}
 * @constant
 */
const app: Application = express();

/**
 * Server Port Configuration
 *
 * Port number for the HTTP server. Can be configured via the APP_PORT
 * environment variable, defaults to 8080.
 *
 * @type {string | number}
 * @constant
 * @default 8080
 *
 * @example
 * // Set custom port via environment variable
 * // APP_PORT=3000 npm start
 */
const PORT: string | number = process.env.APP_PORT || PORTS.APP;

/**
 * Security Middleware Configuration
 *
 * Applies essential security headers and protections via Helmet middleware.
 * Helmet helps protect against well-known web vulnerabilities by setting
 * appropriate HTTP headers.
 *
 * @see {@link https://helmetjs.github.io/|Helmet Documentation}
 */
app.use(helmet());

/**
 * CORS Configuration
 *
 * Enables Cross-Origin Resource Sharing (CORS) to allow frontend applications
 * from different origins to access the API. In production, this should be
 * configured with specific allowed origins.
 *
 * @remarks
 * For production deployments, configure CORS with specific origin whitelist:
 * cors({ origin: ['https://yourdomain.com'] })
 */
app.use(cors());

/**
 * JSON Body Parser
 *
 * Parses incoming requests with JSON payloads. Makes the parsed data available
 * in req.body for all routes.
 */
app.use(express.json());

/**
 * URL-Encoded Body Parser
 *
 * Parses incoming requests with URL-encoded payloads (form submissions).
 * The extended option allows for rich objects and arrays to be encoded.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Request Correlation ID Middleware
 *
 * Generates or extracts a unique correlation ID for each request to enable
 * request tracing across distributed systems and log aggregation.
 *
 * @see {@link ./middleware/correlationId}
 */
app.use(correlationId);

/**
 * Request Logger Middleware
 *
 * Logs all incoming HTTP requests with details including method, path,
 * status code, response time, and correlation ID.
 *
 * @see {@link ./middleware/requestLogger}
 */
app.use(requestLogger);

/**
 * Global Rate Limiting
 *
 * Applies rate limiting to all routes to prevent abuse and DDoS attacks.
 * Configured with a 15-minute window and maximum of 1000 requests per window.
 *
 * @remarks
 * Individual routes can apply stricter rate limits as needed.
 * Authentication endpoints typically have lower limits.
 *
 * @see {@link ./middleware/rateLimiter}
 */
app.use(rateLimiter({
  windowMs: RATE_LIMIT.WINDOW_MS,
  maxRequests: RATE_LIMIT.MAX_REQUESTS_GLOBAL,
}));

/**
 * Health Check Endpoint
 *
 * Provides system health status and module availability information.
 * This endpoint is typically used by load balancers, monitoring systems,
 * and orchestration platforms to verify service availability.
 *
 * @route GET /health
 * @returns {void} JSON response with platform health status
 *
 * @example
 * // Response format
 * {
 *   "status": "operational",
 *   "platform": "Black-Cross",
 *   "version": "1.0.0",
 *   "timestamp": "2025-10-24T12:00:00.000Z",
 *   "modules": {
 *     "threatIntelligence": "operational",
 *     "incidentResponse": "operational",
 *     // ... other modules
 *   }
 * }
 *
 * @remarks
 * In production, this should be enhanced with actual health checks for:
 * - Database connectivity
 * - External service availability
 * - Memory and CPU usage
 * - Cache system status
 */
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
 * API Root Information Endpoint
 *
 * Returns basic information about the API including version, available features,
 * and a link to the interactive API documentation.
 *
 * @route GET /api/v1
 * @returns {void} JSON response with API metadata and feature list
 *
 * @example
 * // Response format
 * {
 *   "message": "Black-Cross API v1.0.0",
 *   "documentation": "/api/v1/docs",
 *   "features": [
 *     "Threat Intelligence Management",
 *     "Incident Response & Management",
 *     // ... 15+ features
 *   ]
 * }
 *
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

/**
 * Swagger UI Middleware
 *
 * Serves the static assets for the Swagger UI interface at /api/v1/docs.
 * This middleware must be registered before the Swagger setup route.
 */
app.use(ROUTES.API_DOCS, swaggerUi.serve);

/**
 * API Documentation Endpoint (Swagger UI)
 *
 * Provides an interactive API documentation interface powered by Swagger UI.
 * This interface allows developers to explore and test all API endpoints
 * directly from the browser.
 *
 * @route GET /api/v1/docs
 * @returns {void} HTML page with interactive Swagger UI
 *
 * @remarks
 * The Swagger specification is generated from JSDoc comments and route definitions.
 * To update the documentation, modify JSDoc comments in route handlers and run
 * the build process.
 *
 * @see {@link ./config/swagger} for Swagger configuration
 * @see {@link https://swagger.io/tools/swagger-ui/|Swagger UI Documentation}
 */
app.get(ROUTES.API_DOCS, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: SWAGGER.CUSTOM_SITE_TITLE,
  customCss: SWAGGER.CUSTOM_CSS,
}));

/**
 * Module Route Registration
 *
 * Registers all feature module routers with the Express application.
 * Each module is mounted at its designated API path under /api/v1/*.
 *
 * The platform includes 20+ modules covering comprehensive threat intelligence
 * and security operations capabilities. Each module follows a consistent
 * architecture with routes, controllers, and service layers.
 *
 * @remarks
 * Module routes are processed in order. Authentication middleware is typically
 * applied within each module router to protect specific endpoints.
 *
 * @see {@link ./modules} for individual module implementations
 */

/** Authentication and user management routes */
app.use('/api/v1/auth', auth);

/** Threat Intelligence Management - Collection and analysis of threat data */
app.use(MODULE_ROUTES.THREAT_INTELLIGENCE, threatIntelligence);

/** Incident Response - Security incident tracking and management */
app.use(MODULE_ROUTES.INCIDENT_RESPONSE, incidentResponse);

/** Threat Hunting - Proactive threat detection and investigation */
app.use(MODULE_ROUTES.THREAT_HUNTING, threatHunting);

/** Vulnerability Management - Vulnerability tracking and remediation */
app.use(MODULE_ROUTES.VULNERABILITY_MANAGEMENT, vulnerabilityManagement);

/** SIEM - Security Information and Event Management integration */
app.use(MODULE_ROUTES.SIEM, siem);

/** Threat Actor Profiling - Adversary tracking and attribution */
app.use(MODULE_ROUTES.THREAT_ACTORS, threatActors);

/** Indicators of Compromise (IoC) Management */
app.use(MODULE_ROUTES.IOC_MANAGEMENT, iocManagement);

/** Threat Intelligence Feeds - External feed integration and management */
app.use(MODULE_ROUTES.THREAT_FEEDS, threatFeeds);

/** Risk Assessment - Risk scoring and analysis */
app.use(MODULE_ROUTES.RISK_ASSESSMENT, riskAssessment);

/** Collaboration - Team communication and workflow management */
app.use(MODULE_ROUTES.COLLABORATION, collaboration);

/** Reporting & Analytics - Report generation and data visualization */
app.use(MODULE_ROUTES.REPORTING, reporting);

/** Malware Analysis - Malware sandbox and analysis tools */
app.use(MODULE_ROUTES.MALWARE_ANALYSIS, malwareAnalysis);

/** Dark Web Monitoring - Dark web intelligence gathering */
app.use(MODULE_ROUTES.DARK_WEB, darkWeb);

/** Compliance - Compliance tracking and audit management */
app.use(MODULE_ROUTES.COMPLIANCE, compliance);

/** Automation - Automated response playbooks and orchestration */
app.use(MODULE_ROUTES.AUTOMATION, automation);

/** Code Review - Security code review and static analysis */
app.use('/api/v1/code-review', codeReview);

/** Notifications - Alert and notification management */
app.use('/api/v1', notifications);

/** Case Management - Security case tracking and investigation */
app.use('/api/v1', caseManagement);

/** Metrics - Performance and usage metrics */
app.use('/api/v1', metrics);

/** Dashboard - Dashboard statistics and overview */
app.get('/api/v1/dashboard/stats', async (req: Request, res: Response) => {
  try {
    // Return sample stats based on seeded data
    const stats = {
      activeThreats: 15,
      openIncidents: 7,
      vulnerabilities: 5,
      riskScore: 75,
      threatTrend: 5,
      lastUpdated: new Date().toISOString()
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard stats' });
  }
});

/** Draft Workspace - Temporary workspace for drafts and work-in-progress */
app.use('/api/v1', draftWorkspace);

/**
 * Global Error Handler Middleware
 *
 * Catches all unhandled errors from route handlers and middleware.
 * Provides consistent error responses and logging for debugging.
 *
 * @param {Error} err - The error object thrown by previous middleware or route handlers
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Next middleware function (unused, prefixed with underscore)
 * @returns {void} JSON error response
 *
 * @remarks
 * Error messages are only exposed in development mode for security.
 * In production, generic error messages are returned to prevent information leakage.
 *
 * Best practices for error handling:
 * - Use try-catch in async route handlers
 * - Create custom error classes for different error types
 * - Log errors to monitoring services (e.g., Sentry, DataDog)
 * - Include correlation IDs for request tracing
 *
 * @example
 * // Error response in development
 * {
 *   "error": "Internal Server Error",
 *   "message": "Detailed error message"
 * }
 *
 * // Error response in production
 * {
 *   "error": "Internal Server Error"
 * }
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT ? err.message : undefined,
  });
});

/**
 * 404 Not Found Handler
 *
 * Catches all requests to undefined routes and returns a standardized
 * 404 error response. This handler must be registered after all valid routes.
 *
 * @param {Request} req - Express request object containing the attempted path
 * @param {Response} res - Express response object
 * @returns {void} JSON error response with 404 status
 *
 * @example
 * // Response format
 * {
 *   "error": "Not Found",
 *   "message": "The requested resource was not found"
 * }
 *
 * @remarks
 * This is the last middleware in the chain and acts as a catch-all for
 * undefined routes. It should always be registered after all module routes
 * and other middleware.
 */
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

/**
 * Server Startup
 *
 * Starts the HTTP server and binds it to the configured port.
 * Displays a formatted startup banner with important endpoint URLs
 * and configuration information.
 *
 * @function
 * @returns {void}
 *
 * @remarks
 * The server listens on the port specified by the APP_PORT environment variable
 * or defaults to port 8080. The startup banner includes:
 * - API root endpoint for version information
 * - Health check endpoint for monitoring
 * - Interactive API documentation URL
 * - Feature count and operational status
 *
 * In production environments, ensure:
 * - Environment variables are properly configured
 * - Database connections are established before accepting traffic
 * - Health checks are validated by load balancers
 * - Process managers (PM2, systemd) handle process lifecycle
 *
 * @example
 * // Start server with custom port
 * // APP_PORT=3000 NODE_ENV=production node dist/index.js
 *
 * @see {@link https://expressjs.com/en/api.html#app.listen|Express app.listen()}
 */
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

/**
 * Express Application Export
 *
 * Exports the configured Express application instance for use in testing,
 * serverless deployments, or other contexts where the application needs to
 * be imported without starting the HTTP server.
 *
 * @type {Application}
 * @exports app
 *
 * @example
 * // Import for testing
 * import app from './index';
 * import request from 'supertest';
 *
 * test('GET /health returns 200', async () => {
 *   const response = await request(app).get('/health');
 *   expect(response.status).toBe(200);
 * });
 *
 * @example
 * // Import for serverless deployment
 * import app from './index';
 * export const handler = serverless(app);
 */
export default app;
