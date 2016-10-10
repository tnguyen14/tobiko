'use strict';

var fs = require('fs');
var path = require('path');
var jsYAML = require('js-yaml');
var moment = require('moment');
var marked = require('marked');
var debug = require('debug')('tobiko');

/* convert new line characters to html linebreaks
 * inspired by nl2br function from php.js
 * https://github.com/kvz/phpjs/blob/master/functions/strings/nl2br.js
 * @param {String} str
 * @return {String}
*/
var nl2br = function(str) {
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>');
};


// Parse JSON and markdown content
module.exports = function(filepath, markdownOptions) {
	var ext = path.extname(filepath);
	var basename = path.basename(filepath, ext);
	var content;

	// Ignore draft posts (_) and dotfiles
	if (basename[0] === '_' || basename[0] === '.') {
		return;
	}

	// get the JSON files
	if (ext === '.json') {
		content = require(path.resolve(filepath));

	// parse markdown files
	// with some inspiration from https://github.com/ChrisWren/grunt-pages/blob/master/tasks/index.js
	} else if (ext === '.md') {
		var fileContent = fs.readFileSync(path.resolve(filepath), 'utf8');

		// set options for marked
		if (markdownOptions) {
			marked.setOptions(markdownOptions);
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
			// markdown = nl2br(markdown);

			content.main = markdown;
		} catch (e) {
			debug(e + ' .Failed to parse markdown data from ' + filepath);
		}
	}
	return content;
};
