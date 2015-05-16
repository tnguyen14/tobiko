'use strict';

var test = require('tape');
var moment = require('moment');
var parse = require('../tasks/lib/parse');
var decorate = require('../tasks/lib/decorate');

var fixtures = {
	json: 'test/fixtures/foo.json',
	md: 'test/fixtures/baz.md',
	draftUnderscore: 'test/fixtures/_draft.json',
	draftDot: 'test/fixtures/.draft.md'
};

test('parse JSON file', function(t) {
	t.plan(1);
	var foo = parse(fixtures.json);
	t.equal(foo.title, 'Foo', 'File content has title "Foo"');
});

test('parse MD file', function(t) {
	t.plan(2);
	var baz = parse(fixtures.md);
	t.equal(baz.title, 'Baz', 'File title is "Baz"');
	t.equal(baz.main, '<p>This is an example paragraph.</p>\n', 'Markdown file content');
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
	var file = decorate({}, fixtures.json, 'test');
	t.equal(file.fileext, '.json', 'File extension is ".json"');
	t.equal(file.filename, 'foo', 'File name is "foo"');
	t.ok(file.date, 'File date is available');
	t.ok(moment.isMoment(file.date), 'File date is a moment object');
	t.equal(file.filepath, 'fixtures/foo.json', 'File path is ');
	t.equal(file.url, '/fixtures/foo', 'File url is ');
});