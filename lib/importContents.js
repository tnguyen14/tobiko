const plugins = require('./content/plugins');

function importContents (opts) {
	return Promise.all(plugins(opts.plugins, {}));
}

module.exports = importContents;
