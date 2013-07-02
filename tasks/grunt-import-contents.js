/* get all data contents
 * store them as a humongous JSON file
 */
'use strict';

module.exports = function (grunt) {
	var fs = require('fs'),
		path = require('path'),
		jsYAML = require('js-yaml'),
		marked = require('marked'),
		moment = require('moment');

	grunt.registerMultiTask('import_contents', 'import all JSON and MD files', function () {
		var data = {},
			files = {};

		var options = this.options({
			baseDir: 'contents',
			config: 'config.json',
			markdown: {
				breaks: true,
				smartLists: true,
				smartypants: true
			}
		});

		// global config
		var config = grunt.file.readJSON(options.config)

		grunt.verbose.writeflags(options, 'Options');

		this.files.forEach(function (f) {
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
				var ext = path.extname(filepath),
					basename = path.basename(filepath),
					// remove 'contents' from path
					buildpath = path.relative(options.baseDir, filepath);

				// Ignore draft posts (_) and dotfiles
				if (basename[0] === '_' || basename[0] === '.') {
					return;
				}

				// get the JSON files
				if (ext === '.json') {
					files[buildpath] = grunt.file.readJSON(filepath);

					// parse markdown files
					// with some inspiration from https://github.com/ChrisWren/grunt-pages/blob/master/tasks/index.js
				} else if (ext === '.md') {
					var fileString = grunt.file.read(filepath);

					// set options for marked
					marked.setOptions(options.markdown);

					try {
						var sections = fileString.split('---');
						// YAML frontmatter is the part in between the 2 '---'
						var content = jsYAML.safeLoad(sections[1]);

						// get to the markdown part
						sections.shift();
						sections.shift();

						// convert markdown data to html
						var markdown = marked(sections.join('---'));
						// convert new line characters to html line breaks
						markdown = nl2br(markdown);

						content['markdown'] = markdown;

						files[buildpath] = content;

					} catch (e) {
						grunt.fail.fatal(e + ' .Failed to parse markdown data from ' + filepath);
					}
				}

				// add support for date using moment.js http://momentjs.com/
				if (files[buildpath].date) {
					// if date isn't already a moment type, convert it to momentjs
					if (!moment.isMoment(files[buildpath].date)) {
						var mDate = moment(files[buildpath].date);
						// check if the string is a valid date format http://momentjs.com/docs/#/parsing/string/
						if (mDate.isValid()) {
							files[buildpath].date = mDate;
						} else {
							grunt.log.writeln('The date used in ' + filepath + ' is not supported.');
						}
					}
				} else {
					files[buildpath].date = fs.statSync(filepath).ctime;
				}

				// add global config
				files[buildpath]['config'] = config;
			});

			data['files'] = files;

			grunt.file.write(f.dest, JSON.stringify(data));
		});
	});

	// convert new line characters to html linebreaks
	// @param {String} str
	// @return {String}

	// inspired by nl2br function from php.js
	// https://github.com/kvz/phpjs/blob/master/functions/strings/nl2br.js

	/*
	function nl2br (str, is_xhtml) {
		var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>';

		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	}
	*/

	function nl2br(str) {
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>');
	}
};