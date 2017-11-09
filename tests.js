require('babel-register');

const glob = require('glob');
const path = require('path');

const tests = path.resolve(`${__dirname}/src/**/*.test.js`);

glob.sync(tests).forEach(function(file) {
    require(path.resolve(file));
});
