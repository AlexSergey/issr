const { makeConfig } = require('@rockpack/codestyle');

const config = makeConfig();

config.push({
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    'package-json/require-type': 'off',
  },
});

module.exports = config;
