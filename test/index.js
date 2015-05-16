'use strict';

var test = require('tape');
var moment = require('moment');
var parse = require('../tasks/lib/parse');
var decorate = require('../tasks/lib/decorate');
var archive = require('../tasks/lib/archive');

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
	var file = decorate({}, fixtures.json, 'test');
	t.equal(file.fileext, '.json', 'File extension');
	t.equal(file.filename, 'foo', 'File name');
	t.ok(file.date, 'File date is available');
	t.ok(moment.isMoment(file.date), 'File date is a moment object');
	t.equal(file.filepath, 'fixtures/foo.json', 'File path');
	t.equal(file.url, '/fixtures/foo', 'File url');
});

var archivePosts = {
	postOne: {
		'index.json': {
			template: 'post.hbs',
			order: 1
		}
	},
	postTwo: {
		'index.md': {
			template: 'post.hbs',
			order: 3
		}
	},
	postThree: {
		'index.json': {
			template: 'post.hbs',
			order: 2
		}
	}
};
var archiveOption = {
	postPerPage: 2,
	template: 'archive.hbs',
	title: 'Posts',
	orderby: 'order'
};

test('Get and sort posts for archive', function(t) {
	t.plan(1);
	var posts = archive.getPosts(archivePosts, archiveOption.orderby);
	t.deepEqual(posts, [{
		order: 1,
		template: 'post.hbs'
	}, {
		order: 2,
		template: 'post.hbs'
	}, {
		order: 3,
		template: 'post.hbs'
	}], 'Get and sort posts for archive');
});

test('Generate archive pages', function(t) {
	t.plan(1);
	var archivePages = archive.paginate(archivePosts, 'posts', archiveOption);
	t.deepEqual(archivePages, {
		'index.html': {
			filepath: 'posts/index.html',
			url: '/posts',
			template: archiveOption.template,
			title: archiveOption.title,
			prevUrl: '/posts/2',
			posts: [{
				order: 1,
				template: 'post.hbs'
			}, {
				order: 2,
				template: 'post.hbs'
			}]
		},
		1: {
			'index.html': {
				filepath: 'posts/index.html',
				url: '/posts',
				template: archiveOption.template,
				title: archiveOption.title,
				prevUrl: '/posts/2',
				posts: [{
					order: 1,
					template: 'post.hbs'
				}, {
					order: 2,
					template: 'post.hbs'
				}]
			}
		},
		2: {
			'index.html': {
				filepath: 'posts/2/index.html',
				url: '/posts/2',
				template: archiveOption.template,
				title: archiveOption.title,
				nextUrl: '/posts/1',
				posts: [{
					order: 3,
					template: 'post.hbs'
				}]
			}
		}
	}, 'Generate archive pages');
});