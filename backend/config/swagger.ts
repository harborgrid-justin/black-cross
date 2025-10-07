/**
 * OpenAPI/Swagger Configuration
 * API Documentation for Black-Cross Platform
 */

import swaggerJsdoc, { type Options } from 'swagger-jsdoc';
import config from './index';
import { APP, SWAGGER_TAGS, ROUTES } from '../constants';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${APP.NAME} API`,
      version: APP.VERSION,
      description: APP.DESCRIPTION,
      contact: {
        name: APP.CONTACT.NAME,
        email: APP.CONTACT.EMAIL,
      },
      license: {
        name: APP.LICENSE.NAME,
        url: APP.LICENSE.URL,
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
    tags: SWAGGER_TAGS,
  },
  apis: [
    './routes/*.ts',
    './modules/*/routes/*.ts',
    './modules/*/controllers/*.ts',
    './middleware/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

