const _ = require('lodash'); // Did they think when they released then ES6 Object.assign function?
const defaultConfig = require('./config.default');

try {
  module.exports = _.defaultsDeep(require('./config'), defaultConfig);
} catch (e) {
  module.exports = defaultConfig;
}

