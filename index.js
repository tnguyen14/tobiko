const generateHtml = require('./lib/generateHtml');
const importContents = require('./lib/importContents');
const copyImages = require('./lib/copyImages');

module.exports = function(options) {
  let opts = Object.assign(
    {},
    {
      outDir: 'dist',
      markdown: {
        breaks: true,
        smartLists: true,
        smartypants: true
      },
      plugins: {
        files: {
          contentsDir: 'contents'
        }
      }
    },
    options
  );

  return Promise.all([
    importContents(opts).then(contentTree => {
      return generateHtml(opts, contentTree);
    }),
    copyImages(opts)
  ]);
};
