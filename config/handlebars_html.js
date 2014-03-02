module.exports = {
	options : {
		partialDir : '<%= templates.partialDir %>',
		helperDir : '<%= templates.helperDir %>'
	},
	dev: {
		src: '<%= templates.dir %>/*.hbs',
		dest: '<%= buildPath %>',
		data: '<%= dataPath %>',
	},
	prod: '<%= handlebars_html.dev %>'
}