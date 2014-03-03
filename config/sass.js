module.exports = {
	dev: {
		options: {
			style: 'expanded',
			sourcemap: true
		},
		files: {
			'<%= buildPath %>/css/main.css': '<%= sassDir %>/main.scss'
		}
	},
	prod: {
		options: {
			style: 'compressed'
		},
		files: {
			'<%= buildPath %>/css/main.css': '<%= sassDir %>/main.scss'
		}
	}
}