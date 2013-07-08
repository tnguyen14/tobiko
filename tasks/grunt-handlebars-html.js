/* grunt-handlebars-html task
 * compile handlebars templates to static HTML
 */

'use strict';

module.exports = function (grunt) {
	var config = grunt.file.readJSON('./config.json');
	var fs = require('fs'),
		path = require('path'),
		Handlebars = require('handlebars');

	grunt.registerMultiTask('handlebars_html', 'write templates to html', function () {
		var _ = grunt.util._;

		var options = this.options({
			partialDir: 'app/templates/partials',
			helperDir: 'app/templates/helpers'
		});

		// register helpers
		if (fs.existsSync(options.helperDir)) {
			// read helper directory and save all filenames
			var helpers = fs.readdirSync(options.helperDir);
			// register helper with their filename as helper name
			helpers.forEach(function (h) {
				var ext = path.extname(h),
					basename = path.basename(h, ext),
					filepath = path.resolve(options.helperDir, h);
				Handlebars.registerHelper(basename, require(filepath));
			});
		}

		// register partials
		if (fs.existsSync(options.partialDir)) {
			// read partial directory and save all filenames
			var partials = fs.readdirSync(options.partialDir);
			// register helper with their filename as helper name
			partials.forEach(function (p) {
				var ext = path.extname(p),
					basename = path.basename(p, ext),
					filepath = path.resolve(options.partialDir, p),
					partial = grunt.file.read(filepath);
				Handlebars.registerPartial(basename, partial);
			});
		}

		this.files.forEach(function (f) {
			var path = require('path'),
				templates = {},
				env = grunt.task.current.target,
				dataFile = grunt.file.readJSON(f.data);
			// filter out files that doesn't exist
			f.src.filter(function (filepath) {
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			})
				.forEach(function (filepath) {
					var basename = path.basename(filepath),
						src = grunt.file.read(filepath);

					templates[basename] = Handlebars.compile(src);
				});

			// match data to templates
			var renderContent = function(content) {
				_(content).forEach(function (content, key, collections) {
					// if the file has a template property -> render it
					if (content.template) {
						if (templates[content.template]) {
							// expose env and config to content
							content.env = env;
							content.config = config;

							// pass in the whole collections to make other sibling contents available
							collections.content = content;
							var html = templates[content.template](collections);

							// if a filepath is explicitly specified, use that instead
							// otherwise, use the directory and file structure as path
							var filepath = (content.filepath) ? content.filepath : key;
							var ext = path.extname(filepath),
								dirname = path.dirname(filepath),
								basename = path.basename(filepath, ext);

							// remove the dot in dirname, add the trailing slash where appropriate
							if (dirname === '.') {
								dirname = '';
							} else {
								dirname = dirname + '/';
							}

							// write the compiled html to file
							var outputFile = f.dest + '/' + dirname + basename + '.html';
							grunt.file.write(outputFile, html);
							grunt.log.writeln('"' + outputFile + '" was created.');
						} else {
							grunt.log.writeln('Could not find template ' + content.template + ' for ' + key);
						}
					} else {
						// Keep going deeper into the content tree if there is more
						if (_.isObject(content)) {
							renderContent(content);
						} else {
							return;
						}
					}
				});
			};

			renderContent(dataFile.contents);

		});
	});

};