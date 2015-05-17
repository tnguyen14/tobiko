'use strict';

var test = require('tape');
var moment = require('moment');
var parse = require('../lib/parse');
var decorate = require('../lib/decorate');

var fixtures = {
	json: 'test/fixtures/foo.json',
	md: 'test/fixtures/baz.md',
	draftUnderscore: 'test/fixtures/_draft.json',
	draftDot: 'test/fixtures/.draft.md'
};

test('parse JSON file', function(t) {
	t.plan(1);
	var foo = parse(fixtures.json);
	t.equal(foo.title, 'Foo', 'File content');
});

test('parse MD file', function(t) {
	t.plan(2);
	var baz = parse(fixtures.md);
	t.equal(baz.title, 'Baz', 'File content');
	t.equal(baz.main, '<p>This is an example paragraph.</p>\n', 'File content markdown');
});

test('should ignore draft files', function(t) {
	t.plan(2);
	var draftUnderscore = parse(fixtures.draftUnderscore);
	t.notOk(draftUnderscore, 'File with leading _ should be ignored');
	var draftDot = parse(fixtures.draftDot);
	t.notOk(draftDot, 'File with leading . should be ignored');
});

test('decorate file', function(t) {
	t.plan(6);
	var file = decorate({}, fixtures.json);
	t.equal(file.fileext, '.json', 'File extension');
	t.equal(file.filename, 'foo', 'File name');
	t.ok(file.date, 'File date is available');
	t.ok(moment.isMoment(file.date), 'File date is a moment object');
	t.equal(file.filepath, 'test/fixtures/foo.json', 'File path');
	t.equal(file.url, '/test/fixtures', 'File url');
});
