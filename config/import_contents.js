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
		paginate: [
			{
				dir: 'articles',
				postPerPage: 4,
				template: 'archive.hbs',
				title: 'Articles'
			}
		]
	},
	all: {
		src: '<%= contentDir %>/**/*.{json,md}',
		dest: 'build/data.json'
	}
}