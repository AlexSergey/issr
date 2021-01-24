const { isomorphicCompiler, backendCompiler, frontendCompiler, getArgs } = require('@rockpack/compiler');

if (getArgs().client) {
  frontendCompiler({
    src: 'src/client.jsx',
    global: {
      client: true
    },
    dist: 'public',
    babel: {
      plugins: [
        '@issr/babel-plugin'
      ]
    },
  });
} else {
  isomorphicCompiler(
    frontendCompiler({
      src: 'src/client.jsx',
      dist: 'public',
      babel: {
        plugins: [
          '@issr/babel-plugin'
        ]
      },
    }),
    backendCompiler({
      src: 'src/server.jsx',
      dist: 'dist',
      babel: {
        plugins: [
          '@issr/babel-plugin'
        ]
      },
    })
  );

}
