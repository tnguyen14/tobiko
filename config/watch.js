module.exports = {
	options: {
		livereload: '<%= livereload %>' || 35729
	},
	css: {
		files: ['sass/**/*.scss'],
		tasks: ['sass:dev', 'autoprefixer:dev']
	},
	contents: {
		files: ['contents/**/*.{json,md}'],
		tasks: ['import_contents', 'handlebars_html:dev']
	},
	templates: {
		files: ['templates/**/*.{hbs,html}'],
		tasks: ['handlebars_html:dev']
	},
	images: {
		files: ['contents/**/*.{jpg,png,gif}'],
		tasks: ['newer:imagemin:dev', 'newer:responsive_images']
	},
	assets: {
		files: ['sass/assets/'],
		tasks: ['copy:build']
	},
	grunt: {
		files: ['tasks/**/*.js', 'grunt/**/*.{js,yaml}', 'Gruntfile.js'],
		tasks: ['process']
	}
}