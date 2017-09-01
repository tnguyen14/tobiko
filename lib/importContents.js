const fs = require('fs');
const path = require('path');
const glob = require('glob');
const decorate = require('./content/decorate');
const parse = require('./content/parse');
const plugins = require('./content/plugins');

function importContents (opts) {
	var contentTree = {};
	return new Promise((resolve, reject) => {
		glob(opts.contentsDir + '/**/*.{md,json}', (err, files) => {
			if (err) {
				return reject(err);
			}
			files.forEach((filepath) => {
				processFile(filepath, opts, contentTree);
			});

			resolve(contentTree);
		});
	}).then((contentTree) => {
		return plugins(opts.plugins, contentTree);
	});
}

function processFile (filepath, opts, contentTree) {
	let pathWithoutContentsDir = path.relative(opts.contentsDir, filepath);
	let directories = path.dirname(pathWithoutContentsDir).split(path.sep);
	let file = parse(filepath, opts.markdown);
	if (!file) {
		return;
	}

	if (!file.date) {
		file.date = fs.statSync(filepath).ctime;
	}
	file = decorate(file, pathWithoutContentsDir);

	// Put the file content on the content tree

	// Start at the top of the content tree, traverse the directory path
	let currentDir = contentTree;
	directories.forEach((d) => {
		// skip the first level
		if (d === '.') {
			return;
		}
		// if the dir doesn't exist yet, create an empty object on the content tree
		if (!currentDir[d]) {
			currentDir = currentDir[d] = {};
		// if the directory already there, go into the next dir level
		} else {
			currentDir = currentDir[d];
		}
	});
	currentDir[file.filename] = file;
}

module.exports = importContents;
