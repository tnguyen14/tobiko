# tobiko
> a grunt plugin that powers the tobiko static site generator

This project is known on npm as [grunt-tobiko](https://npmjs.org/package/grunt-tobiko). It is named tobiko here for legacy reason.

## How to use
This is a grunt plugin that powers a static site generator. You can use the static site generator to power your website or blog using [generator-tobiko](http://github.com/tnguyen14/generator-tobiko).

1. To get started, install [yeoman](http://yeoman.io) and the generator plugin.
    ```sh
    $ npm install -g yo generator-tobiko
    ```

2. Start to scaffold your new website
    ```sh
    $ mkdir newsite
    $ cd newsite
    $ yo tobiko
    ```

3. Answer the prompt and create your new site. Even though the generator is designed to be as flexible as possible, if you are using this for the first time, sticking to the default configs will make the most sense. All the examples and documentation are written based on that structure. See [project configurations](#project-configurations).

4. Start developing it locally
    ```sh
    $ grunt
    ```
You can also deploy it to Github pages. Other [methods of deployment](#deployment) are also available.
    ```sh
    $ grunt deploy
    ```

## Stack
- Build process: grunt
- Content: JSON / Markdown (optionally with YAML frontmatter)
- Template: Handlebars
- Styles: SCSS
- JavaScript: RequireJS (AMD)

There are plans to support browserify (CommonJS) and a gulp build system in the future.

## Project configurations
Below are the default configuations used by the static site generator and they can be configured easily. When using generator-tobiko, you will be prompted to enter these values.

- Contents directory: `contents`
- Template directory: `templates`
  - Partial directory: `templates/partials`
  - Helper directory: `templates/helpers`
- Sass directory: `scss`
- JavaScript directory: `js`
- Build directory: `build`
- localhost port: `4000`
- livereload port: `35730`

## Documentation

### Contents
*This section explains the inner working of the [`import_contents` task](https://github.com/tnguyen14/tobiko/blob/master/tasks/grunt-import-contents.js).*

By default, the site content will be in the `contents` folder. This option could be changed in `tobiko.json`, under `contentDir` property.

Content can be written in `json` and `markdown` with `yaml` [frontmatter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter).

The structure of the `contents` directory will be reflected in the final static HTML output.

All contents are written to `data.json` in the `build` directory (allows for inspection/ debugging).

#### config.json
High level, site-wide configurations can be specified in `config.json` in the root folder. Environment-specific configurations are also supported.

For example:

config.json
```json
{
    "site-name": "Tobiko Example",
    "site-url": "http://tobiko.io",
    "author": "Sushi Connoisseur"
}
```

config.dev.json
```json
{
    "site-url": "http://localhost:4000",
}
```

Environment-specific settings cascade over the original config. This allows you to declare only the different parameters.

#### Nesting
In any directory, a file's sibling files and directories are available for the template to access. This is a convenient and structural way to store and organize data, instead of dumping everything into a single JSON file.

For example, for this file structure
```
contents
├── index.json
└── cars
    ├── 1.tesla.json
    ├── 2.ford.json
    ├── 3.volve.json
    ├── 4.honda.json
    ├── 5.toyota.json
    └── accessories
        └── spoiler.json
```

If you're writing the template for `index.json`, its own content is available through the `content` variable.
```html
  <h1>{{content.title}}</h1>
```
And `cars` are also available as
```html
  <ul>
  {{#each cars}}
    <li><h2>{{title}}</h2></li>
  {{/each}}
  </ul>

  <div class="spoiler">
    {{cars.accessories.spoiler}}
  </div>
```

The numbered files are used to organize the order of the children.

#### template property
Each page specifies a template that it uses, either as a JSON property or YAML frontmmatter. If a file doesn't specify a template, its data is available to be used in the ContentTree but will not be rendered.

Example:

main.json
```js
{
  template: "index.hbs",
  content: "Hello World"
}
```

index.md
```md
---
template: index.hbs
---
Hello World
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

This could be useful as a way to order files in a directory structure.
In the cars example above:
```
contents
├── index.json
└── cars
    ├── 1.tesla.json
    ├── 2.ford.json
    ├── 3.volve.json
    ├── 4.honda.json
    ├── 5.toyota.json
    └── accessories
        └── spoiler.json
```

In order to avoid the number 1, 2, 3 etc. appear in these car's URL, they could have a custom `filepath` property, such as `contents/cars/tesla.json`.

#### date
Post or page date is supported by declaring property `date` in JSON or YAML. Any [ISO-8601 string formats](http://momentjs.com/docs/#/parsing/string/) for date is supported.

By default, a file without a `date` specified will have the `date` value of when the file was created. (To be more exact, it will have the [`ctime`][1] value when `grunt` is first run).

[1]: http://en.wikipedia.org/wiki/Atime_(Unix)#ctime

See [momentjs](http://momentjs.com) for more information about the date format.

### Templates
*This section explains the inner working of the [`generate_html` task](https://github.com/tnguyen14/tobiko/blob/master/tasks/grunt-generate-html.js).*

By default tobiko uses [Handlebars](http://handlebarsjs.com) as its templating engine. However, if you want to use a different templating engine, you can easily do so by plugging in a different `grunt` task that would compile your templating engine of choice.
*Note: true to a static site generator, all compiled templates need to be in `.html` formats*

Helpers and Partials are supported. They can be stored under `helpers` and `partials` directories under `templates`. These directory names of course can be changed in `tobiko.json`.

Each page needs to specify its own template. This can be done with a JSON property
```js
  {template: index.hbs}
```
or in the YAML frontmatter. A file with no `template` property will not be rendered.

A file's content is available in the template under the `content` variable. Other sub-directories included in the same directory is accessible in the template with [nesting](#nesting).

#### Archives and Pagination
A directory with a big number of posts could be configured to paginate. The paginated pages are called archives.
The option for enabling pagination can be added in `tobiko.json`. For example:
```js
  "archives": {
    "posts": {
      "postPerPage": 4,
      "template": "archive.hbs",
      "title": "Posts"
    }
  }
```
Each option in the `paginate` object represents a directory to be paginated. The key of each option is the directory name of the content to be paginated.
Each archive can have the following options:
* `orderby`: (string) how to order the posts in the archives. Default to ['date'](#date)
* `postPerPage`: (number) number of posts to be displayed per archive page
* `template`: (string) the template used to display these archive pages
* `title`: (string) title of these archive pages (this will be made available to use in template as `content.title`)

#### Template
The `posts` in each archive page is accessible in the template file under `content` property, similar to a regular file. See [example](https://github.com/tnguyen14/tobiko-example/blob/master/example/templates/archive.hbs).

### Grunt tasks
Thanks to [grunt-load-config](https://github.com/firstandthird/load-grunt-config/), the grunt task configs are neatly organized under the [`config`](https://github.com/tnguyen14/tobiko/tree/master/config) directory.

A few [tasks](https://github.com/tnguyen14/tobiko/blob/master/config/aliases.yaml) are made available below. The default is `dev`.
1. `dev`: Running `grunt dev` does a few things:
- processing the contents and build out the templates
- minify images and create different resolutions of the same image for responsive use
- compile sass and prefix it if necessary
- create a connect server to render to content locally
- [watch](https://github.com/tnguyen14/tobiko/blob/master/config/watch.js) for changes

2. `build`: Running `grunt build` will prepare all the content (parse, build templates, create responsive images, mininfy them, compile sass and minify css) for deployment.
3. `deploy`: `build` and deploy with `gh-pages`. See [deployment](#deployment) guide below.

### Deployment
The site can be deployed by default to [Github Pages](http://pages.github.com) using the [`grunt-gh-pages`](https://github.com/tschaub/grunt-gh-pages) task (more options can be found on that plugin page).

It can be configured in `Gruntfile.js` as follows:

```js
  grunt.config.set('gh-pages', {
    prod: {
      options: {
        base: '<%= buildPath %>',
      },
      src: ['**/*']
    }
  });
```

Optionally, you can also deploy your site to a server of your choice using the [`grunt-rsync`](https://github.com/jedrichards/grunt-rsync) plugin

```js
  // deploy via rsync
  grunt.config.set('rsync', {
    options: {
      args: ["--verbose"],
      src: "<%= buildPath %>/",
      exclude: ['.git*', 'node_modules', '.sass-cache', 'Gruntfile.js', 'package.json', '.DS_Store', 'README.md', '.jshintrc'],
      recursive: true,
      syncDestIgnoreExcl: true
    },
    prod: {
      options: {
        dest: "/path/to/your/site",
        host: "server_address"
      }
    }
  });
```

## Issues/ Requests
Any issues, questions or feature requests could be created under [Github Issues](https://github.com/tnguyen14/tobiko/issues).
