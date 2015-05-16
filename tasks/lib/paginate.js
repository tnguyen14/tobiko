'use strict';

var moment = require('moment');
var path = require('path');
var _ = require('lodash');

// sort array by keys
// default to date
var sortArrayByKey = function(array, key) {
	array.sort(function(a,b) {
		var sortKey = (key) ? key : 'date',
			aKey,
			bKey,
			compareResult;

		if (a.hasOwnProperty(sortKey)) {
			aKey = a[sortKey];
			bKey = b[sortKey];
		} else {
			// Dig deeper for sortKey property
			for (var prop in a) {
				aKey = a[prop][sortKey];
			}
			for (var prop in b) {
				bKey = b[prop][sortKey];
			}
		}

		switch (sortKey) {
			case 'date':
				var aDate = moment(aKey),
					bDate = moment(bKey);
				if (aDate.isBefore(bDate)) {
					compareResult = 1;
				} else if (aDate.isSame(bDate)) {
					compareResult = 0;
				} else if (aDate.isAfter(bDate)) {
					compareResult = -1;
				}
				break;
			default:
				compareResult = aKey - bKey;
		}
		return compareResult;
	});
};

module.exports = function paginate(dir, key, options) {
	var archive = {},
		posts = [];

	// keeping it short
	var postPerPage = options.postPerPage,
		template = options.template,
		title = options.title,
		orderBy = options.orderby;

	// get all the posts (content file with `template` declared)
	function getPosts(dir) {
		return _(dir).map(function (value) {
			// if we're not at the post level yet, go deeper
			if (!value.hasOwnProperty('template')) {
				return getPosts(value);
			} else {
				return value;
			}
		});
	}
	// flatten all posts nesting
	posts = _.flatten(getPosts(dir));

	// sorting
	sortArrayByKey(posts, orderBy);

	var numPages = Math.ceil(posts.length / postPerPage);

	// set up each archive page
	for (var pageNum = 1; pageNum <= numPages; pageNum++) {
		archive[pageNum] = {};
		var archivePage = archive[pageNum]['index.html'] = {};
		// add template so it gets rendered
		archivePage.template = template;
		// a title as well
		archivePage.title = title;
		// initialize empty posts array
		archivePage.posts = [];
		// add correct filepath
		archivePage.filepath = path.join(key, pageNum.toString(), 'index.html');
		archivePage.url = path.join('/', key, pageNum.toString());

		if (pageNum != numPages) {
			archivePage.prevUrl = path.join('/', key, (pageNum + 1).toString());
		}
		if (pageNum != 1) {
			archivePage.nextUrl = path.join('/', key, (pageNum - 1).toString());
		}
	}

	// put posts into each archive page
	for (var i = 0; i < posts.length; i++){
		var pageNum = Math.ceil((i+1)/ postPerPage);
		var archivePage = archive[pageNum]['index.html'];
		archivePage.posts.push(posts[i]);
	}

	// simplify filepath for archive 1
	archive['1']['index.html'].filepath = path.join(key, 'index.html');
	archive['1']['index.html'].url = path.join('/', key);

	return archive;
};
