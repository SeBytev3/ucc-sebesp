import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Services Marketplace API',
      version: '0.1.0',
      description: 'Complete backend API for the services marketplace platform',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT token stored in an HTTP-only cookie',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have the required permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ConflictError: {
          description: 'A conflict occurred (e.g., unique constraint violation)',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Input validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['CUSTOMER', 'PROVIDER', 'ADMIN'] },
            languagePref: { type: 'string', enum: ['es', 'en'] },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nameEs: { type: 'string' },
            nameEn: { type: 'string' },
            descriptionEs: { type: 'string', nullable: true },
            descriptionEn: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        ProviderProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            serviceCategoryId: { type: 'string', format: 'uuid' },
            bio: { type: 'string', nullable: true },
            locationCity: { type: 'string', nullable: true },
            locationRegion: { type: 'string', nullable: true },
            locationLat: { type: 'number', nullable: true },
            locationLng: { type: 'number', nullable: true },
            certifications: { type: 'array', items: { type: 'string' } },
            availabilityNotes: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DEACTIVATED'] },
            rejectionReason: { type: 'string', nullable: true },
            commissionRate: { type: 'number' },
            averageRating: { type: 'number' },
            totalReviews: { type: 'integer' },
            user: { $ref: '#/components/schemas/User' },
            category: { $ref: '#/components/schemas/Category' },
          },
        },
        ServiceRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            providerId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED'] },
            providerResponseNotes: { type: 'string', nullable: true },
            requestedAt: { type: 'string', format: 'date-time' },
            respondedAt: { type: 'string', format: 'date-time', nullable: true },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            customer: { $ref: '#/components/schemas/User' },
            provider: { $ref: '#/components/schemas/ProviderProfile' },
            category: { $ref: '#/components/schemas/Category' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            requestId: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            providerId: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            requestId: { type: 'string', format: 'uuid', nullable: true },
            senderId: { type: 'string', format: 'uuid' },
            receiverId: { type: 'string', format: 'uuid' },
            content: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['PROVIDER_APPROVED', 'PROVIDER_REJECTED', 'NEW_MESSAGE', 'REQUEST_RECEIVED', 'REQUEST_ACCEPTED', 'REQUEST_DECLINED', 'NEW_REVIEW'] },
            messageEs: { type: 'string' },
            messageEn: { type: 'string' },
            isRead: { type: 'boolean' },
            linkUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), 'server/src/routes/*.ts'),
    path.join(process.cwd(), 'server/src/controllers/*.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
