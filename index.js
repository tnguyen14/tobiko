const path = require('path');
const fs = require('fs');
const decorate = require('./lib/decorate');
const parse = require('./lib/parse');
const glob = require('glob');
const debug = require('debug')('tobiko');

module.exports = function (opts) {
	importContents(opts);
}

function importContents (options) {
	let opts = Object.assign({}, options, {
		baseDir: 'contents',
		markdown: {
			breaks: true,
			smartLists: true,
			smartypants: true
		},
		plugins: {
			archives: {},
			wordpress: {}
		}
	});

	var contentTree = {};

	glob(opts.baseDir + '/**/*.{md,json}', (err, files) => {
		files.forEach((filepath) => {
			processFile(filepath, opts, contentTree);
		});

		if (options.outFile) {
			fs.writeFile(options.outFile, JSON.stringify(contentTree, null, '\t'), (err) => {
				if (err) {
					debug(err);
					return;
				}
				debug('Finished writing contents to ' + options.outFile);
			});
		} else {
			console.log(JSON.stringify(contentTree));
		}
	});
}

function processFile (filepath, opts, contentTree) {
	let pathWithoutBaseDir = path.relative(opts.baseDir, filepath);
	let directories = path.dirname(pathWithoutBaseDir).split(path.sep);
	let file = parse(filepath, opts.markdown);

	if (!file.date) {
		file.date = fs.statSync(filepath).ctime;
	}
	file = decorate(file, pathWithoutBaseDir);

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

