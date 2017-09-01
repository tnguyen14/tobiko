#!/usr/bin/env node

const tobiko = require('../');
const config = require('@tridnguyen/config');
const argv = require('yargs')
	.usage('Run tobiko and generate static files!\n\nUsage: $0 [options]')
	.option('file', {
		alias: 'f',
		default: 'tobiko.json',
		describe: 'path to config file'
	})
	.help().alias('help', 'h')
	.argv;

tobiko(config(argv.file, {
	caller: false
}));
