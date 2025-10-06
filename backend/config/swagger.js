/**
 * OpenAPI/Swagger Configuration
 * API Documentation for Black-Cross Platform
 */

const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Black-Cross API',
      version: '1.0.0',
      description: 'Enterprise-grade Cyber Threat Intelligence Platform API',
      contact: {
        name: 'Black-Cross Team',
        email: 'support@black-cross.io',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: config.app.url,
        description: `${config.app.env} server`,
      },
      {
        url: 'http://localhost:8080',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE',
            },
            details: {
              type: 'object',
            },
          },
          required: ['success', 'error'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Request validation failed',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                  type: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 20,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            pages: {
              type: 'integer',
              example: 5,
            },
          },
        },
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort field',
          schema: {
            type: 'string',
          },
        },
        OrderParam: {
          name: 'order',
          in: 'query',
          description: 'Sort order',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc',
          },
        },
        IdParam: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Resource ID',
          schema: {
            type: 'string',
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Authentication required',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Access denied. Required role: admin',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Resource not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Too many requests, please try again later',
              },
            },
          },
          headers: {
            'Retry-After': {
              description: 'Number of seconds to wait before retrying',
              schema: {
                type: 'integer',
              },
            },
            'X-RateLimit-Limit': {
              description: 'Maximum requests per window',
              schema: {
                type: 'integer',
              },
            },
            'X-RateLimit-Remaining': {
              description: 'Remaining requests in current window',
              schema: {
                type: 'integer',
              },
            },
            'X-RateLimit-Reset': {
              description: 'Time when the rate limit resets',
              schema: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Threat Intelligence',
        description: 'Threat intelligence collection and management',
      },
      {
        name: 'Incident Response',
        description: 'Security incident management and response',
      },
      {
        name: 'Vulnerabilities',
        description: 'Vulnerability tracking and management',
      },
      {
        name: 'IoC Management',
        description: 'Indicators of Compromise management',
      },
      {
        name: 'Threat Actors',
        description: 'Threat actor profiling and tracking',
      },
      {
        name: 'Threat Feeds',
        description: 'External threat feed integration',
      },
      {
        name: 'Malware Analysis',
        description: 'Malware analysis and sandbox',
      },
      {
        name: 'SIEM',
        description: 'Security Information and Event Management',
      },
      {
        name: 'Compliance',
        description: 'Compliance and audit management',
      },
      {
        name: 'Dark Web',
        description: 'Dark web monitoring',
      },
      {
        name: 'Collaboration',
        description: 'Team collaboration and workflows',
      },
      {
        name: 'Reporting',
        description: 'Reports and analytics',
      },
      {
        name: 'Threat Hunting',
        description: 'Proactive threat hunting',
      },
      {
        name: 'Risk Assessment',
        description: 'Risk assessment and scoring',
      },
      {
        name: 'Automation',
        description: 'Automated response and playbooks',
      },
      {
        name: 'Health',
        description: 'System health and monitoring',
      },
    ],
  },
  apis: [
    './routes/*.js',
    './modules/*/routes/*.js',
    './modules/*/controllers/*.js',
    './middleware/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
