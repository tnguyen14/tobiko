/**
 * Decorate file content object with file properties
 */
'use strict';

var path = require('path');
var fs = require('fs');
var moment = require('moment');

module.exports = function decorateFile(file, filepath, baseDir) {
	if (!file || !filepath) {
		return;
	}

	if (!file.date) {
		file.date = fs.statSync(filepath).ctime;
	}
	// if date isn't already a moment type, convert it to moment
	if (!moment.isMoment(file.date)) {
		var mDate = moment(file.date);
		// check if the string is a valid date format http://momentjs.com/docs/#/parsing/string/
		if (mDate.isValid()) {
			file.date = mDate;
		}
	}

	file.fileext = path.extname(filepath);
	file.filename = path.basename(filepath, file.fileext);

	if (!file.filepath) {
		file.filepath = path.relative(baseDir, filepath);
	}

	file.url = '/' + path.dirname(file.filepath) + '/' + file.filename;

	return file;
};