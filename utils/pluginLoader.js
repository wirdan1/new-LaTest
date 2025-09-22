const fs = require('fs');
const path = require('path');

function loadPlugins(pluginsDir) {
  const plugins = {};
  
  if (!fs.existsSync(pluginsDir)) {
    console.log('Plugins directory not found, creating...');
    fs.mkdirSync(pluginsDir, { recursive: true });
    return plugins;
  }

  const pluginFiles = fs.readdirSync(pluginsDir).filter(file => 
    file.endsWith('.js') && !file.startsWith('.')
  );

  console.log(`Loading ${pluginFiles.length} plugins...`);

  pluginFiles.forEach(file => {
    try {
      const pluginPath = path.join(pluginsDir, file);
      const plugin = require(pluginPath);
      
      if (plugin.name && plugin.run) {
        plugins[plugin.name] = plugin;
        console.log(`Plugin loaded: ${plugin.name}`);
      } else {
        console.warn(`Invalid plugin: ${file}`);
      }
    } catch (error) {
      console.error(`Error loading plugin ${file}:`, error.message);
    }
  });

  return plugins;
}

module.exports = { loadPlugins };