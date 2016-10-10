'use strict';

let debug = require('debug')('tobiko');
let fetch = require('node-fetch');

module.exports = getWordPressContent;

// recursively get all posts
function getPosts (url, postsPerPage, page, posts) {
	return fetch(url + '?per_page=' + postsPerPage + '&page=' + page || 1)
		.then((response) => {
			return response.json().then((json) => {
				if (response.status >= 400) {
					debug(json);
					throw new Error(response.status + ' ' + response.statusText);
				}
				posts = posts.concat(json);
				if (json.length < postsPerPage) {
					return posts;
				} else {
					return getPosts(url, postsPerPage, ++page, posts);
				}
			});
		});
}

function getEndpoint (endpoint, apiRoot) {
	let postsPerPage = 100;
	let page = 1;
	return getPosts(apiRoot + '/' + endpoint.postType, postsPerPage, page, [])
		.then((posts) => {
			return posts.reduce(function (_posts, p) {
				_posts[p.slug] = {
					'index': {
						date: p.date,
						updated: p.modified,
						template: endpoint.template,
						title: p.title.rendered,
						main: p.content.rendered,
						slug: p.slug,
						filepath: endpoint.folder + '/' + p.slug + '/index',
						filename: 'index'
					}
				};
				return _posts;
			}, {});
		});
}

function getWordPressContent (contentTree, options) {
	// if no options, quit early
	if (!Object.keys(options)) {
		return Promise.resolve(contentTree);
	}
	return Promise.all(options.contents.map(function (endpoint) {
		return getEndpoint(endpoint, options.apiRoot)
			.then((posts) => {
				contentTree[endpoint.folder] = posts;
			});
	})).then(() => {
		return contentTree;
	});
}

