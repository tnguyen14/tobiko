module.exports = {
	options : {
		baseDir: 'contents',
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
		src: 'contents/**/*.{json,md}',
		dest: 'build/data.json'
	}
}