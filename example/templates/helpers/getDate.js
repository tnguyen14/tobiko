// Display date
// @param {String} format of the desired output, see momentjs date format http://momentjs.com/docs/#/displaying/format/
// @param {String|Object} a date string (http://momentjs.com/docs/#/parsing/string/) or momentjs date object
// @return {String} the date string in the desired format

var  moment = require('moment'),
	_ = require('underscore');

module.exports = function(formatStr, date) {
	var momentDate;
	// A rather hacky way to test if the second argument is empty
	if (_.isEmpty(date.data)) {
		momentDate = moment();
	} else {
		// if the date passed in is not a moment type, convert it to moment
		// otherwise use it
		if (!moment.isMoment(date)) {
			momentDate = moment(date);
			// if the date parsing fails
			if (!momentDate.isValid()) {
				return 'The date passed in is invalid';
			}
		} else {
			momentDate = date;
		}
	}

	return momentDate.format(formatStr)
}