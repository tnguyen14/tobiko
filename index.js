const path = require('path');
const fs = require('fs');
const decorate = require('./lib/decorate');
const parse = require('./lib/parse');
const getTemplates = require('./lib/templates');
const glob = require('glob');
const debug = require('debug')('tobiko');
const mkdirp = require('mkdirp');

module.exports = function (opts) {
	return importContents(opts).then((contentTree) => {
		return generateHtml(opts, contentTree);
	});
}

function importContents (options) {
	let opts = Object.assign({}, {
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
	}, options);

	var contentTree = {};

	return new Promise((resolve, reject) => {
		glob(opts.baseDir + '/**/*.{md,json}', (err, files) => {
			files.forEach((filepath) => {
				processFile(filepath, opts, contentTree);
			});

			resolve(contentTree);
		});
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

function generateHtml (options, contentTree) {
	let opts = Object.assign({}, {
		handlebars: {
			templatesDir: 'app/templates',
			partialsDir: 'app/templates/partials',
			helpersDir: 'app/templates/helpers'
		}
	}, options);

	let env = process.env.ENV;

	let config = require(process.cwd() + '/config.json');
	if (env) {
		try {
			fs.statSync(process.cwd() + '/config.' + env + '.json');
			Object.assign(config, require(process.cwd() + '/config.' + env + '.json'));
		} catch (e) {
			debug(e);
		}
	}
	
	let templates = getTemplates(opts.handlebars);

	let fileTally = 0;

	return renderContent(contentTree)
		.then(() => {
			debug('Created ' + fileTally + ' files.');
		}, (err) => {
			debug(err);
		});
	
	function renderContent (contents) {
		return Promise.all(Object.keys(contents).map((filename) => {
			let file = contents[filename];

			// check if file is an object
			if (file !== Object(file)) {
				return;
			}
			// keep going deeper into the content tree
			if (!file.template) {
				return renderContent(file);
			}
			if (!templates[file.template]) {
				debug('Could not find template ' + file.template + ' for ' + filename);
				return;
			}
			let context = Object.assign({}, contents);
			let dirname = path.dirname(file.filepath);
			// expose env
			file.env = env;

			// expose file content? on the context
			context.content = file;
			// expose config on the context
			context.config = config;

			// make all data available as context's "global"
			context.global = contents;

			let html = templates[file.template](context);

			if (dirname === '.') {
				dirname = '';
			}

			let outPath = path.join(options.outDir, dirname, file.filename + '.html');
			return new Promise((resolve, reject) => {
				mkdirp(path.dirname(outPath), (err) => {
					if (err) {
						return reject(err);
					}
					fs.writeFile(outPath, html, (err) => {
						if (err) {
							return reject(err);
						}
						debug('"' + outPath + '" was created.');
						fileTally++;
						resolve(file.filename);
					});
				});
			});
		}));
	}
}
