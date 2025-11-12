const { makeConfig } = require('@rockpack/codestyle');

const config = makeConfig();

config.push({
  rules: {
    'package-json/require-description': 'off',
    'package-json/require-type': 'off',
  },
});

module.exports = config;
