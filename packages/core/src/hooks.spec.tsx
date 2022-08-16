/**
 * @jest-environment node
 */
import { shallow } from 'enzyme';

import { useSsrEffect, useSsrState, useRegisterEffect } from './hooks';
import { createSsr } from './i-ssr';

describe('hooks tests', () => {
  test('useRegisterEffect - check effects registration', async () => {
    const SSR = createSsr();
    let called = false;

    const promisedFn = (): Promise<void> =>
      new Promise((resolve): void => {
        setTimeout((): void => {
          resolve();
        }, 500);
      });

    const App = (): JSX.Element | null => {
      const registerEffect = useRegisterEffect('effect-0');

      useSsrEffect(
        () => {
          registerEffect(promisedFn).then(() => {
            called = true;
          });
        },
        [],
        'use-effect-0',
      );

      return null;
    };

    shallow(
      <SSR>
        <App />
      </SSR>,
    ).html();

    await SSR.effectCollection.runEffects();

    expect(called).toBe(true);
  });

  test('useRegisterEffect - check params', async () => {
    const SSR = createSsr();
    let result = '';

    const promisedFn = (foo: string, bar: string): Promise<string> =>
      new Promise((resolve): void => {
        setTimeout((): void => {
          resolve(foo + bar);
        }, 500);
      });

    const App = (): JSX.Element | null => {
      const registerEffect = useRegisterEffect('effect-0');

      useSsrEffect(
        () => {
          registerEffect(promisedFn, 'foo', ' bar').then((res) => {
            result = res;
          });
        },
        [],
        'use-effect-0',
      );

      return null;
    };

    shallow(
      <SSR>
        <App />
      </SSR>,
    ).html();

    await SSR.effectCollection.runEffects();

    expect(result).toBe('foo bar');
  });

  test('useSsrEffect - Basic load on ready', async () => {
    const SSR = createSsr();
    let called = false;

    const promisedFn = (): Promise<void> =>
      new Promise((resolve): void => {
        setTimeout((): void => {
          resolve();
        }, 500);
      });

    const App = (): JSX.Element | null => {
      const registerEffect = useRegisterEffect('effect-0');

      useSsrEffect(
        () => {
          registerEffect(promisedFn).then(() => {
            called = true;
          });
        },
        [],
        'use-effect-0',
      );

      return null;
    };

    shallow(
      <SSR>
        <App />
      </SSR>,
    ).html();

    await SSR.effectCollection.runEffects();

    expect(called).toBe(true);
  });

  test('useSsrState - Load state by source', async () => {
    const SSR = createSsr({
      'custom-id': 'bar',
    });

    const App = (): JSX.Element => {
      const [state] = useSsrState('', 'custom-id');

      return <div>{state}</div>;
    };

    const result = shallow(
      <SSR>
        <App />
      </SSR>,
    ).html();

    expect(result).toBe('<div>bar</div>');
  });

  test('useSsrState - use setState isomorphic', async () => {
    const SSR = createSsr();

    const App = (): JSX.Element => {
      const [state, setState] = useSsrState('', 'state-0');
      const registerEffect = useRegisterEffect('effect-0');

      const promisedFn = (): Promise<string> =>
        new Promise((resolve): void => {
          setTimeout((): void => {
            resolve('async bar');
          }, 500);
        });

      useSsrEffect(
        () => {
          registerEffect(promisedFn).then((asyncBar) => {
            setState(asyncBar);
          });
        },
        [],
        'use-effect-0',
      );

      return <div>{state}</div>;
    };

    shallow(
      <SSR>
        <App />
      </SSR>,
    ).html();

    await SSR.effectCollection.runEffects();
    const state = SSR.getState();

    const key = Object.keys(state)[0] as string;

    expect(state).toStrictEqual({ [key]: 'async bar' });
  });

  test('useSsrState - boolean', async () => {
    const SSR = createSsr({
      'state-0': true,
    });

    const App = (): JSX.Element => {
      const [state, setState] = useSsrState(true, 'state-0');
      const registerEffect = useRegisterEffect('effect-0');

      const asyncState = (): Promise<boolean> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(false);
          }, 300);
        });

      useSsrEffect(() => {
        registerEffect(asyncState).then((s) => {
          setState(s);
        });
      }, 'use-effect-0');

      return <div>{JSON.stringify(state)}</div>;
    };

    shallow(
      <SSR>
        <App />
      </SSR>,
    ).html();

    await SSR.effectCollection.runEffects();
    const state = SSR.getState();

    const key = Object.keys(state)[0] as string;

    expect(state).toStrictEqual({ [key]: false });
  });
});
