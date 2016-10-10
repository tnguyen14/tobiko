/**
 * Decorate file content object with file properties
 */
'use strict';

var path = require('path');
var moment = require('moment');

module.exports = function decorateFile(file, filepath) {
	if (!file || !filepath) {
		return;
	}

	// if date isn't already a moment type, convert it to moment
	if (file.date && !moment.isMoment(file.date)) {
		var mDate = moment(file.date);
		// check if the string is a valid date format http://momentjs.com/docs/#/parsing/string/
		if (mDate.isValid()) {
			file.date = mDate;
		}
	}

	file.fileext = path.extname(filepath);
	file.filename = path.basename(filepath, file.fileext);

	if (!file.filepath) {
		file.filepath = filepath;
	}

	file.url = '/' + path.dirname(file.filepath);

	// add full path for images
	var imageRe = /<img src=\"(.*\.(jpg|png))\"/g;
	if (file.main) {
		file.main = file.main.replace(imageRe, '<img src="' + file.url + '/$1"');
	}

	return file;
};
