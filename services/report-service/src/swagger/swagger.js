import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Report Service API',
      version: '1.0.0',
      description: 'Aggregated reporting service for Fire Extinguisher MIS',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Report Service' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    paths: {
      '/health': {
        get: { tags: ['Health'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
      },
      '/reports/dashboard': {
        get: {
          tags: ['Reports'],
          summary: 'Role-aware dashboard summary',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard metrics' } },
        },
      },
      '/reports/inventory': {
        get: {
          tags: ['Reports'],
          summary: 'Inventory report (daily, monthly, yearly)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'period', in: 'query', schema: { type: 'string', enum: ['daily', 'monthly', 'yearly'] } },
          ],
          responses: { 200: { description: 'Inventory report' } },
        },
      },
      '/reports/inspections': {
        get: {
          tags: ['Reports'],
          summary: 'Inspection report by status',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] },
            },
          ],
          responses: { 200: { description: 'Inspection report' } },
        },
      },
      '/reports/maintenance': {
        get: {
          tags: ['Reports'],
          summary: 'Maintenance report grouped by date, inspector, or extinguisher',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'groupBy',
              in: 'query',
              schema: { type: 'string', enum: ['date', 'inspector', 'extinguisher'] },
            },
          ],
          responses: { 200: { description: 'Maintenance report' } },
        },
      },
      '/reports/expiry': {
        get: {
          tags: ['Reports'],
          summary: 'Expiry report (expiring, expired, retired)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['expiring', 'expired', 'retired'] } },
          ],
          responses: { 200: { description: 'Expiry report' } },
        },
      },
    },
  },
  apis: [],
};

export default swaggerJsdoc(options);
