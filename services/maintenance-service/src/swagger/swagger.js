import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';
import { MAINTENANCE_ACTION_VALUES } from '../constants/actions.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Maintenance Service API',
      version: '1.0.0',
      description: 'Maintenance logging service for Fire Extinguisher MIS',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Maintenance Service' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        MaintenanceRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            extinguisherId: { type: 'string' },
            inspectionId: { type: 'string' },
            inspectorId: { type: 'string' },
            actionTaken: { type: 'string', enum: MAINTENANCE_ACTION_VALUES },
            conditionFound: { type: 'string', example: 'Low pressure reading' },
            maintenanceDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateMaintenanceInput: {
          type: 'object',
          required: ['extinguisherId', 'actionTaken', 'conditionFound'],
          properties: {
            extinguisherId: { type: 'string' },
            inspectionId: { type: 'string', description: 'Optional; must reference a COMPLETED inspection' },
            inspectorId: { type: 'string', description: 'Required for ADMIN; set automatically for INSPECTOR' },
            actionTaken: { type: 'string', enum: MAINTENANCE_ACTION_VALUES },
            conditionFound: { type: 'string' },
            maintenanceDate: { type: 'string', format: 'date-time' },
          },
        },
        UpdateMaintenanceInput: {
          type: 'object',
          properties: {
            extinguisherId: { type: 'string' },
            inspectionId: { type: 'string', nullable: true },
            inspectorId: { type: 'string' },
            actionTaken: { type: 'string', enum: MAINTENANCE_ACTION_VALUES },
            conditionFound: { type: 'string' },
            maintenanceDate: { type: 'string', format: 'date-time' },
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
      '/maintenance': {
        get: {
          tags: ['Maintenance'],
          summary: 'List maintenance records with filters',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'extinguisherId', in: 'query', schema: { type: 'string' } },
            { name: 'inspectorId', in: 'query', schema: { type: 'string' } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          ],
          responses: { 200: { description: 'List retrieved' } },
        },
        post: {
          tags: ['Maintenance'],
          summary: 'Create maintenance record (INSPECTOR, ADMIN)',
          description:
            'Validates extinguisher exists. If inspectionId is provided, inspection must be COMPLETED. Updates extinguisher status (RETIRED, ACTIVE, or UNDER_MAINTENANCE).',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateMaintenanceInput' } },
            },
          },
          responses: { 201: { description: 'Created' }, 400: { description: 'Validation failed' } },
        },
      },
      '/maintenance/by-inspector/{inspectorId}': {
        get: {
          tags: ['Maintenance'],
          summary: 'List maintenance records by inspector',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'inspectorId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          ],
          responses: { 200: { description: 'List retrieved' } },
        },
      },
      '/maintenance/by-extinguisher/{extinguisherId}': {
        get: {
          tags: ['Maintenance'],
          summary: 'List maintenance records by extinguisher',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'extinguisherId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          ],
          responses: { 200: { description: 'List retrieved' } },
        },
      },
      '/maintenance/{id}': {
        get: {
          tags: ['Maintenance'],
          summary: 'Get maintenance record by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Retrieved' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Maintenance'],
          summary: 'Update maintenance record (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateMaintenanceInput' } },
            },
          },
          responses: { 200: { description: 'Updated' } },
        },
        delete: {
          tags: ['Maintenance'],
          summary: 'Delete maintenance record (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' } },
        },
      },
    },
  },
  apis: [],
};

export default swaggerJsdoc(options);
