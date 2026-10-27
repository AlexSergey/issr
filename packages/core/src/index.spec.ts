/**
 * @jest-environment node
 */
import * as issr from './index';

describe('public API', () => {
  test('exports', () => {
    expect(Object.keys(issr).sort()).toStrictEqual([
      'ExcludeSsr',
      'SsrScope',
      'createSsr',
      'isBackend',
      'isClient',
      'serverRender',
      'useRegisterEffect',
      'useSsrEffect',
      'useSsrState',
    ]);
  });
});
