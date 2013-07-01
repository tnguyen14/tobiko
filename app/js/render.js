module.exports = function(filename, data) {
	var Handlebars = require('handlebars');
	var template = require('../../app/templates/index.hbs');
	console.log(template);
	var fs = require('fs');
	var tpl = Handlebars.compile(template);
	var html = tpl(data);
	var writeStream = fs.createWriteSteam(filename + '.html');
	writeStream.write(html);
	writeStream.end();
	return null;
};