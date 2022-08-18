const pathNode = require('node:path');

const md5 = require('md5');

function getTarget(caller) {
  return caller && caller.target;
}

const createDummy = (globalCache, id, field) => {
  if (!globalCache[id]) {
    globalCache[id] = {
      useRegisterEffect: 0,
      useSsrEffect: 0,
      useSsrState: 0,
    };
  }

  if (!globalCache[id][field]) {
    globalCache[id][field] = 0;
  }
};

const BabelISSRPlugin = (api) => {
  const t = api.types;
  const globalCache = {};

  api.caller(getTarget);

  return {
    name: 'issr',
    visitor: {
      CallExpression(path, { opts: options, file }) {
        const { filename, cwd } = file.opts;

        const useRegisterEffectName =
          options && (typeof options.useRegisterEffect === 'string' || Array.isArray(options.useRegisterEffect))
            ? options.useRegisterEffect
            : 'useRegisterEffect';

        const useSsrStateName =
          options && (typeof options.useSsrState === 'string' || Array.isArray(options.useSsrState))
            ? options.useSsrState
            : 'useSsrState';

        const useSsrEffectName =
          options && (typeof options.useSsrEffect === 'string' || Array.isArray(options.useSsrEffect))
            ? options.useSsrEffect
            : 'useSsrEffect';

        const useRegisterEffectNames = Array.isArray(useRegisterEffectName)
          ? useRegisterEffectName
          : [useRegisterEffectName];

        const useSsrStateNames = Array.isArray(useSsrStateName) ? useSsrStateName : [useSsrStateName];

        const useSsrEffectNames = Array.isArray(useSsrEffectName) ? useSsrEffectName : [useSsrEffectName];

        useRegisterEffectNames.forEach((registerEffect) => {
          if (path.node.callee.name === registerEffect) {
            if (path.node.arguments.length === 0) {
              const id = md5(pathNode.relative(cwd, filename));
              createDummy(globalCache, id, 'useRegisterEffect');
              const effectID = `register-effect-${id}-${globalCache[id].useRegisterEffect++}`;
              path.node.arguments.push(t.StringLiteral(effectID));
            }
          }
        });

        useSsrStateNames.forEach((stateName) => {
          if (path.node.callee.name === stateName) {
            if (path.node.arguments.length === 1) {
              const id = md5(pathNode.relative(cwd, filename));
              createDummy(globalCache, id, 'useSsrState');
              const setStateID = `state-${id}-${globalCache[id].useSsrState++}`;
              path.node.arguments.push(t.StringLiteral(setStateID));
            }
          }
        });

        useSsrEffectNames.forEach((ssrEffectName) => {
          if (path.node.callee.name === ssrEffectName) {
            const args = path.node.arguments;
            const lastItem = args[args.length - 1];
            const lastItemIsArray = lastItem.type === 'ArrayExpression';
            const firstItemIsFunction = lastItem.type.indexOf('FunctionExpression') >= 0;

            if (
              (path.node.arguments.length === 2 && lastItemIsArray) ||
              (path.node.arguments.length === 1 && firstItemIsFunction)
            ) {
              const id = md5(pathNode.relative(cwd, filename));
              createDummy(globalCache, id, 'useSsrEffect');
              const effectID = `ssr-effect-${id}-${globalCache[id].useSsrEffect++}`;
              path.node.arguments.push(t.StringLiteral(effectID));
            }
          }
        });
      },
    },
  };
};

module.exports = BabelISSRPlugin;
