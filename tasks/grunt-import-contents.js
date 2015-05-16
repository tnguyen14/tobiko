/**
 * get all data contents
 * store them as a humongous JSON file
 */
'use strict';

var _ = require('lodash');
var path = require('path');

var decorate = require('./lib/decorate');
var parse = require('./lib/parse');
var paginate = require('./lib/paginate');

module.exports = function (grunt) {
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
					basename = path.basename(filepath, path.extname(filepath)),
					relpath = path.relative(options.baseDir, filepath),
					file;

				file = parse(filepath, options);
				file = decorate(file, filepath, options.baseDir);

				// add full path for images
				var image = /<img src=\"(.*\.(jpg|png))\"/g;
				if (file.main) {
					file.main = file.main.replace(image, '<img src="/' + path.dirname(file.filepath) + '/$1"');
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
				currentDir[basename] = file;
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
				};
			});

			// paginate if something is specified
			if (!_.isEmpty(paginateOptions)) {
				// store all directories' archives
				contentTree.contents.archives = {};
				// iterate through global content object
				// only support archive at top level
				_(contentTree.contents).forEach(function(dir, key) {
					if ( paginateOptions.hasOwnProperty(key) ) {
						var archive = paginate(dir, key, paginateOptions[key]);

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