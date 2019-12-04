const generateHtml = require('./lib/generateHtml');
const importContents = require('./lib/importContents');
const copyImages = require('./lib/copyImages');
const defaultOptions = require('./lib/defaultOptions');

module.exports = function (options) {
	let opts = Object.assign({}, defaultOptions, options);

	return Promise.all([
		importContents(opts)
			.then((contentTree) => {
				return generateHtml(opts, contentTree);
			}),
		copyImages(opts)
	]);
};
