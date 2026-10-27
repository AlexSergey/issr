const { createHash } = require('node:crypto');
const pathNode = require('node:path');

function getTarget(caller) {
  return caller && caller.target;
}

const getNames = (option, defaultName) =>
  typeof option === 'string' || Array.isArray(option) ? [].concat(option) : [defaultName];

const isStringId = (node) => node.type === 'StringLiteral' || node.type === 'TemplateLiteral';

const BabelISSRPlugin = (api) => {
  const t = api.types;

  api.caller(getTarget);

  return {
    name: 'issr',
    visitor: {
      Program: {
        enter(prog, data) {
          const { cwd, filename, opts: options } = data;

          const useRegisterEffectNames = getNames(options.useRegisterEffect, 'useRegisterEffect');
          const useSsrStateNames = getNames(options.useSsrState, 'useSsrState');
          const useSsrEffectNames = getNames(options.useSsrEffect, 'useSsrEffect');

          const id = createHash('md5')
            .update(pathNode.relative(cwd, filename || ''))
            .digest('hex');
          // Counters are per file and reset on every transform, so ids stay stable across rebuilds (watch mode, HMR)
          const counters = {
            useRegisterEffect: 0,
            useSsrEffect: 0,
            useSsrState: 0,
          };

          prog.traverse({
            CallExpression(path) {
              const { name } = path.node.callee;
              const args = path.node.arguments;

              if (useRegisterEffectNames.includes(name)) {
                if (args.length === 0) {
                  args.push(t.StringLiteral(`register-effect-${id}-${counters.useRegisterEffect++}`));
                }
              }

              if (useSsrStateNames.includes(name)) {
                if (args.length === 1) {
                  args.push(t.StringLiteral(`state-${id}-${counters.useSsrState++}`));
                }
              }

              if (useSsrEffectNames.includes(name)) {
                // useSsrEffect(effect) or useSsrEffect(effect, deps), the id is not passed yet
                if (args.length === 1 || (args.length === 2 && !isStringId(args[1]))) {
                  args.push(t.StringLiteral(`ssr-effect-${id}-${counters.useSsrEffect++}`));
                }
              }
            },
          });
        },
      },
    },
  };
};

module.exports = BabelISSRPlugin;
