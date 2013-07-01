/* get all data contents
 * store them as a humongous JSON file
 */
 'use strict';

 module.exports = function(grunt) {
	grunt.registerMultiTask('import_contents', 'import all JSON and MD files', function(){
		var content = {},
			data = {},
			path = require('path');

		var options = this.options({
			baseDir: 'contents',
			config : 'config.json'
		});

		grunt.verbose.writeflags(options, 'Options');

		this.files.forEach(function(f) {
			f.src.filter(function(filepath){
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			})
			.forEach(function(filepath) {
				var ext = path.extname(filepath),
					basename = path.basename(filepath),
					// remove 'contents' from path
					newpath = path.relative(options.baseDir, filepath);

					// get the JSON files
					if (ext === '.json') {
						content[newpath] = grunt.file.readJSON(filepath);
					}
			});
			data['data'] = content;
			data['config'] = grunt.file.readJSON(options.config);
			grunt.file.write(f.dest, JSON.stringify(data));
		});
	});
};