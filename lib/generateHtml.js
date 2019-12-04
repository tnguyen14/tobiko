const fs = require('fs');
const path = require('path');
const debug = require('debug')('tobiko');
const mkdirp = require('mkdirp');
const compileHandlebars = require('./templates/compileHandlebars');

function generateHtml (opts, contentTree) {
	let env = process.env.ENV || '';

	let config = require(process.cwd() + '/config.json');
	if (env) {
		try {
			fs.statSync(process.cwd() + '/config.' + env + '.json');
			Object.assign(config, require(process.cwd() + '/config.' + env + '.json'));
		} catch (e) {
			debug(e);
		}
	}

	let templates = compileHandlebars(opts.handlebars);

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
			context.global = contentTree;

			let html = templates[file.template](context);

			if (dirname === '.') {
				dirname = '';
			}

			let outPath = path.join(opts.outDir, dirname, file.filename + '.html');
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

module.exports = generateHtml;
