const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const glob = require('glob');
const debug = require('debug')('tobiko');

module.exports = function (options) {
	var templates = [];
	// register helpers
	if (options.helpersDir) {
		try {
			fs.statSync(options.helpersDir);
			// read helper directory and save all filenames
			var helpers = fs.readdirSync(options.helpersDir);
			// register helper with their filename as helper name
			helpers.forEach(function (h) {
				var basename = path.basename(h, path.extname(h));
				var filepath = path.resolve(options.helpersDir, h);
				Handlebars.registerHelper(basename, require(filepath));
			});
		} catch (e) {
			debug(e);
		}
	}

	// register partials
	if (options.partialsDir) {
		try {
			fs.statSync(options.partialsDir);
			// read partial directory and save all filenames
			var partials = fs.readdirSync(options.partialsDir);
			// register helper with their filename as helper name
			partials.forEach(function (p) {
				var basename = path.basename(p, path.extname(p));
				var filepath = path.resolve(options.partialsDir, p);
				Handlebars.registerPartial(basename, fs.readFileSync(filepath, 'utf8'));
			});
		} catch (e) {
			debug(e);
		}
	}

	if (!options.templatesDir) {
		return [];
	}

	var templateFiles = glob.sync(options.templatesDir + '/*.{handlebars,hbs}');
	templateFiles.forEach(function (filepath) {
		var basename = path.basename(filepath);
		var src = fs.readFileSync(filepath, 'utf8');

		templates[basename] = Handlebars.compile(src);
	});
	return templates;
};
