module.exports = function(grunt){
	return {
		dev: {
			options: {
				port: '<%= port %>',
				base: ['<%= buildPath %>', '.'],
				livereload: '<%= livereload %>'
			}
		},
		prod: {
			options: {
				base: '<%= buildPath %>',
				keepalive: true,
			}
		}
	}
}