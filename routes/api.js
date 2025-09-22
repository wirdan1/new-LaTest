const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

module.exports = function(plugins) {
  // Dynamic route handler
  router.use('/:pluginName/*?', async (req, res, next) => {
    const { pluginName } = req.params;
    const plugin = plugins[pluginName];
    
    if (!plugin) {
      return res.status(404).json({
        status: false,
        message: `Plugin '${pluginName}' not found`,
        availablePlugins: Object.keys(plugins)
      });
    }

    try {
      // Handle different parameter types
      const params = {};
      
      // Query parameters
      if (plugin.params) {
        plugin.params.forEach(param => {
          if (req.query[param]) {
            params[param] = req.query[param];
          }
        });
      }

      // Body parameters (for POST/PUT)
      if (['post', 'put'].includes(req.method.toLowerCase()) && req.body) {
        Object.assign(params, req.body);
      }

      // File upload
      if (req.file) {
        params.file = req.file;
      }

      // Add request context
      req.params = params;
      
      // Execute plugin
      await plugin.run(req, res);
    } catch (error) {
      console.error(`Error in plugin ${pluginName}:`, error);
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  // List all plugins
  router.get('/', (req, res) => {
    const pluginList = Object.values(plugins).map(plugin => ({
      name: plugin.name,
      description: plugin.desc,
      category: plugin.category,
      route: plugin.route,
      method: plugin.method || 'GET',
      parameters: plugin.params || []
    }));

    res.json({
      status: true,
      message: 'Available plugins',
      count: pluginList.length,
      plugins: pluginList
    });
  });

  return router;
};