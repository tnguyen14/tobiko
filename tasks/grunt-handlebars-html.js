/* grunt-handlebars-html task
 * compile handlebars templates to static HTML
 */

'use strict';

module.exports = function (grunt) {
	var _ = grunt.util._;
	var config = grunt.file.readJSON('./config.json'),
		config_dev = (grunt.file.exists('./config-dev.json')) ? grunt.file.readJSON('./config-dev.json') : {};

		// config_dev will overwrite config
		config_dev = _.extend(config, config_dev);

	var fs = require('fs'),
		path = require('path'),
		moment = require('moment'),
		Handlebars = require('handlebars');

	grunt.registerMultiTask('handlebars_html', 'write templates to html', function () {
		var options = this.options({
			partialDir: 'app/templates/partials',
			helperDir: 'app/templates/helpers'
		});

		// register helpers
		if (fs.existsSync(options.helperDir)) {
			// read helper directory and save all filenames
			var helpers = fs.readdirSync(options.helperDir);
			// register helper with their filename as helper name
			helpers.forEach(function (h) {
				var ext = path.extname(h),
					basename = path.basename(h, ext),
					filepath = path.resolve(options.helperDir, h);
				Handlebars.registerHelper(basename, require(filepath));
			});
		}

		// register partials
		if (fs.existsSync(options.partialDir)) {
			// read partial directory and save all filenames
			var partials = fs.readdirSync(options.partialDir);
			// register helper with their filename as helper name
			partials.forEach(function (p) {
				var ext = path.extname(p),
					basename = path.basename(p, ext),
					filepath = path.resolve(options.partialDir, p),
					partial = grunt.file.read(filepath);
				Handlebars.registerPartial(basename, partial);
			});
		}

		this.files.forEach(function (f) {
			var path = require('path'),
				templates = {},
				env = grunt.task.current.target,
				data = grunt.file.readJSON(f.data);
			// filter out files that doesn't exist
			f.src.filter(function (filepath) {
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			})
			.forEach(function (filepath) {
				var basename = path.basename(filepath),
					src = grunt.file.read(filepath);

				templates[basename] = Handlebars.compile(src);
			});

			// recursively go through content and display the ones with a template
			var renderContent = function(contents) {
				_(contents).forEach(function (content, key, collections) {
					// if the file has a template property -> render it
					if (content.template) {
						if (templates[content.template]) {
							// expose env and config to content
							content.env = env;
							// use config_dev if in dev environment
							content.config = (env === 'dev') ? config_dev : config;

							// pass in the whole collections to make other sibling contents available
							collections.content = content;
							var html = templates[content.template](collections);

							// if a filepath is specified, use that instead (it should be after contents are imported)
							// otherwise, use filename as path
							var filepath = (content.filepath) ? content.filepath : key;
							var ext = path.extname(filepath),
								dirname = path.dirname(filepath),
								basename = path.basename(filepath, ext);

							// remove the dot in dirname, add the trailing slash where appropriate
							if (dirname === '.') {
								dirname = '';
							}
							// write the compiled html to file
							var outpath = path.join(f.dest, dirname, basename + '.html');
							grunt.file.write(outpath, html);
							grunt.log.writeln('"' + outpath + '" was created.');
						} else {
							grunt.log.writeln('Could not find template ' + content.template + ' for ' + key);
						}
					} else {
						// Keep going deeper into the content tree if there is more
						if (_.isObject(content)) {
							renderContent(content);
						} else {
							return;
						}
					}
				});
			};

			// render all the contents
			renderContent(data.contents);

			// Pagination

			// convert an object of objects into array of objects
			// @param {Object}
			// @return {Array}
			var objToArray = function(obj) {
				var array = [];
				_(obj).forEach(function(value, key) {
					var el = {};
					// if value already been through renderContent(), it will already have 'content' property encapsulation
					el[key] = (value.hasOwnProperty('content')) ? value['content'] : value;
					array.push(el);
				});
				return array;
			}

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
			}

			var paginate = function(dir, key, options) {

				var archive = {},
					posts = [];

				// keeping it short
				var postPerPage = options.postPerPage,
					template = options.template,
					title = options.title,
					orderBy = options.orderby;

				// convert content to array to calculate length
				posts = objToArray(dir);

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
					// initialize empty posts object
					archivePage.posts = {};
					// add correct filepath
					archivePage.filepath = path.join(key, pageNum.toString(), 'index.html');
				}

				// put posts into each archive page
				for (var i = 0; i < posts.length; i++){
					var pageNum = Math.ceil((i+1)/ postPerPage);
					var archivePage = archive[pageNum]['index.html'];
					_.extend(archivePage['posts'], posts[i]);
				}

				// rename object 1 to index.html
				archive['index.html'] = archive['1']['index.html'];
				archive['index.html'].filepath = path.join(key, 'index.html');
				// remove reference to 1
				delete archive['1'];

				return archive;
			};

			// Get pagination options from Gruntfile.js
			var paginateOptions = {};
			_(options.paginate).forEach(function(opt){
				// make the directory the key, so easier to access options
				paginateOptions[opt.dir] = {
					postPerPage: opt.postPerPage,
					template: opt.template,
					title: opt.title,
					orderBy: opt.orderby
				}
			});

			// paginate if something is specified
			if (!_.isEmpty(paginateOptions)) {
				// store all directories' archives
				var archives = {};
				// iterate through global content object
				_(data.contents).forEach(function(dir, key) {
					if ( paginateOptions.hasOwnProperty(key) ) {
						archives[key] = paginate(dir, key, paginateOptions[key]);
					}
				});

				// render all the paginated archives
				renderContent(archives);
			}

		});
	});

};