function generateSpec(plugins) {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Public API',
      version: '1.0.0',
      description: 'Public REST API with Plugin System',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development Server'
      }
    ],
    paths: {},
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Success'
            },
            result: {
              type: 'object'
            }
          }
        }
      }
    }
  };

  // Generate paths from plugins
  Object.values(plugins).forEach(plugin => {
    if (!plugin.route) return;
    
    const method = plugin.method || 'get';
    const path = `/api${plugin.route}`;
    
    if (!spec.paths[path]) {
      spec.paths[path] = {};
    }
    
    spec.paths[path][method] = {
      summary: plugin.desc || plugin.name,
      description: plugin.desc || `Endpoint for ${plugin.name}`,
      tags: [plugin.category || 'General'],
      parameters: [],
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
              }
            }
          }
        },
        400: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    };

    // Add parameters
    if (plugin.params && plugin.params.length > 0) {
      plugin.params.forEach(param => {
        spec.paths[path][method].parameters.push({
          name: param,
          in: 'query',
          required: true,
          description: `${param} parameter`,
          schema: {
            type: 'string'
          }
        });
      });
    }

    // Add request body for POST/PUT
    if (['post', 'put'].includes(method.toLowerCase())) {
      spec.paths[path][method].requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {}
            }
          }
        }
      };

      if (plugin.params && plugin.params.length > 0) {
        plugin.params.forEach(param => {
          spec.paths[path][method].requestBody.content['application/json'].schema.properties[param] = {
            type: 'string'
          };
        });
      }
    }
  });

  return spec;
}

module.exports = { generateSpec };