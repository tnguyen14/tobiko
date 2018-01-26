# tobiko

[![NPM](https://img.shields.io/npm/v/tobiko.svg)](https://npmjs.com/package/tobiko)
[![Build Status](https://secure.travis-ci.org/tnguyen14/tobiko.png?branch=master)](https://travis-ci.org/tnguyen14/tobiko)
[![Coverage Status](https://coveralls.io/repos/github/tnguyen14/tobiko/badge.svg?branch=master)](https://coveralls.io/github/tnguyen14/tobiko?branch=master)

> a JavaScript static site generator with support for WordPress

## Usage

### CLI

```shell
$ tobiko
$ tobiko -h

Options:
  --file, -f     path to config file                    [default: "tobiko.json"]
  --watch, -w    watch mode
  --help, -h     Show help                                             [boolean]
  --version, -v  Show version number                                   [boolean]
```

### API

```js
const tobiko = require('tobiko');
const conf = require('./tobiko.js');
tobiko(conf);
```

### Config file

By default, the CLI `tobiko` will look for `tobiko.json`. If dynamic options are needed, they can be declared in a JavaScript file:

```js
// tobiko.js
module.exports = {
  outDir: 'dist',
  handlebars: {
    templatesDir: 'templates',
    partialsDir: 'templates/partials',
    helpersDir: 'templates/helpers'
  },
  plugins: {
    files: {
      contentsDir: 'contents'
    },
    wordpress: {
      apiRoot: 'https://mywordpress.com/wp-json/wp/v2',
      contents: [
        {
          postType: 'posts',
          folder: 'articles',
          template: 'article.hbs'
        }
      ]
    },
    archive: {
      articles: {
        postsPerPage: 4,
        title: 'Articles',
        template: 'articles.hbs'
      }
    },
    transform: function(contentTree) {
      // do something with the content object
      return Promise.resolve(contentTree);
    }
  }
};
```

```shell
$ tobiko -f tobiko.js
```

## What's supported

* Content: JSON / Markdown (optionally with YAML frontmatter) / WordPress (through WP REST API)
* Template: Handlebars
* Styles: SCSS
* JavaScript: browserify (but it can really be anything)

## Documentation

### Options

* `contentsDir`: where the site's contents are located. Defaults to `contents`.
* `outDir`: where to generate the static files to. Defaults to `dist`.
* `handlebars`: Handlebars configuration options.
  * `templatesDir`: location of the templates directory. Defaults to `templates`. - `partialsDir`: location of template partials. Defaults to `templates/partials`. - `helpersDir`: location of template helpers. Defaults to `templates/helpers`.
* `plugins`: configuration for plugins. See [plugins](#plugins) for more info.

### Contents

By default, the site content will be in the `contents` folder. This option could be changed in `tobiko.json`, under `contentDir` property.

Content can be written in `json` and `markdown` with `yaml` [frontmatter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter).

The structure of the `contents` directory will be reflected in the final static HTML output.

#### config.json

High level, site-wide configurations can be specified in `config.json` in the root folder. Environment-specific configurations are also supported.

For example:

`config.json`

```json
{
  "site-name": "Tobiko Example",
  "site-url": "http://tobiko.io",
  "author": "Sushi Connoisseur"
}
```

`config.dev.json`

```json
{
  "site-url": "http://localhost:4000"
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

`index.json`

```js
{
  template: "index.hbs",
  content: "Hello World"
}
```

`index.md`

```md
---
template: index.hbs
---

Hello World
```

#### filepath

By default, the path of the page is its directory structure.
For example, the page `contents/articles/06/a-new-day.json` will have the URL `http://your-website.com/articles/06/a-new-day.html`.

However, each page's path can be overwritten by a `filepath` property.
Example, the file above can have the following property,

```js
{
  filepath: 'articles/a-new-day.json';
}
```

which will give it a URL `http://your-website.com/articles/a-new-day.html`.

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

In order to avoid the number 1, 2, 3 etc. appear in these cars' URLs, they could have a custom `filepath` property, such as `cars/tesla.json`.

#### date

Post or page date is supported by declaring property `date` in JSON or YAML. Any [ISO-8601 string formats](http://momentjs.com/docs/#/parsing/string/) for date is supported.

By default, a file without a `date` specified will have the `date` value of when the file was created. (To be more exact, it will have the [`ctime`][1] value when `grunt` is first run).

[1]: http://en.wikipedia.org/wiki/Atime_(Unix)#ctime

See [momentjs](http://momentjs.com) for more information about the date format.

### Templates

By default tobiko uses [Handlebars](http://handlebarsjs.com) as its templating engine.

Helpers and Partials are supported. They can be stored under `helpers` and `partials` directories under `templates`. These directory names of course can be changed in [`options`](#options) object.

Each page needs to specify its own template. This can be done with a JSON property

```js
{
  template: index.hbs;
}
```

or in the YAML frontmatter. A file with no `template` property will **not** be rendered.

#### Context

Each template will be passed in a context object generated from the content file with the following properties:

* `content`: the content file
* `content.main`: the parsed HTML if the content file is a markdown file
* `content.filename`: name of the content file
* `content.fileext`: extension type of the content file
* `content.url`: url of the page
* `config`: see [config](#config.json)
* `global`: all data in the `contents` directory
* Other sub-directories included in the same directory is accessible in the template with [nesting](#nesting).

### Plugins

Tobiko can be extended with plugins. By default, it comes with 3 plugins:

#### WordPress

While static site can be a great way to publish content, managing them using the file system can feel clunky at times. It is not too friendly for non-developers. As such, tobiko allows you to pull in content from WordPress, one of the most popular content management systems. With [WP REST API](http://v2.wp-api.org/), content from WordPress can be exported to a system like tobiko.

After installing the WP API plugin, you can start using it in tobiko by configuring it in [`options`](#options). For example:

```js
  wordpress: {
    apiRoot: 'http://your-wordpress-url.com/wp-json/wp/v2',
    contents: [{
      postType: 'posts',
      folder: 'articles',
      template: 'article.hbs'
    }]
  }
```

The `folder` key defines where the WordPress content is put on the content tree.

#### Archives and Pagination

A directory with a big number of posts could be configured to paginate. The paginated pages are called archives.
The option for enabling archives can be added to `options`. For example:

```js
  archive: {
    articles: {
      postsPerPage: 4,
      template: 'articleArchive.hbs',
      title: 'Articles'
    }
  }
```

Each key in the `archives` object represents the name of the directory to be paginated.
Each value can have the following options:

* `orderby`: (string) how to order the posts in the archives. Default to ['date'](#date)
* `postsPerPage`: (number) number of posts to be displayed per archive page
* `template`: (string) the template used to display these archive pages
* `title`: (string) title of these archive pages (this will be made available to use in template as `content.title`)

The paginated content in each archive page is accessible in the template file under `content.posts`.

_The `archives` plugin can be used in combination with the `wordpress` plugin to paginate WordPress content._

#### Transform

The `transform` plugin allows you to perform any type of modification/ transformation of the content tree.

In order to do so, instead of passing in a JS object like the other plugins for options, `transform` takes a function that accepts the `contentTree` object as an argument, and returns a promise that will resolve with a value that is the new `contentTree`.

### Deployment

The site can be deployed to [Github Pages](http://pages.github.com) or any static site hosting solutions.

In order to deploy to Github Pages, you can use [`gh-pages`](https://www.npmjs.com/package/gh-pages).

## Examples

Some examples of how tobiko is used

* [tnguyen14/tridnguyen.com](https://github.com/tnguyen14/tridnguyen.com)

## Issues/ Requests

Any issues, questions or feature requests could be created under [Github Issues](https://github.com/tnguyen14/tobiko/issues).
