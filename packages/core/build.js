const { libraryCompiler } = require('@rockpack/compiler');

libraryCompiler(
  {
    cjs: {
      dist: './lib/cjs',
      src: './src',
    },
    esm: {
      dist: './lib/esm',
      src: './src',
    },
    name: 'issr',
  },
  null,
  (config) => {
    config.externals = ['react', 'react-dom', 'react-dom/server'];
  },
);
