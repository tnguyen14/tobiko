'use strict';

var moment = require('moment');
var path = require('path');
var _ = require('lodash');

module.exports = makeArchives;

// expose methods for testing
module.exports.getPosts = getPosts;
module.exports.paginate = paginate;

// sort array by keys
// default to date
function sortArrayByKey (array, key) {
	array.sort(function(a,b) {
		var sortKey = (key) ? key : 'date';
		var aKey, bKey, compareResult;

		if (a.hasOwnProperty(sortKey) && b.hasOwnProperty(sortKey)) {
			aKey = a[sortKey];
			bKey = b[sortKey];
		} else {
			return;
		}

		switch (sortKey) {
			case 'date':
				var aDate = moment(aKey);
				var bDate = moment(bKey);
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
}

function getPosts (dir, sortKey) {
	function getPostsRecursive (posts) {
		return _.map(posts, function (file) {
			// if we're not at the post level yet, go deeper
			if (!file.hasOwnProperty('template')) {
				return getPostsRecursive(file);
			} else {
				return file;
			}
		});
	}
	var posts = _.flattenDeep(getPostsRecursive(dir));
	sortArrayByKey(posts, sortKey);
	return posts;
}

/**
 * @param {Object} dir - content directory
 * @param {Object} dirName - name of content directory
 */
function paginate(dir, dirName, options) {
	var archive = {};

	// flatten all posts nesting
	var posts = getPosts(dir, options.orderby);

	var numPages = Math.ceil(posts.length / options.postsPerPage);

	// set up each archive page
	for (var pageNum = 1; pageNum <= numPages; pageNum++) {
		archive[pageNum] = {};
		var archivePage = archive[pageNum].index = {};
		// add template so it gets rendered
		archivePage.template = options.template;
		// a title as well
		archivePage.title = options.title;
		// initialize empty posts array
		archivePage.posts = [];
		// add correct filepath
		archivePage.filename = 'index';
		archivePage.filepath = path.join(dirName, pageNum.toString(), 'index.html');
		archivePage.url = path.join('/', dirName, pageNum.toString());

		if (pageNum != numPages) {
			archivePage.prevUrl = path.join('/', dirName, (pageNum + 1).toString());
		}
		if (pageNum != 1) {
			archivePage.nextUrl = path.join('/', dirName, (pageNum - 1).toString());
		}
	}

	// put posts into each archive page
	var pNum, page;
	for (var i = 0; i < posts.length; i++) {
		pNum = Math.floor(i/ options.postsPerPage) + 1;
		page = archive[pNum].index;
		page.posts.push(posts[i]);
	}

	// make the first page of archive available at top level
	archive.index = _.cloneDeep(archive['1'].index);
	archive.index.filepath = path.join(dirName, 'index.html');
	archive.index.url = path.join('/', dirName);

	return archive;
}

function makeArchives(contentTree, options) {
	return new Promise(function (resolve) {
		if (!_.isEmpty(options)) {
			var archives = {};
			_.forEach(options, function (archiveOpt, dir) {
				if (contentTree.hasOwnProperty(dir)) {
					var archive = paginate(contentTree[dir], dir, archiveOpt);
					_.extend(contentTree[dir], archive);
					// also make this archive available for a special archive portion of the contentTree
					archives[dir] = archive;
				}
			});
			contentTree.archives = archives;
		}
		resolve(contentTree);
	});
}
