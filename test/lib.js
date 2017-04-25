const tap = require('tap');
const moment = require('moment');
const parse = require('../lib/parse');
const decorate = require('../lib/decorate');

let fixtures = {
	json: 'test/fixtures/foo.json',
	md: 'test/fixtures/baz.md',
	draftUnderscore: 'test/fixtures/_draft.json',
	draftDot: 'test/fixtures/.draft.md'
};

tap.test('parse JSON file', function (t) {
	var foo = parse(fixtures.json);
	t.equal(foo.title, 'Foo', 'File content');
	t.end();
});

tap.test('parse MD file', function (t) {
	var baz = parse(fixtures.md);
	t.equal(baz.title, 'Baz', 'File content');
	t.equal(baz.main, '<p>This is an example paragraph.</p>\n', 'File content markdown');
	t.end();
});

tap.test('should ignore draft files', function (t) {
	var draftUnderscore = parse(fixtures.draftUnderscore);
	t.notOk(draftUnderscore, 'File with leading _ should be ignored');
	var draftDot = parse(fixtures.draftDot);
	t.notOk(draftDot, 'File with leading . should be ignored');
	t.end();
});

tap.test('decorate file', function (t) {
	var file = decorate(parse(fixtures.json), fixtures.json);
	t.equal(file.fileext, '.json', 'File extension');
	t.equal(file.filename, 'foo', 'File name');
	t.ok(moment.isMoment(file.date), 'File date is a moment object');
	t.equal(file.filepath, 'test/fixtures/foo.json', 'File path');
	t.equal(file.url, '/test/fixtures', 'File url');
	t.end();
});
