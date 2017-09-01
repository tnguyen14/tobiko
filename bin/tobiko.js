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
		default: 'tobiko.json',
		describe: 'path to config file'
	})
	.option('watch', {
		alias: 'w',
		describe: 'watch mode'
	})
	.help().alias('help', 'h')
	.argv;

const options = config(argv.file, {
	caller: false
});

let contentTree, importingContents, generatingHtml, contentTimeout, htmlTimeout;

tobiko(options);

function doImportContents () {
	if (contentTimeout) {
		clearTimeout(contentTimeout);
		contentTimeout = undefined;
	}
	if (importingContents) {
		console.log('Importing in process. Wait...');
		contentTimeout = setTimeout(doImportContents, 1000);
		return;
	}
	importingContents = true;
	return importContents(options).then(contents => {
		contentTree = contents;
		importingContents = false;
		contentTimeout = undefined;
	});
}

function doGenerateHtml () {
	if (htmlTimeout) {
		clearTimeout(htmlTimeout);
		htmlTimeout = undefined;
	}
	if (generatingHtml) {
		console.log('Generating in process. Wait...');
		htmlTimeout = setTimeout(doGenerateHtml, 1000);
		return;
	}
	// use the "cached" contentTree to avoid re-importing contents
	if (contentTree) {
		generatingHtml = true;
		generateHtml(options, contentTree).then(() => {
			generatingHtml = false;
			htmlTimeout = undefined;
		});
	} else {
		doImportContents().then(doGenerateHtml);
	}
}

if (argv.watch) {
	chokidar.watch(options.contentsDir).on('all', doImportContents);
	chokidar.watch(options.handlebars.templatesDir).on('all', doGenerateHtml);
}
