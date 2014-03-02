module.exports = {
	options : {
		partialDir : 'templates/partials',
		helperDir : 'templates/helpers'
	},
	dev: {
		src: 'templates/*.hbs',
		dest: '<%= buildPath %>',
		data: 'build/data.json',
	},
	prod: '<%= handlebars_html.dev %>'
}