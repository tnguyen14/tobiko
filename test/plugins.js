'use strict';

var test = require('tape');
var archive = require('../plugins/archive');

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