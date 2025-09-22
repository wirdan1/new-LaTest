require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Load plugins
const pluginLoader = require('./utils/pluginLoader');
const swaggerGenerator = require('./utils/swaggerGenerator');

// Initialize plugins
const plugins = pluginLoader.loadPlugins(path.join(__dirname, 'plugins'));

// Generate OpenAPI spec
const openApiSpec = swaggerGenerator.generateSpec(plugins);

// Swagger UI
const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// API Routes
app.use('/api', require('./routes/api')(plugins));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    plugins: Object.keys(plugins).length
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Path ${req.path} not found`,
    documentation: '/api-docs'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});