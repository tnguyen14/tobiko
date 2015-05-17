/**
 * get all data contents
 * store them as a humongous JSON file
 */
'use strict';

var path = require('path');
var fs = require('fs');

var decorate = require('../lib/decorate');
var parse = require('../lib/parse');
var archive = require('../plugins/archive');
var wordpress = require('../plugins/wordpress');

module.exports = function (grunt) {
	grunt.registerMultiTask('import_contents', 'import all JSON and MD files', function () {
		var done = this.async();
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
			.forEach(function (fpath) {
				var filepath = path.relative(options.baseDir, fpath);
				var directories = path.dirname(filepath).split(path.sep),
					file;

				file = parse(fpath, options.markdown);
				if (!file.date) {
					file.date = fs.statSync(fpath).ctime;
				}
				file = decorate(file, filepath);

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

			var plugins = new Promise(function (resolve) {
				resolve(contentTree);
			});

			plugins.then(function (contentTree) {
				return wordpress.init(contentTree, options.wordpress);
			}).then(function (contentTree) {
				return archive.init(contentTree, options.archives);
			}).then(function (contentTree) {
				grunt.file.write(f.dest, JSON.stringify(contentTree, null, '\t'));
				done();
			});
		});
	});
};