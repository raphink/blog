// Uses dart-sass (the pure-JS `sass` package) instead of the deprecated
// node-sass, which required node-gyp + Python 2 and no longer builds on
// modern Node / Python toolchains (Netlify Noble image).
const sass = require('sass');
const fse = require('fs-extra');

exports.onPostBootstrap = (_args, configOptions) => {
    const result = sass.renderSync({
        file: configOptions.inputFile,
        outFile: configOptions.outputFile,
    });
    fse.outputFileSync(configOptions.outputFile, result.css);
};