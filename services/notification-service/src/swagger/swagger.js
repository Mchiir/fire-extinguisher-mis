import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';
import { NOTIFICATION_STATUS_VALUES } from '../constants/statuses.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notification Service API',
      version: '1.0.0',
      description: 'Notification management service for Fire Extinguisher MIS',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Notification Service' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        serviceToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-service-token',
          description: 'Internal service token for system-to-system calls',
        },
      },
      schemas: {
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            extinguisherId: { type: 'string', nullable: true },
            title: { type: 'string', example: 'Fire Extinguisher Expiry Alert' },
            message: { type: 'string', example: 'Extinguisher FE-001 expires on 2026-07-01.' },
            status: { type: 'string', enum: NOTIFICATION_STATUS_VALUES },
            sentAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateNotificationInput: {
          type: 'object',
          required: ['userId', 'title', 'message'],
          properties: {
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            extinguisherId: { type: 'string', nullable: true },
            title: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'string', enum: NOTIFICATION_STATUS_VALUES },
          },
        },
        UpdateNotificationInput: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            extinguisherId: { type: 'string', nullable: true },
            title: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'string', enum: NOTIFICATION_STATUS_VALUES },
            sentAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: { 200: { description: 'Service is healthy' } },
        },
      },
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'List notifications (users see own, admin sees all)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: NOTIFICATION_STATUS_VALUES } },
            { name: 'userId', in: 'query', schema: { type: 'string', description: 'Admin only filter' } },
            { name: 'extinguisherId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'List retrieved' } },
        },
        post: {
          tags: ['Notifications'],
          summary: 'Create notification (ADMIN or system token)',
          security: [{ bearerAuth: [] }, { serviceToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateNotificationInput' } },
            },
          },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/notifications/{id}': {
        get: {
          tags: ['Notifications'],
          summary: 'Get notification by ID (owner or admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Retrieved' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Notifications'],
          summary: 'Update notification (ADMIN or system token)',
          security: [{ bearerAuth: [] }, { serviceToken: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateNotificationInput' } },
            },
          },
          responses: { 200: { description: 'Updated' } },
        },
        delete: {
          tags: ['Notifications'],
          summary: 'Delete notification (ADMIN or system token)',
          security: [{ bearerAuth: [] }, { serviceToken: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' } },
        },
      },
      '/notifications/{id}/mark-sent': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark notification as sent (ADMIN or system token)',
          security: [{ bearerAuth: [] }, { serviceToken: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Marked as sent' } },
        },
      },
    },
  },
  apis: [],
};

export default swaggerJsdoc(options);
