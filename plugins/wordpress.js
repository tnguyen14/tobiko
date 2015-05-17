'use strict';

var _ = require('lodash');
var request = require('superagent');

function parseEndpoint(posts, endpoint) {
	return {
		folder: endpoint.folder,
		posts: posts.reduce(function (_posts, p) {
			_posts[p.slug] = {
				'index': {
					date: p.modified,
					template: endpoint.template,
					title: p.title,
					main: p.content,
					slug: p.slug,
					filepath: endpoint.folder + '/' + p.slug + '/index',
					filename: 'index'
				}
			};
			return _posts;
		}, {})
	};
}

function getEndpoint(endpoint, apiRoot) {
	return new Promise(function (resolve, reject) {
		var url = apiRoot + '/' + endpoint.postType;
		var query = _.extend({
			filter: {
				posts_per_page: -1
			}
		}, endpoint.query);
		request.get(url)
			.query(query)
			.end(function (err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(parseEndpoint(res.body, endpoint));
				}
			});
	});
}

function getWordPressContent(contentTree, options) {
	return new Promise(function (resolve) {
		if (!_.isEmpty(options)) {
			return Promise.all(options.contents.map(function (endpoint) {
				return getEndpoint(endpoint, options.apiRoot);
			})).then(function (contents) {
					contents.forEach(function (c) {
						contentTree[c.folder] = c.posts;
					});
					resolve(contentTree);
				});
		} else {
			resolve(contentTree);
		}
	});
}

exports.init = getWordPressContent;