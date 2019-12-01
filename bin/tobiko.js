#!/usr/bin/env node

const tobiko = require('../');
const config = require('@tridnguyen/config');
const chokidar = require('chokidar');
const importContents = require('../lib/importContents');
const generateHtml = require('../lib/generateHtml');
const argv = require('yargs')
	.usage('Run tobiko and generate static files!\n\nUsage: $0 [options]')
	.option('file', {
		alias: 'f',
		default: 'tobiko.js',
		describe: 'path to config file'
	})
	.option('watch', {
		alias: 'w',
		describe: 'watch mode'
	})
	.help().alias('help', 'h')
	.version().alias('version', 'v')
	.argv;

const options = config(argv.file, {
	caller: false
});

let contentTree, importingContents, generatingHtml, contentTimeout, htmlTimeout;

tobiko(options);

function doImportContents (path) {
	if (path) {
		process.stdout.write(`${path} has changed. `);
	}
	if (contentTimeout) {
		clearTimeout(contentTimeout);
		contentTimeout = undefined;
	}
	if (importingContents) {
		console.log('Content updating already in process. Wait...');
		contentTimeout = setTimeout(doImportContents, 1000);
		return Promise.resolve();
	}
	importingContents = true;
	console.log('Updating content...');
	return importContents(options).then(contents => {
		contentTree = contents;
		importingContents = false;
		contentTimeout = undefined;
		console.log('Content updated.');
	});
}

function doGenerateHtml (path) {
	if (path) {
		process.stdout.write(`${path} has changed. `);
	}
	if (htmlTimeout) {
		clearTimeout(htmlTimeout);
		htmlTimeout = undefined;
	}
	if (generatingHtml) {
		console.log('HTML generating is already in process. Wait...');
		htmlTimeout = setTimeout(doGenerateHtml, 1000);
		return;
	}
	// use the "cached" contentTree to avoid re-importing contents
	if (contentTree) {
		generatingHtml = true;
		console.log('Generating new HTML...');
		generateHtml(options, contentTree).then(() => {
			generatingHtml = false;
			htmlTimeout = undefined;
			console.log('HTML generated.');
		});
	} else {
		doImportContents().then(doGenerateHtml);
	}
}

if (argv.watch) {
	chokidar.watch(options.contentsDir)
		.on('change', doImportContents);
	chokidar.watch(options.handlebars.templatesDir)
		.on('change', doGenerateHtml);
}
