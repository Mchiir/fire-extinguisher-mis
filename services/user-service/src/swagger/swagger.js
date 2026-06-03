import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'User management service for Fire Extinguisher MIS',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'User Service' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['ADMIN', 'INSPECTOR', 'USER'] },
            tokenVersion: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
        CreateUserInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'role'],
          properties: {
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Inspector' },
            email: { type: 'string', example: 'jane@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            role: { type: 'string', enum: ['ADMIN', 'INSPECTOR', 'USER'], example: 'INSPECTOR' },
          },
        },
        UpdateUserInput: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['ADMIN', 'INSPECTOR', 'USER'] },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
      },
    },
    paths: {
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'List users (Admin)',
          description: 'Returns a paginated list of users with optional role and search filters.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['ADMIN', 'INSPECTOR', 'USER'] } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or email' },
          ],
          responses: {
            200: {
              description: 'Users retrieved',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                              pagination: { $ref: '#/components/schemas/Pagination' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create user or inspector (Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserInput' } } },
          },
          responses: {
            201: { description: 'User created' },
            409: { description: 'Email already registered' },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID',
          description: 'Admin can access any user; other users can access their own profile.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'User retrieved' },
            404: { description: 'User not found' },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Update user (Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } },
          },
          responses: {
            200: { description: 'User updated' },
            404: { description: 'User not found' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user (Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'User deleted' },
            400: { description: 'Cannot delete own account' },
            404: { description: 'User not found' },
          },
        },
      },
      '/users/{id}/verify': {
        get: {
          tags: ['Internal'],
          summary: 'Verify user exists (Internal)',
          description: 'Used by other services to validate user or inspector references.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['ADMIN', 'INSPECTOR', 'USER'] } },
          ],
          responses: {
            200: {
              description: 'Verification complete',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: { exists: { type: 'boolean' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export default swaggerJsdoc(options);
