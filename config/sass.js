module.exports = {
	dev: {
		options: {
			style: 'expanded',
			sourcemap: true
		},
		files: {
			'<%= buildPath %>/css/main.css': 'sass/main.scss'
		}
	},
	prod: {
		options: {
			style: 'compressed'
		},
		files: {
			'<%= buildPath %>/css/main.css': 'sass/main.scss'
		}
	}
}