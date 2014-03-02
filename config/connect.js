module.exports = function(grunt){
	return {
		dev: {
			options: {
				port: '<%= port %>',
				base: ['<%= buildPath %>', '.']
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