// register plugins
const plugins = {
  wordpress: require('../../plugins/wordpress'),
  archive: require('../../plugins/archive'),
  files: require('../../plugins/files'),
  transform: function(contentTree, fn) {
    if (typeof fn === 'function') {
      return fn(contentTree);
    }
    // pass through by default
    return Promise.resolve(contentTree);
  }
};

function processPlugins(options, contentTree) {
  let opts = Object.assign(
    {},
    {
      files: {},
      archive: {},
      wordpress: {}
    },
    options
  );
  // pass through plugins
  return Object.keys(plugins).reduce((prevPlugin, pluginName) => {
    return prevPlugin.then(contents => {
      // NOTE: should plugin be skipped if no option is provided for plugin?
      return plugins[pluginName](contents, opts[pluginName]);
    });
  }, Promise.resolve(contentTree));
}

module.exports = processPlugins;
