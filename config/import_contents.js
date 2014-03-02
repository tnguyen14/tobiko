module.exports = {
	options : {
		baseDir: '<%= contentDir %>',
		config : 'config.json',
		markdown: {
			breaks: true,
			smartLists: true,
			smartypants: true,
			langPrefix: 'language-'
		},
		paginate: '<%= paginate %>'
	},
	all: {
		src: '<%= contentDir %>/**/*.{json,md}',
		dest: '<%= dataPath %>'
	}
}