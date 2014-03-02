module.exports = {
	build: {
		files: [
			{expand: true, src: ['CNAME'], dest: '<%= buildPath %>/'},
			{expand: true, cwd: 'components', src: ['fancybox/source/**/*'], dest: '<%= buildPath %>/components'},
			{expand: true, cwd: 'sass', src: 'assets/**/*', dest: '<%= buildPath %>/css/'}
		]
	}
}