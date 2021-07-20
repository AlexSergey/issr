const path = require('path');
const { frontendCompiler } = require('@rockpack/compiler');

frontendCompiler({
  html: {
    template: path.resolve(__dirname, './index.ejs')
  }
});
