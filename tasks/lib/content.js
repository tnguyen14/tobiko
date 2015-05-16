'use strict';

var fs = require('fs');
var path = require('path');
var jsYAML = require('js-yaml');
var moment = require('moment');
var marked = require('marked');

exports.init = function (grunt) {
	var _ = grunt.util._;
	var content = {};

	// Helper functions

	/* convert new line characters to html linebreaks
	 * inspired by nl2br function from php.js
	 * https://github.com/kvz/phpjs/blob/master/functions/strings/nl2br.js
	 * @param {String} str
	 * @return {String}
	*/
	var nl2br = function(str) {
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>');
	};

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

	// Parse JSON and markdown content
	content.parse = function(filepath, options) {
		var ext = path.extname(filepath),
			basename = path.basename(filepath, ext),
			// remove 'contents' from path
			file;

		// Ignore draft posts (_) and dotfiles
		if (basename[0] === '_' || basename[0] === '.') {
			return;
		}

		// get the JSON files
		if (ext === '.json') {
			file = grunt.file.readJSON(filepath);

		// parse markdown files
		// with some inspiration from https://github.com/ChrisWren/grunt-pages/blob/master/tasks/index.js
		} else if (ext === '.md') {
			var fileContent = grunt.file.read(filepath);

			// set options for marked
			if (options && options.markdown) {
				marked.setOptions(options.markdown);
			}

			try {
				var sections = fileContent.split('---');
				// YAML frontmatter is the part in between the 2 '---'
				file = jsYAML.safeLoad(sections[1]);

				// get to the markdown part
				sections.shift();
				sections.shift();

				// convert markdown data to html
				var markdown = marked(sections.join('---'));
				// convert new line characters to html line breaks
				// markdown = nl2br(markdown);

				file.main = markdown;
			} catch (e) {
				grunt.fail.fatal(e + ' .Failed to parse markdown data from ' + filepath);
			}
		}

		if (file) {
			// add support for date using moment.js http://momentjs.com/
			if (!file.date) {
				file.date = fs.statSync(filepath).ctime;
			}
			// if date isn't already a moment type, convert it to momentjs
			if (!moment.isMoment(file.date)) {
				var mDate = moment(file.date);
				// check if the string is a valid date format http://momentjs.com/docs/#/parsing/string/
				if (mDate.isValid()) {
					file.date = mDate;
				} else {
					grunt.log.writeln('The date used in ' + filepath + ' is not supported.');
				}
			}

			// add file name and extension
			file.filename = basename;
			file.fileext = ext;

			// // add full path for images
			// var image = /<img src=\"(.*\.jpg|png)\"/;
			// if (file.main) {
			// 	console.log(file.url);
			// 	file.main = file.main.replace(image, '<img src=\"' + file.url + "/$1\"");
			// }
		}
		return file;
	};

	// Pagination
	content.paginate = function(dir, key, options) {
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

	return content;
};