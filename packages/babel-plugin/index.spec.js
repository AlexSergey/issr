/**
 * @jest-environment node
 */
const { transformSync } = require('@babel/core');
const { createHash } = require('node:crypto');

const plugin = require('./index');

const cwd = '/project';
const hash = (file) => createHash('md5').update(file).digest('hex');
const fileHash = hash('src/app.js');

const transform = (code, { filename = '/project/src/app.js', options } = {}) =>
  transformSync(code, {
    babelrc: false,
    configFile: false,
    cwd,
    filename,
    plugins: [options ? [plugin, options] : plugin],
  }).code;

describe('issr babel plugin', () => {
  describe('useSsrState', () => {
    test('adds an id', () => {
      expect(transform('useSsrState(0);')).toBe(`useSsrState(0, "state-${fileHash}-0");`);
    });

    test('keeps a custom id', () => {
      expect(transform('useSsrState(0, "custom");')).toBe('useSsrState(0, "custom");');
    });

    test('increments the id for every call in a file', () => {
      expect(transform('useSsrState(0);\nuseSsrState(1);')).toBe(
        `useSsrState(0, "state-${fileHash}-0");\nuseSsrState(1, "state-${fileHash}-1");`,
      );
    });
  });

  describe('useRegisterEffect', () => {
    test('adds an id', () => {
      expect(transform('useRegisterEffect();')).toBe(`useRegisterEffect("register-effect-${fileHash}-0");`);
    });

    test('keeps a custom id', () => {
      expect(transform('useRegisterEffect("custom");')).toBe('useRegisterEffect("custom");');
    });
  });

  describe('useSsrEffect', () => {
    test.each([
      ['inline arrow function', '() => {}'],
      ['function expression', 'function () {}'],
      ['named callback', 'load'],
      ['member expression', 'obj.load'],
      ['call expression', 'useCallback(() => {}, [])'],
    ])('adds an id for %s without deps', (_name, callback) => {
      expect(transform(`useSsrEffect(${callback});`)).toBe(`useSsrEffect(${callback}, "ssr-effect-${fileHash}-0");`);
    });

    test.each([
      ['array deps', '[]'],
      ['deps from a variable', 'deps'],
    ])('adds an id with %s', (_name, deps) => {
      expect(transform(`useSsrEffect(load, ${deps});`)).toBe(
        `useSsrEffect(load, ${deps}, "ssr-effect-${fileHash}-0");`,
      );
    });

    test.each([
      ['string id', 'useSsrEffect(load, "custom");'],
      ['template id', 'useSsrEffect(load, `custom`);'],
      ['deps and id', 'useSsrEffect(load, [], "custom");'],
      ['no arguments', 'useSsrEffect();'],
    ])('keeps the call with %s', (_name, code) => {
      expect(transform(code)).toBe(code);
    });
  });

  describe('ids', () => {
    test('counters are separate for every hook', () => {
      expect(transform('useSsrState(0);\nuseRegisterEffect();\nuseSsrEffect(load);')).toBe(
        [
          `useSsrState(0, "state-${fileHash}-0");`,
          `useRegisterEffect("register-effect-${fileHash}-0");`,
          `useSsrEffect(load, "ssr-effect-${fileHash}-0");`,
        ].join('\n'),
      );
    });

    test('depend on the file path relative to cwd', () => {
      expect(transform('useSsrState(0);', { filename: '/project/src/other.js' })).toBe(
        `useSsrState(0, "state-${hash('src/other.js')}-0");`,
      );
    });

    test('are stable when a file is transformed again', () => {
      const first = transform('useSsrState(0);');

      expect(transform('useSsrState(0);')).toBe(first);
    });

    test('are generated without a filename', () => {
      const { code } = transformSync('useSsrState(0);', { babelrc: false, configFile: false, cwd, plugins: [plugin] });

      expect(code).toMatch(/^useSsrState\(0, "state-[\da-f]{32}-0"\);$/);
    });
  });

  describe('options', () => {
    test('custom hook names', () => {
      const options = { useRegisterEffect: 'useRegister', useSsrEffect: 'useEffectSsr', useSsrState: 'useStateSsr' };

      expect(transform('useStateSsr(0);\nuseRegister();\nuseEffectSsr(load);\nuseSsrState(0);', { options })).toBe(
        [
          `useStateSsr(0, "state-${fileHash}-0");`,
          `useRegister("register-effect-${fileHash}-0");`,
          `useEffectSsr(load, "ssr-effect-${fileHash}-0");`,
          'useSsrState(0);',
        ].join('\n'),
      );
    });

    test('a list of hook names', () => {
      const options = { useSsrState: ['useSsrState', 'useAppState'] };

      expect(transform('useSsrState(0);\nuseAppState(1);', { options })).toBe(
        `useSsrState(0, "state-${fileHash}-0");\nuseAppState(1, "state-${fileHash}-1");`,
      );
    });

    test('invalid option values fall back to defaults', () => {
      const options = { useSsrState: 42 };

      expect(transform('useSsrState(0);', { options })).toBe(`useSsrState(0, "state-${fileHash}-0");`);
    });
  });

  test('works with a caller target', () => {
    const { code } = transformSync('useSsrState(0);', {
      babelrc: false,
      caller: { name: 'babel-loader', target: 'node' },
      configFile: false,
      cwd,
      filename: '/project/src/app.js',
      plugins: [plugin],
    });

    expect(code).toBe(`useSsrState(0, "state-${fileHash}-0");`);
  });

  test('ignores other calls', () => {
    const code = 'useState(0);\nobj.useSsrState(0);\nuseEffect(() => {});';

    expect(transform(code)).toBe(code);
  });
});
