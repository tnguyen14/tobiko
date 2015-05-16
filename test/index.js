'use strict';

var test = require('tape');
var parse = require('../tasks/lib/parse');
var moment = require('moment');

var fixtures = {
	json: 'test/fixtures/foo.json',
	md: 'test/fixtures/baz.md',
	draftUnderscore: 'test/fixtures/_draft.json',
	draftDot: 'test/fixtures/.draft.md'
};

test('parse JSON file', function(t) {
	t.plan(5);
	var foo = parse(fixtures.json);
	t.equal(foo.title, 'Foo', 'File content has title "Foo"');
	t.equal(foo.filename, 'foo', 'File name is "foo"');
	t.equal(foo.fileext, '.json', 'File extension is ".json"');
	t.ok(foo.date, 'File date is available');
	t.ok(moment.isMoment(foo.date), 'File date is a moment object');
});

test('parse MD file', function(t) {
	t.plan(6);
	var baz = parse(fixtures.md);
	t.equal(baz.title, 'Baz', 'File title is "Baz"');
	t.equal(baz.main, '<p>This is an example paragraph.</p>\n', 'Markdown file content');
	t.equal(baz.filename, 'baz', 'File name is "baz"');
	t.equal(baz.fileext, '.md', 'File extension is ".md"');
	t.ok(baz.date, 'File date is available');
	t.ok(moment.isMoment(baz.date), 'File date is a moment object');
});

test('should ignore draft files', function(t) {
	t.plan(2);
	var draftUnderscore = parse(fixtures.draftUnderscore);
	t.notOk(draftUnderscore, 'File with leading _ should be ignored');
	var draftDot = parse(fixtures.draftDot);
	t.notOk(draftDot, 'File with leading . should be ignored');
});