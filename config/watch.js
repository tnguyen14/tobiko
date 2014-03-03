module.exports = {
	options: {
		livereload: '<%= livereload %>' || 35729
	},
	css: {
		files: ['<%= sassDir %>/**/*.scss'],
		tasks: ['sass:dev', 'autoprefixer:dev']
	},
	contents: {
		files: ['<%= contentDir %>/**/*.{json,md}'],
		tasks: ['import_contents', 'handlebars_html:dev']
	},
	templates: {
		files: ['<%= templates.dir %>/**/*.{hbs,html}'],
		tasks: ['handlebars_html:dev']
	},
	images: {
		files: ['<%= contentDir %>/**/*.{jpg,png,gif}'],
		tasks: ['newer:imagemin:dev', 'newer:responsive_images']
	},
	assets: {
		files: ['<%= sassDir %>/assets'],
		tasks: ['copy:build']
	},
	tobiko: {
		files: ['tobiko/**/*.{js,yaml}', 'Gruntfile.js'],
		tasks: ['process']
	}
}