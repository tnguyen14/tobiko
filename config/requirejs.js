module.exports = {
	prod: {
		options: {
			baseUrl: '.',
			mainConfigFile: 'js/config.js',
			name: 'bower_components/almond/almond',
			insertRequire: ['js/app'],
			out: '<%= buildPath %>/app.js',
			optimize: 'uglify2',
			generateSourceMaps: true,
			preserveLicenseComments: false,
		}
	}
}