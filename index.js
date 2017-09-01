const generateHtml = require('./lib/generateHtml');
const importContents = require('./lib/importContents');
const copyImages = require('./lib/copyImages');

// register plugins
const plugins = {
	wordpress: require('./plugins/wordpress'),
	archive: require('./plugins/archive'),
	transform: function (contentTree, fn) {
		if (typeof fn === 'function') {
			return fn(contentTree);
		}
		// pass through by default
		return Promise.resolve(contentTree);
	}
};

module.exports = function (options) {
	let opts = Object.assign({}, {
		contentsDir: 'contents',
		outDir: 'dist',
		markdown: {
			breaks: true,
			smartLists: true,
			smartypants: true
		},
		plugins: {
			archives: {},
			wordpress: {}
		}
	}, options);

	return Promise.all([
		importContents(opts)
			.then((contents) => {
				// pass through plugins
				return Object.keys(plugins).reduce((prevPlugin, pluginName) => {
					return prevPlugin.then((contents) => {
						return plugins[pluginName](contents, opts.plugins[pluginName]);
					});
				}, Promise.resolve(contents));
			})
			.then((contentTree) => {
				return generateHtml(opts, contentTree);
			}),
		copyImages(opts)
	]);
};
