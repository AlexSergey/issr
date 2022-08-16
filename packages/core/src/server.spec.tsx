/**
 * @jest-environment node
 */
import { useSsrState, useSsrEffect, useRegisterEffect } from './hooks';
import { serverRender } from './server';

describe('server render tests', () => {
  test('pure state', async () => {
    const App = (): JSX.Element => {
      const [state, setState] = useSsrState('', 'state-0');
      const registerEffect = useRegisterEffect('effect-0');

      const asyncFn = (): Promise<string> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve('test bar');
          }, 500);
        });

      useSsrEffect(
        () => {
          registerEffect(asyncFn).then((testBar) => {
            setState(testBar);
          });
        },
        [],
        'use-effect-0',
      );

      return <div>{state}</div>;
    };

    const { html, state } = await serverRender.string(() => <App />);

    const key = Object.keys(state)[0] as string;

    expect(html).toBe('<div>test bar</div>');
    expect(state).toStrictEqual({ [key]: 'test bar' });
  });

  test('pure state and external callback', async () => {
    let called = false;

    const outsideEffect = (): Promise<void> =>
      new Promise((resolve) => {
        setTimeout(() => {
          called = true;
          resolve();
        }, 500);
      });

    const externalCallback = async (): Promise<void> => {
      if (!called) {
        await outsideEffect();
      }
    };

    const App = (): JSX.Element => {
      const [state, setState] = useSsrState('', 'state-0');
      const registerEffect = useRegisterEffect('effect-0');

      const asyncFn = (): Promise<string> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve('test bar');
          }, 500);
        });

      useSsrEffect(
        () => {
          registerEffect(asyncFn).then((data) => {
            setState(data);
          });
        },
        [],
        'use-effect-0',
      );

      return <div>{state}</div>;
    };

    const { html, state } = await serverRender.string(() => <App />, {
      outsideEffects: externalCallback,
    });

    const key = Object.keys(state)[0] as string;

    expect(called).toBe(true);
    expect(html).toBe('<div>test bar</div>');
    expect(state).toStrictEqual({ [key]: 'test bar' });
  });

  test('nested effects', async () => {
    const asyncFn1 = (): Promise<{ show: boolean; value: string }> =>
      new Promise((resolve) =>
        // eslint-disable-next-line no-promise-executor-return
        setTimeout(
          () =>
            resolve({
              show: true,
              value: 'Wrapper Component',
            }),
          300,
        ),
      );

    const Wrapper = ({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element => {
      const [state, setState] = useSsrState({ show: false, value: 'none ' }, 'state-0');
      const registerEffect = useRegisterEffect('effect-0');

      useSsrEffect(
        () => {
          registerEffect(asyncFn1).then((data) => {
            setState(data);
          });
        },
        [],
        'use-effect-0',
      );

      return (
        <div>
          <p>{state.value}</p>
          {state.show && children}
        </div>
      );
    };

    const asyncFn2 = (): Promise<{ show: boolean; value: string }> =>
      new Promise((resolve) =>
        // eslint-disable-next-line no-promise-executor-return
        setTimeout(
          () =>
            resolve({
              show: true,
              value: 'A Component',
            }),
          300,
        ),
      );

    const A = ({ children }: { children: JSX.Element }): JSX.Element => {
      const [state, setState] = useSsrState({ show: false, value: 'none ' }, 'state-1');
      const registerEffect = useRegisterEffect('effect-1');

      useSsrEffect(
        () => {
          registerEffect(asyncFn2).then((data) => {
            setState(data);
          });
        },
        [],
        'use-effect-1',
      );

      return (
        <div>
          <p>{state.value}</p>
          {state.show && children}
        </div>
      );
    };

    const asyncFn3 = (): Promise<string> =>
      // eslint-disable-next-line no-promise-executor-return
      new Promise((resolve) => setTimeout(() => resolve('B Component'), 300));

    const B = (): JSX.Element => {
      const [state, setState] = useSsrState('none', 'state-2');
      const registerEffect = useRegisterEffect('effect-2');

      useSsrEffect(
        () => {
          registerEffect(asyncFn3).then((data) => {
            setState(data);
          });
        },
        [],
        'use-effect-2',
      );

      return (
        <div>
          <p>{state}</p>
        </div>
      );
    };

    // eslint-disable-next-line no-promise-executor-return
    const asyncFn4 = (): Promise<string> => new Promise((resolve) => setTimeout(() => resolve('C Component'), 300));

    const C = (): JSX.Element => {
      const [state, setState] = useSsrState('none', 'state-3');
      const registerEffect = useRegisterEffect('effect-3');

      useSsrEffect(
        () => {
          registerEffect(asyncFn4).then((data) => {
            setState(data);
          });
        },
        [],
        'use-effect-3',
      );

      return (
        <div>
          <p>{state}</p>
        </div>
      );
    };

    const App = (): JSX.Element => (
      <Wrapper>
        <A>
          <B />
        </A>
        <C />
      </Wrapper>
    );

    const { html, state } = await serverRender.string(() => <App />);

    expect(html).toBe(
      '<div><p>Wrapper Component</p><div><p>A Component</p><div><p>B Component</p></div></div><div><p>C Component</p></div></div>',
    );
    expect(state).toStrictEqual({
      'state-0': { show: true, value: 'Wrapper Component' },
      'state-1': { show: true, value: 'A Component' },
      'state-2': 'B Component',
      'state-3': 'C Component',
    });
  });
});
