/**
 * OpenAPI/Swagger Documentation Generator
 * Provides API documentation for all endpoints
 */

// Dynamic import to avoid issues if swagger-jsdoc is not available
let swaggerJsdoc: any = null;
try {
  swaggerJsdoc = require('swagger-jsdoc');
} catch (e) {
  console.warn('[OpenAPI] swagger-jsdoc not available');
}

const options: any = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hookah+ API',
      version: '1.0.0',
      description: 'API documentation for Hookah+ platform',
      contact: {
        name: 'Hookah+ Support',
        email: 'support@hookahplus.net',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            requestId: {
              type: 'string',
              description: 'Request ID for correlation',
            },
            details: {
              type: 'string',
              description: 'Additional error details',
            },
          },
        },
        Session: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            tableId: { type: 'string' },
            customerName: { type: 'string' },
            flavor: { type: 'string' },
            amount: { type: 'number' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Sessions',
        description: 'Session management endpoints',
      },
      {
        name: 'Checkout',
        description: 'Payment and checkout endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints',
      },
    ],
  },
  apis: [
    './app/api/**/*.ts',
    './app/api/**/*.js',
  ],
};

export const swaggerSpec = swaggerJsdoc ? swaggerJsdoc(options) : {
  openapi: '3.0.0',
  info: {
    title: 'Hookah+ API',
    version: '1.0.0',
    description: 'API documentation - swagger-jsdoc not configured',
  },
};

/**
 * Generate OpenAPI spec
 */
export function generateOpenAPISpec(): object {
  return swaggerSpec;
}

