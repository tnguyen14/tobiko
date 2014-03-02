module.exports = {
	// build is done after responsive_images, dev is done before responsive_images
	build: {
		files: [
			{expand: true, cwd: '<%= buildPath %>', src: '**/*.{jpg,png,gif}', dest: '<%= buildPath %>/'}
		]
	},
	dev: {
		files: [
			{expand: true, cwd: 'contents', src: '**/*.{jpg,png,gif}', dest: 'contents'}
		]
	}
}