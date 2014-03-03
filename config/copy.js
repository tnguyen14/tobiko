module.exports = {
	build: {
		files: [
			{expand: true, cwd: 'sass', src: 'assets/**/*', dest: '<%= buildPath %>/css/'}
		]
	}
}