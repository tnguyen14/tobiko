const fs = require('fs');
const path = require('path');
const frontmatter = require('front-matter');
const { marked } = require('marked');
const debug = require('debug')('tobiko');

// Parse JSON and markdown content
module.exports = function (filepath, markdownOptions) {
	let ext = path.extname(filepath);
	let basename = path.basename(filepath, ext);
	let content;

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
		let fileContent = fs.readFileSync(path.resolve(filepath), 'utf8');

		// set options for marked
		if (markdownOptions) {
			marked.setOptions(markdownOptions);
		}

		try {
			let parsedContent = frontmatter(fileContent);
			content = parsedContent.attributes;
			content.main = marked(parsedContent.body);
		} catch (e) {
			debug(e + ' .Failed to parse markdown data from ' + filepath);
		}
	}
	return content;
};
