# tobiko
### node.js static site generator using grunt

## How to use
This generator app is driven by [grunt.js](http://gruntjs.com), which means that it is highly customizable to suit your developer needs. Be sure to take a look at [Gruntfile.js](https://github.com/tnguyen14/tobiko/blob/master/Gruntfile.js).

### Install
1. Run `git clone` to download the app.
2. Run `npm install`
3. Run `bower install`
4. Use `grunt` on the command line to generate preview, build and deploy your website.

### Contents
By default, the site contents will be in the `contents` folder. This option could be changed in `Gruntfile.js`, under `import_contents` task.

Content can be written in `json` and `markdown` with `yaml` [frontmatter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter).

The structure of the base directory will be reflected in the final static directory.

#### config.json
High level, site-wide configurations can be specified in [`config.json`](https://github.com/tnguyen14/tobiko/blob/master/config.json).

All contents, including `config.json`, are stored in `data.json` in the `build` directory.

#### template
Each page specifies a template that it uses, either as a JSON property or YAML frontmmatter.

Example:
```js
{
	template: "index.hbs"
}
```
#### filepath
By default, the path of the page is its directory structure.
For example, the page `contents/articles/06/a-new-day.json` will have the URL `http://localhost/articles/06/a-new-day.json`.

However, each page's path can be overwritten by a `filepath` property.
Example:
```js
{
	filepath: "articles/archives/some-post.md"
}
```

This could be useful as a way to order files in a directory structure. For example, files could be named as `1.md`, `2.md`, `3.md` etc. to make sure they're loaded in in order. They could then have a custom path is NOT `1.html`, `2.html` etc.

#### date
Post or page date is supported by declaring property `date` in JSON or YAML.
Any [ISO-8601 string formats](http://momentjs.com/docs/#/parsing/string/) for date is supported.
See [momentjs](http://momentjs.com) for more information.

### Templates
By default this app uses [Handlebars](http://handlebarsjs.com) as its templating engine. However, if you want to use a different templating engine, you can easily do so by plugging in a different `grunt` task that would compile your templating engine of choice.
*Note: true to a static site generator, all compiled templates need to be in `.html` formats*

Helpers and Partials are supported. They can be stored under `helpers` and `partials` directories under `templates`. These directory names of course can be changed in `Gruntfile.js`.

Each page needs to specify its own template. This can be done with a JSON property `template: index.hbs` or in the YAML frontmatter.

## Issues/ Requests
Any issues, questions or feature requests could be created under [Github Issues](https://github.com/tnguyen14/tobiko/issues).
