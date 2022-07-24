const { isomorphicCompiler, backendCompiler, frontendCompiler, getArgs } = require('@rockpack/compiler');

if (getArgs().client) {
  frontendCompiler({
    src: 'src/client.jsx',
    global: {
      client: true
    },
    dist: 'public',
  });
} else {
  isomorphicCompiler(
    frontendCompiler({
      src: 'src/client.jsx',
      dist: 'public',
    }),
    backendCompiler({
      src: 'src/server.jsx',
      dist: 'dist',
    })
  );

}
