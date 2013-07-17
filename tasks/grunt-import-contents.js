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


	/* convert new line characters to html linebreaks
	 * inspired by nl2br function from php.js
	 * https://github.com/kvz/phpjs/blob/master/functions/strings/nl2br.js
	 * @param {String} str
	 * @return {String}
	*/
	var nl2br = function(str) {
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>');
	}

	// parse JSON and markdown content
	var parseContent = function(filepath, options) {
		var ext = path.extname(filepath),
			basename = path.basename(filepath),
			// remove 'contents' from path
			content;

		// Ignore draft posts (_) and dotfiles
		if (basename[0] === '_' || basename[0] === '.') {
			return;
		}

		// get the JSON files
		if (ext === '.json') {
			content = grunt.file.readJSON(filepath);

			// parse markdown files
			// with some inspiration from https://github.com/ChrisWren/grunt-pages/blob/master/tasks/index.js
		} else if (ext === '.md') {
			var fileContent = grunt.file.read(filepath);

			// set options for marked
			if (options && options.markdown) {
				marked.setOptions(options.markdown);
			}

			try {
				var sections = fileContent.split('---');
				// YAML frontmatter is the part in between the 2 '---'
				content = jsYAML.safeLoad(sections[1]);

				// get to the markdown part
				sections.shift();
				sections.shift();

				// convert markdown data to html
				var markdown = marked(sections.join('---'));
				// convert new line characters to html line breaks
				markdown = nl2br(markdown);

				content['markdown'] = markdown;

			} catch (e) {
				grunt.fail.fatal(e + ' .Failed to parse markdown data from ' + filepath);
			}
		}

		// add support for date using moment.js http://momentjs.com/
		if (content) {
			if(!content.date) {
				content.date = fs.statSync(filepath).ctime;
			}
			// if date isn't already a moment type, convert it to momentjs
			if (!moment.isMoment(content.date)) {
				var mDate = moment(content.date);
				// check if the string is a valid date format http://momentjs.com/docs/#/parsing/string/
				if (mDate.isValid()) {
					content.date = mDate;
				} else {
					grunt.log.writeln('The date used in ' + filepath + ' is not supported.');
				}
			}
		}
		return content;
	};

	// inspired from grunt.file.recurse function https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js
	var getDataRecurse = function(rootdir, data, subdir) {
		var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
		fs.readdirSync(abspath).forEach(function(filename){
			var filepath = path.join(abspath, filename);
			if (fs.statSync(filepath).isDirectory()) {
				data[filename] = {};
				getDataRecurse(rootdir, data[filename], path.join(subdir || '', filename || ''));
			} else {
				data[filename] = parseContent(filepath);
			}
		});
	};

	grunt.registerMultiTask('import_contents', 'import all JSON and MD files', function () {
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

		// Content Tree
		var contentTree = {};
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
				var dirname = path.dirname(filepath),
					directories = dirname.split(path.sep),
					basename = path.basename(filepath),
					relpath = path.relative(options.baseDir, filepath),
					content = {};

				content = parseContent(filepath, options);

				// add filepath property if not specified
				if (!content.filepath) {
					content.filepath = relpath;
				}

				// start at the top of the content tree
				var currentDir = contentTree;

				// iterate through the directory path
				for (var obj in directories) {
					// if the directory doesn't exist yet, create an empty object in the content tree
					if (!currentDir[directories[obj]]) {
						currentDir = currentDir[directories[obj]] = {};
					// if the directory already exists, move into a deeper level
					} else {
						currentDir = currentDir[directories[obj]];
					}
				}
				// once the deepest directory level is reached, put new content on the Content Tree
				currentDir[basename] = content;

			});

			grunt.file.write(f.dest, JSON.stringify(contentTree, null, '\t'));
		});
	});
};