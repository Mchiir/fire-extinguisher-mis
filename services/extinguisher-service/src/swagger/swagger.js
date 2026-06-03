import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Extinguisher Service API',
      version: '1.0.0',
      description: 'Fire extinguisher inventory service for Fire Extinguisher MIS',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Extinguisher Service' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        FireExtinguisher: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            serialNumber: { type: 'string', example: 'FE-ABC-001' },
            location: { type: 'string', example: 'Building A - Floor 2' },
            type: { type: 'string', example: 'ABC' },
            size: { type: 'string', example: '5kg' },
            installationDate: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INSPECTION_DUE', 'UNDER_MAINTENANCE', 'EXPIRED', 'RETIRED'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateExtinguisherInput: {
          type: 'object',
          required: ['serialNumber', 'location', 'type', 'size', 'installationDate', 'expiryDate'],
          properties: {
            serialNumber: { type: 'string', example: 'FE-ABC-001' },
            location: { type: 'string' },
            type: { type: 'string', example: 'ABC' },
            size: { type: 'string', example: '5kg' },
            installationDate: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INSPECTION_DUE', 'UNDER_MAINTENANCE', 'EXPIRED', 'RETIRED'],
            },
          },
        },
        UpdateExtinguisherInput: {
          type: 'object',
          properties: {
            serialNumber: { type: 'string' },
            location: { type: 'string' },
            type: { type: 'string' },
            size: { type: 'string' },
            installationDate: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INSPECTION_DUE', 'UNDER_MAINTENANCE', 'EXPIRED', 'RETIRED'],
            },
          },
        },
        UpdateStatusInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INSPECTION_DUE', 'UNDER_MAINTENANCE', 'EXPIRED', 'RETIRED'],
            },
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
      '/extinguishers': {
        get: {
          tags: ['Extinguishers'],
          summary: 'List fire extinguishers with pagination and filters',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['ACTIVE', 'INSPECTION_DUE', 'UNDER_MAINTENANCE', 'EXPIRED', 'RETIRED'],
              },
            },
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string', description: 'Search serial number or location' } },
          ],
          responses: { 200: { description: 'List retrieved' } },
        },
        post: {
          tags: ['Extinguishers'],
          summary: 'Create fire extinguisher (ADMIN)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateExtinguisherInput' } },
            },
          },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/extinguishers/expiring': {
        get: {
          tags: ['Extinguishers'],
          summary: 'List extinguishers expiring within N days (notification service)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'days', in: 'query', schema: { type: 'integer', default: 30 } },
          ],
          responses: { 200: { description: 'Expiring list retrieved' } },
        },
      },
      '/extinguishers/expired': {
        get: {
          tags: ['Extinguishers'],
          summary: 'Mark overdue extinguishers as EXPIRED and list them',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Expired list retrieved' } },
        },
      },
      '/extinguishers/{id}': {
        get: {
          tags: ['Extinguishers'],
          summary: 'Get fire extinguisher by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Retrieved' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Extinguishers'],
          summary: 'Update fire extinguisher (ADMIN full, INSPECTOR status only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateExtinguisherInput' } },
            },
          },
          responses: { 200: { description: 'Updated' } },
        },
        delete: {
          tags: ['Extinguishers'],
          summary: 'Delete fire extinguisher (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' } },
        },
      },
      '/extinguishers/{id}/status': {
        patch: {
          tags: ['Extinguishers'],
          summary: 'Update extinguisher status (ADMIN, INSPECTOR)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateStatusInput' } },
            },
          },
          responses: { 200: { description: 'Status updated' } },
        },
      },
    },
  },
  apis: [],
};

export default swaggerJsdoc(options);
