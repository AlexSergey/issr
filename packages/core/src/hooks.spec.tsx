/**
 * @jest-environment node
 */
import { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

import { Statuses } from './effect';
import { useRegisterEffect, useSsrEffect, useSsrState } from './hooks';
import { createSsr } from './i-ssr';

// Module scope: React Compiler treats these as globals inside components
const callCounter = jest.fn();

const NoIdState = (): ReactNode => {
  const [state] = useSsrState('');

  return <div>{state}</div>;
};

const NoIdEffect = (): ReactNode => {
  useSsrEffect(() => undefined);

  return null;
};

const NoIdEffectWithDeps = (): ReactNode => {
  useSsrEffect(() => undefined, []);

  return null;
};

const NoIdRegisterEffect = (): ReactNode => {
  useRegisterEffect();

  return null;
};

describe('hooks tests', () => {
  const { window } = global;
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete global.window;
  });

  afterEach(() => {
    global.window = window;
    jest.restoreAllMocks();
  });

  test('useRegisterEffect - check effects registration', async () => {
    const SSR = createSsr();
    let called = false;

    const promisedFn = (): Promise<void> =>
      new Promise((resolve): void => {
        setTimeout((): void => {
          resolve();
        }, 500);
      });

    const App = (): ReactNode => {
      'use no memo';
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

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

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

    const App = (): ReactNode => {
      'use no memo';
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

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

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

    const App = (): ReactNode => {
      'use no memo';
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

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    await SSR.effectCollection.runEffects();

    expect(called).toBe(true);
  });

  test('useSsrState - Load state by source', async () => {
    const SSR = createSsr({
      'custom-id': 'bar',
    });

    const App = (): ReactNode => {
      const [state] = useSsrState('', 'custom-id');

      return <div>{state}</div>;
    };

    const result = renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    expect(result).toBe('<div>bar</div>');
  });

  test('useSsrState - use setState isomorphic', async () => {
    const SSR = createSsr();

    const App = (): ReactNode => {
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

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    await SSR.effectCollection.runEffects();
    const state = SSR.getState();

    const key = Object.keys(state)[0] as string;

    expect(state).toStrictEqual({ [key]: 'async bar' });
  });

  test('useSsrState - boolean', async () => {
    const SSR = createSsr({
      'state-0': true,
    });

    const App = (): ReactNode => {
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

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    await SSR.effectCollection.runEffects();
    const state = SSR.getState();

    const key = Object.keys(state)[0] as string;

    expect(state).toStrictEqual({ [key]: false });
  });

  test('useSsrState - functional update uses the current state', async () => {
    const SSR = createSsr();

    const App = (): ReactNode => {
      const [state, setState] = useSsrState(1, 'state-0');
      const registerEffect = useRegisterEffect('effect-0');

      useSsrEffect(() => {
        registerEffect(() => Promise.resolve(10)).then((value) => {
          setState((prev) => prev + value);
          setState((prev) => prev * 2);
        });
      }, 'use-effect-0');

      return <div>{state}</div>;
    };

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    await SSR.effectCollection.runEffects();

    expect(SSR.getState()).toStrictEqual({ 'state-0': 22 });
  });

  test('useRegisterEffect - waits for thenable results', async () => {
    const SSR = createSsr();

    const App = (): ReactNode => {
      const registerEffect = useRegisterEffect('effect-0');
      const thenable = { then: (resolve: (value: string) => void): void => resolve('done') };

      useSsrEffect(() => {
        registerEffect(() => thenable);
      }, 'use-effect-0');

      return null;
    };

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    expect(typeof SSR.effectCollection.getEffect('effect-0')?.getCallback()?.then).toBe('function');
  });

  test.each([
    ['useSsrState', NoIdState],
    ['useSsrEffect', NoIdEffect],
    ['useSsrEffect', NoIdEffectWithDeps],
    ['useRegisterEffect', NoIdRegisterEffect],
  ])('%s throws without id (babel plugin is not configured)', (hook, Component) => {
    const SSR = createSsr();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() =>
      renderToString(
        <SSR>
          <Component />
        </SSR>,
      ),
    ).toThrow(`"${hook}" hook: id is not a string`);
  });

  test('useRegisterEffect - sync result is registered without callback and returned as is', async () => {
    const SSR = createSsr();
    let result: number | undefined;

    const App = (): ReactNode => {
      const registerEffect = useRegisterEffect('effect-0');

      useSsrEffect(() => {
        result = registerEffect((a: number, b: number) => a + b, 1, 2);
      }, 'use-effect-0');

      return null;
    };

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    const effect = SSR.effectCollection.getEffect('effect-0');
    expect(result).toBe(3);
    expect(effect?.getCallback()).toBeUndefined();

    await SSR.effectCollection.runEffects();
    expect(effect?.getStatus()).toBe(Statuses.done);
  });

  test('useRegisterEffect - the same id is registered once', () => {
    const SSR = createSsr();

    const App = (): ReactNode => {
      const registerEffect = useRegisterEffect('effect-0');

      useSsrEffect(() => {
        registerEffect(() => Promise.resolve(callCounter('first')));
        registerEffect(() => Promise.resolve(callCounter('second')));
      }, 'use-effect-0');

      return null;
    };

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    expect(SSR.effectCollection.getEffects()).toHaveLength(1);
    expect(callCounter).toHaveBeenCalledTimes(2);
  });

  test('useSsrEffect - is called once on the backend for the same id', () => {
    const SSR = createSsr();
    const effect = jest.fn();

    const App = (): ReactNode => {
      useSsrEffect(effect, 'use-effect-0');

      return null;
    };

    renderToString(
      <SSR>
        <App />
      </SSR>,
    );
    renderToString(
      <SSR>
        <App />
      </SSR>,
    );

    expect(effect).toHaveBeenCalledTimes(1);
  });

  test('useSsrState - lazy initial state', () => {
    const SSR = createSsr();

    const App = (): ReactNode => {
      const [state] = useSsrState(() => 'lazy', 'state-0');

      return <div>{state}</div>;
    };

    expect(
      renderToString(
        <SSR>
          <App />
        </SSR>,
      ),
    ).toBe('<div>lazy</div>');
  });
});
