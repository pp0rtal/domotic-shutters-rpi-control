const _ = require('lodash');
const defaultConfig = require('./config.default');

try {
  module.exports = _.defaultsDeep(require('./config'), defaultConfig);
} catch (e) {
  module.exports = defaultConfig;
}

