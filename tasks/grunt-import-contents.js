/* get all data contents
 * store them as a humongous JSON file
 */
'use strict';

module.exports = function (grunt) {
	var fs = require('fs'),
		path = require('path'),
		_ = grunt.util._,
		content = require('./lib/content').init(grunt);

	// log colors
	var red   = '\u001b[31m',
		blue  = '\u001b[34m',
		green = '\u001b[32m',
		reset = '\u001b[0m';

	// inspired from grunt.file.recurse function https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js
	/*
	var getDataRecurse = function(rootdir, data, subdir) {
		var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
		fs.readdirSync(abspath).forEach(function(filename){
			var filepath = path.join(abspath, filename);
			if (fs.statSync(filepath).isDirectory()) {
				data[filename] = {};
				getDataRecurse(rootdir, data[filename], path.join(subdir || '', filename || ''));
			} else {
				data[filename] = content.parse(filepath);
			}
		});
	};
	*/

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
		var config = grunt.file.readJSON(options.config);

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
					filecontent = {};

				filecontent = content.parse(filepath, options);

				// add filepath property if not specified
				if (!filecontent.filepath) {
					filecontent.filepath = relpath;
				}
				filecontent.url = '/' + path.dirname(relpath);

				// add full path for images
				var image = /<img src=\"(.*\.(jpg|png))\"/g;
				if (filecontent.main) {
					filecontent.main = filecontent.main.replace(image, '<img src=\"' + filecontent.url + "/$1\"");
				}

				// Put content to the contentTree
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
				currentDir[basename] = filecontent;
			});

			// Get pagination options from Gruntfile.js
			var paginateOptions = {};
			_(options.paginate).forEach(function(opt){
				// make the directory the key, so easier to access options
				paginateOptions[opt.dir] = {
					postPerPage: opt.postPerPage,
					template: opt.template,
					title: opt.title,
					orderBy: opt.orderby
				}
			});

			// paginate if something is specified
			if (!_.isEmpty(paginateOptions)) {
				// store all directories' archives
				var archives = contentTree.contents.archives = {};
				// iterate through global content object
				// only support archive at top level
				_(contentTree.contents).forEach(function(dir, key) {
					if ( paginateOptions.hasOwnProperty(key) ) {
						var archive = content.paginate(dir, key, paginateOptions[key]);

						// make the first page of archive available at top level
						if (archive['1']) {
							archive['index.html'] = archive['1']['index.html'];
						}
						_.extend(contentTree.contents[key], archive);

						// also make this archive available for a special archive portion of the contentTree
						contentTree.contents.archives[key] = archive;
					}
				});
			}

			grunt.file.write(f.dest, JSON.stringify(contentTree, null, '\t'));
		});
	});
};