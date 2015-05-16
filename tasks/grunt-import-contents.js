/**
 * get all data contents
 * store them as a humongous JSON file
 */
'use strict';

var _ = require('lodash');
var path = require('path');

var decorate = require('./lib/decorate');
var parse = require('./lib/parse');
var archive = require('./lib/archive');

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
				var directories = path.dirname(filepath).split(path.sep),
					file;

				file = parse(filepath, options.markdown);
				file = decorate(file, filepath, options.baseDir);

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
				currentDir[file.filename] = file;
			});

			var archives = {};
			// paginate if something is specified
			if (!_.isEmpty(options.paginate)) {
				// iterate through global content object
				// only support archive at top level
				_.forEach(options.paginate, function(option, key) {
					if (contentTree.hasOwnProperty(key)) {
						var archive = archive.paginate(contentTree[key], key, option);
						_.extend(contentTree[key], archive);
						// also make this archive available for a special archive portion of the contentTree
						archives[key] = archive;
					}
				});
			}
			contentTree.archives = archives;

			grunt.file.write(f.dest, JSON.stringify(contentTree, null, '\t'));
		});
	});
};