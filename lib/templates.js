'use strict';

var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');
var grunt = require('grunt');

module.exports = function(templateFiles, options) {
	var templates = [];
	// register helpers
	if (fs.existsSync(options.helperDir)) {
		// read helper directory and save all filenames
		var helpers = fs.readdirSync(options.helperDir);
		// register helper with their filename as helper name
		helpers.forEach(function (h) {
			var basename = path.basename(h, path.extname(h));
			var filepath = path.resolve(options.helperDir, h);
			Handlebars.registerHelper(basename, require(filepath));
		});
	}

	// register partials
	if (fs.existsSync(options.partialDir)) {
		// read partial directory and save all filenames
		var partials = fs.readdirSync(options.partialDir);
		// register helper with their filename as helper name
		partials.forEach(function (p) {
			var basename = path.basename(p, path.extname(p));
			var filepath = path.resolve(options.partialDir, p);
			Handlebars.registerPartial(basename, grunt.file.read(filepath));
		});
	}

	templateFiles.forEach(function (filepath) {
		var basename = path.basename(filepath);
		var src = grunt.file.read(filepath);

		templates[basename] = Handlebars.compile(src);
	});
	return templates;
};