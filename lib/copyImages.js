const glob = require('glob');
const path = require('path');
const cpFile = require('cp-file');

function copyImages (opts) {
	return new Promise((resolve, reject) => {
		// copy images
		glob(opts.files.contentsDir + '/**/*.{jpg,png,svg}', (err, files) => {
			if (err) {
				return reject(err);
			}
			return Promise.all(
				files.map(filepath => {
					let pathWithoutContentsDir = path.relative(
						opts.files.contentsDir,
						filepath
					);
					return cpFile(
						filepath,
						path.resolve(opts.outDir, pathWithoutContentsDir)
					);
				})
			).then(() => {
				resolve();
			});
		});
	});
}

module.exports = copyImages;
