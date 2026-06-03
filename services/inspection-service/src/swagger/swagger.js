import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inspection Service API',
      version: '1.0.0',
      description: 'Fire extinguisher inspection scheduling service for Fire Extinguisher MIS',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Inspection Service' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Inspection: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            extinguisherId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            requestedBy: { type: 'string', example: '507f1f77bcf86cd799439012' },
            inspectorId: { type: 'string', nullable: true },
            scheduledDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'],
            },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateInspectionInput: {
          type: 'object',
          required: ['extinguisherId', 'scheduledDate'],
          properties: {
            extinguisherId: { type: 'string' },
            requestedBy: { type: 'string', description: 'ADMIN only — defaults to current user' },
            scheduledDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
          },
        },
        UpdateInspectionInput: {
          type: 'object',
          properties: {
            extinguisherId: { type: 'string' },
            requestedBy: { type: 'string' },
            scheduledDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            status: {
              type: 'string',
              enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'],
            },
          },
        },
        AssignInspectorInput: {
          type: 'object',
          required: ['inspectorId'],
          properties: {
            inspectorId: { type: 'string' },
          },
        },
        CompleteInspectionInput: {
          type: 'object',
          properties: {
            notes: { type: 'string' },
          },
        },
        CancelInspectionInput: {
          type: 'object',
          properties: {
            notes: { type: 'string' },
          },
        },
        InspectionStatsSummary: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            byStatus: {
              type: 'object',
              properties: {
                PENDING: { type: 'integer' },
                SCHEDULED: { type: 'integer' },
                COMPLETED: { type: 'integer' },
                CANCELLED: { type: 'integer' },
              },
            },
            upcomingScheduled: { type: 'integer' },
            overdueScheduled: { type: 'integer' },
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
      '/inspections/stats/summary': {
        get: {
          tags: ['Inspections'],
          summary: 'Dashboard inspection statistics (scoped by role)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Statistics retrieved',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/InspectionStatsSummary' },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/inspections': {
        get: {
          tags: ['Inspections'],
          summary: 'List inspections (USER: own, INSPECTOR: assigned, ADMIN: all)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'],
              },
            },
            { name: 'extinguisherId', in: 'query', schema: { type: 'string' } },
            { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          ],
          responses: { 200: { description: 'List retrieved' } },
        },
        post: {
          tags: ['Inspections'],
          summary: 'Schedule inspection (USER, ADMIN)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateInspectionInput' },
              },
            },
          },
          responses: { 201: { description: 'Inspection created with PENDING status' } },
        },
      },
      '/inspections/{id}': {
        get: {
          tags: ['Inspections'],
          summary: 'Get inspection by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Retrieved' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Inspections'],
          summary: 'Update inspection (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateInspectionInput' },
              },
            },
          },
          responses: { 200: { description: 'Updated' } },
        },
        delete: {
          tags: ['Inspections'],
          summary: 'Delete inspection (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' } },
        },
      },
      '/inspections/{id}/assign': {
        patch: {
          tags: ['Inspections'],
          summary: 'Assign inspector (ADMIN) — sets status SCHEDULED',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AssignInspectorInput' },
              },
            },
          },
          responses: { 200: { description: 'Inspector assigned' } },
        },
      },
      '/inspections/{id}/complete': {
        patch: {
          tags: ['Inspections'],
          summary: 'Complete inspection (assigned INSPECTOR)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CompleteInspectionInput' },
              },
            },
          },
          responses: { 200: { description: 'Marked COMPLETED' } },
        },
      },
      '/inspections/{id}/cancel': {
        patch: {
          tags: ['Inspections'],
          summary: 'Cancel inspection (USER own, ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CancelInspectionInput' },
              },
            },
          },
          responses: { 200: { description: 'Marked CANCELLED' } },
        },
      },
    },
  },
  apis: [],
};

export default swaggerJsdoc(options);
