const fs = require('fs');
const path = require('path');
const jsYAML = require('js-yaml');
const marked = require('marked');
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
			let sections = fileContent.split('---');
			// YAML frontmatter is the part in between the 2 '---'
			content = jsYAML.safeLoad(sections[1]);

			// get to the markdown part
			sections.shift();
			sections.shift();

			// convert markdown data to html
			let markdown = marked(sections.join('---'));
			// convert new line characters to html line breaks
			// markdown = nl2br(markdown);

			content.main = markdown;
		} catch (e) {
			debug(e + ' .Failed to parse markdown data from ' + filepath);
		}
	}
	return content;
};
