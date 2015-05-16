'use strict';

var test = require('tape');
var contentParse = require('../tasks/lib/contentParse');
var moment = require('moment');

test('parse JSON file', function(t) {
	t.plan(5);
	var foo = contentParse('test/example/foo.json');
	t.equal(foo.title, 'Foo', 'File content has title "Foo"');
	t.equal(foo.filename, 'foo', 'File name is "foo"');
	t.equal(foo.fileext, '.json', 'File extension is ".json"');
	t.ok(foo.date, 'File date is available');
	t.ok(moment.isMoment(foo.date), 'File date is a moment object');
});

test('parse MD file', function(t) {
	t.plan(6);
	var baz = contentParse('test/example/baz.md');
	t.equal(baz.title, 'Baz', 'File title is "Baz"');
	t.equal(baz.main, '<p>This is an example paragraph.</p>\n', 'Markdown file content');
	t.equal(baz.filename, 'baz', 'File name is "baz"');
	t.equal(baz.fileext, '.md', 'File extension is ".md"');
	t.ok(baz.date, 'File date is available');
	t.ok(moment.isMoment(baz.date), 'File date is a moment object');
});

test('should ignore draft files', function(t) {
	t.plan(2);
	var draftJson = contentParse('test/example/_draft.json');
	t.notOk(draftJson, 'File with leading _ should be ignored');
	var draftMd = contentParse('test/example/.draft.md');
	t.notOk(draftMd, 'File with leading . should be ignored');
});