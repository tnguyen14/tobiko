module.exports = {
	build: {
		files: [
			{"expand": true, "cwd": "<%= sassDir %>", "src": "assets/**/*", "dest": "<%= buildPath %>/css/"}
		]
	}
}