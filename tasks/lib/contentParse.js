'use strict';

var grunt = require('grunt');
var fs = require('fs');
var path = require('path');
var jsYAML = require('js-yaml');
var moment = require('moment');
var marked = require('marked');

// Parse JSON and markdown content
module.exports = function(filepath, options) {
	var ext = path.extname(filepath),
		basename = path.basename(filepath, ext),
		// remove 'contents' from path
		file;

	// Ignore draft posts (_) and dotfiles
	if (basename[0] === '_' || basename[0] === '.') {
		return;
	}

	// get the JSON files
	if (ext === '.json') {
		file = grunt.file.readJSON(filepath);

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
			file = jsYAML.safeLoad(sections[1]);

			// get to the markdown part
			sections.shift();
			sections.shift();

			// convert markdown data to html
			var markdown = marked(sections.join('---'));
			// convert new line characters to html line breaks
			// markdown = nl2br(markdown);

			file.main = markdown;
		} catch (e) {
			grunt.fail.fatal(e + ' .Failed to parse markdown data from ' + filepath);
		}
	}

	if (file) {
		// add support for date using moment.js http://momentjs.com/
		if (!file.date) {
			file.date = fs.statSync(filepath).ctime;
		}
		// if date isn't already a moment type, convert it to momentjs
		if (!moment.isMoment(file.date)) {
			var mDate = moment(file.date);
			// check if the string is a valid date format http://momentjs.com/docs/#/parsing/string/
			if (mDate.isValid()) {
				file.date = mDate;
			} else {
				grunt.log.writeln('The date used in ' + filepath + ' is not supported.');
			}
		}

		// add file name and extension
		file.filename = basename;
		file.fileext = ext;

		// // add full path for images
		// var image = /<img src=\"(.*\.jpg|png)\"/;
		// if (file.main) {
		// 	console.log(file.url);
		// 	file.main = file.main.replace(image, '<img src=\"' + file.url + "/$1\"");
		// }
	}
	return file;
};