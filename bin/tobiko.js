#!/usr/bin/env node

const tobiko = require('../');
const config = require('@tridnguyen/config');
const chokidar = require('chokidar');
const importContents = require('../lib/importContents');
const generateHtml = require('../lib/generateHtml');
const defaultOptions = require('../lib/defaultOptions');
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

const options = config(defaultOptions, argv.file, {
	caller: false
});

let contentTree, importingContents, generatingHtml, contentTimeout, htmlTimeout;

tobiko(options).then(null, err => {
	console.error(err);
});

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
	}, (err) => {
		importContents = false;
		contentTree = undefined;
		console.error(err);
	});
}

function doGenerateHtml (path) {
	if (path) {
		console.log(`"${path}" has changed.`);
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
		}, (err) => {
			console.log('an error has occurred');
			generatingHtml = false;
			htmlTimeout = undefined;
			console.error(err);
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
