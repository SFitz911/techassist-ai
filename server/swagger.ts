import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TechAssist AI API',
            version: '1.1.0',
            description: `
        **TechAssist AI API Documentation**
        
        A comprehensive API for managing technical service jobs, customers, photos, AI analysis, and invoicing.
        
        ## Features
        - 🔧 **Job Management**: Create, track, and manage service jobs
        - 👥 **Customer Management**: Handle customer information and relationships
        - 📸 **Photo Analysis**: AI-powered photo analysis using OpenAI Vision
        - 📝 **Smart Notes**: AI-enhanced note taking and improvement
        - 💰 **Estimates & Invoicing**: Generate estimates and manage invoicing
        - 🧰 **Parts Search**: Intelligent parts identification and sourcing
        - 🗺️ **Maps Integration**: Location services with Mapbox integration
        
        ## Authentication
        This API uses environment-based configuration. Ensure proper API keys are set for OpenAI and Mapbox integration.
        
        ## Base URL
        - Development: \`http://localhost:5000\`
        - Production: Configure based on deployment
      `,
            contact: {
                name: 'TechAssist AI Support',
                email: 'support@techassist-ai.com',
                url: 'https://github.com/your-repo/techassist-ai'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development Server'
            },
            {
                url: 'https://your-production-domain.com',
                description: 'Production Server'
            }
        ],
        tags: [
            {
                name: 'Jobs',
                description: 'Service job management operations'
            },
            {
                name: 'Customers',
                description: 'Customer management operations'
            },
            {
                name: 'Photos',
                description: 'Photo upload and AI analysis operations'
            },
            {
                name: 'Notes',
                description: 'Note creation and AI enhancement operations'
            },
            {
                name: 'Materials',
                description: 'Material and parts management'
            },
            {
                name: 'Estimates',
                description: 'Estimate and invoice generation'
            },
            {
                name: 'AI Features',
                description: 'AI-powered analysis and enhancement features'
            },
            {
                name: 'Maps',
                description: 'Location and mapping services'
            }
        ],
        components: {
            schemas: {
                Job: {
                    type: 'object',
                    required: ['customerId', 'description'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique job identifier',
                            example: 1
                        },
                        customerId: {
                            type: 'integer',
                            description: 'Associated customer ID',
                            example: 1
                        },
                        description: {
                            type: 'string',
                            description: 'Job description',
                            example: 'HVAC system maintenance and repair'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'in-progress', 'completed', 'cancelled'],
                            description: 'Current job status',
                            example: 'pending'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'urgent'],
                            description: 'Job priority level',
                            example: 'medium'
                        },
                        scheduledDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Scheduled completion date',
                            example: '2025-09-25T10:00:00Z'
                        },
                        address: {
                            type: 'string',
                            description: 'Job location address',
                            example: '123 Main St, City, State 12345'
                        },
                        estimatedHours: {
                            type: 'number',
                            description: 'Estimated hours to complete',
                            example: 4.5
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Job creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                Customer: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique customer identifier',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Customer full name',
                            example: 'John Smith'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Customer email address',
                            example: 'john.smith@email.com'
                        },
                        phone: {
                            type: 'string',
                            description: 'Customer phone number',
                            example: '+1-555-123-4567'
                        },
                        address: {
                            type: 'string',
                            description: 'Customer address',
                            example: '123 Oak Ave, Springfield, IL 62701'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Customer creation timestamp'
                        }
                    }
                },
                Photo: {
                    type: 'object',
                    required: ['jobId', 'filename', 'url'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique photo identifier',
                            example: 1
                        },
                        jobId: {
                            type: 'integer',
                            description: 'Associated job ID',
                            example: 1
                        },
                        filename: {
                            type: 'string',
                            description: 'Original filename',
                            example: 'hvac_unit_before.jpg'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'Photo URL or file path',
                            example: '/uploads/photos/hvac_unit_before.jpg'
                        },
                        aiAnalysis: {
                            type: 'object',
                            description: 'AI analysis results from OpenAI Vision',
                            properties: {
                                description: {
                                    type: 'string',
                                    example: 'HVAC unit showing wear on the compressor housing'
                                },
                                issues: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['Compressor wear', 'Dirty air filter', 'Loose connections']
                                },
                                parts: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string', example: 'Air Filter' },
                                            condition: { type: 'string', example: 'Needs replacement' },
                                            priority: { type: 'string', example: 'high' }
                                        }
                                    }
                                }
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Photo upload timestamp'
                        }
                    }
                },
                Note: {
                    type: 'object',
                    required: ['jobId', 'content'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique note identifier',
                            example: 1
                        },
                        jobId: {
                            type: 'integer',
                            description: 'Associated job ID',
                            example: 1
                        },
                        content: {
                            type: 'string',
                            description: 'Note content',
                            example: 'Customer reported unusual noise from HVAC unit'
                        },
                        enhancedContent: {
                            type: 'string',
                            description: 'AI-enhanced version of the note',
                            example: 'Customer reported unusual operational noise from HVAC unit, indicating potential mechanical issues requiring immediate inspection of fan bearings and compressor components.'
                        },
                        type: {
                            type: 'string',
                            enum: ['general', 'technical', 'customer-feedback', 'safety'],
                            description: 'Note category',
                            example: 'technical'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Note creation timestamp'
                        }
                    }
                },
                Estimate: {
                    type: 'object',
                    required: ['jobId'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique estimate identifier',
                            example: 1
                        },
                        jobId: {
                            type: 'integer',
                            description: 'Associated job ID',
                            example: 1
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'sent', 'approved', 'rejected'],
                            description: 'Estimate status',
                            example: 'draft'
                        },
                        totalAmount: {
                            type: 'number',
                            format: 'decimal',
                            description: 'Total estimate amount',
                            example: 1250.00
                        },
                        items: {
                            type: 'array',
                            description: 'Estimate line items',
                            items: {
                                type: 'object',
                                properties: {
                                    description: { type: 'string', example: 'HVAC Filter Replacement' },
                                    quantity: { type: 'number', example: 2 },
                                    unitPrice: { type: 'number', example: 45.00 },
                                    total: { type: 'number', example: 90.00 }
                                }
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Estimate creation timestamp'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Resource not found'
                        },
                        code: {
                            type: 'string',
                            description: 'Error code',
                            example: 'NOT_FOUND'
                        }
                    }
                }
            },
            responses: {
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                BadRequest: {
                    description: 'Invalid request data',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                InternalError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./server/routes.ts', './server/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { color: #2563eb }
    `,
        customSiteTitle: 'TechAssist AI API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            tryItOutEnabled: true
        }
    }));

    // Redirect root API path to documentation
    app.get('/api', (req, res) => {
        res.redirect('/api-docs');
    });

    console.log('📚 API Documentation available at: http://localhost:5000/api-docs');
};

export default specs;