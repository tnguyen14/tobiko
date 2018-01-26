const plugins = require('./content/plugins');
const importFiles = require('../plugins/files');

function importContents(opts) {
  return Promise.all(plugins(opts.plugins, {}));
}

module.exports = importContents;
