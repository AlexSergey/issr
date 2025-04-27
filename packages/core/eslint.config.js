const { makeConfig } = require('@rockpack/codestyle');

const config = makeConfig();

config.push({
  rules: {
    '@typescript-eslint/naming-convention': 'off',
  },
});

module.exports = config;
