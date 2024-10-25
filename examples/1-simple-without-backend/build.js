const { frontendCompiler } = require('@rockpack/compiler');
const path = require('path');

frontendCompiler({
  html: {
    template: path.resolve(__dirname, './index.ejs'),
  },
});
