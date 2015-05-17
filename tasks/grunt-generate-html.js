/* grunt-handlebars-html task
 * compile handlebars templates to static HTML
 */

'use strict';

var path = require('path');
var _ = require('lodash');
var getTemplates = require('../lib/templates');

module.exports = function (grunt) {
	// Grunt task!
	grunt.registerMultiTask('generate_html', 'write templates to html', function () {
		var options = this.options({
			partialDir: 'app/templates/partials',
			helperDir: 'app/templates/helpers'
		});
		var env = this.target;
		// site config
		var config = grunt.file.readJSON('./config.json');

		// environment specific config
		if (grunt.file.exists('./config.' + env + '.json')) {
			_.extend(config, grunt.file.readJSON('./config.' + env + '.json'));
		}

		this.files.forEach(function (f) {
			// filter out files that doesn't exist
			var templateFiles = f.src.filter(function (filepath) {
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});
			var templates = getTemplates(templateFiles, options);
			var data = grunt.file.readJSON(f.data);
			var tally = 0;

			// recursively go through content and display the ones with a template
			function renderContent(contents) {
				_.forEach(contents, function (content, key, folder) {
					// if the file has a template property -> render it
					if (content.template) {
						if (templates[content.template]) {
							// pass in the whole folder to make other sibling contents available
							var context = folder;
							var dirname = path.dirname(content.filepath);
							var html;
							// expose env and config to content
							content.env = env;

							// put the file content on the context
							context.content = content;
							context.config = config;
							html = templates[content.template](context);

							// remove the dot in dirname
							if (dirname === '.') {
								dirname = '';
							}
							// write the compiled html to file
							var outpath = path.join(f.dest, dirname, content.filename + '.html');
							grunt.file.write(outpath, html);
							grunt.verbose.ok('"' + outpath + '" was created.');
							tally++;
						} else {
							grunt.log.warn('Could not find template ' + content.template + ' for ' + key);
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
			}

			// render all the contents
			renderContent(data.contents);
			grunt.log.writeln( 'Created ' + tally.toString().cyan + ' files.');
		});
	});

};