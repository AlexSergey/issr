/**
 * @jest-environment node
 */
import { Writable } from 'node:stream';
import { PropsWithChildren, ReactNode } from 'react';
import ReactDOMServer, { PipeableStream } from 'react-dom/server';

import { useRegisterEffect, useSsrEffect, useSsrState } from './hooks';
import { SsrScope } from './i-ssr';
import { serverRender } from './server';

const streamToString = (stream: PipeableStream): Promise<string> =>
  new Promise((resolve, reject) => {
    let html = '';
    const writable = new Writable({
      write(chunk, _encoding, callback): void {
        html += chunk.toString();
        callback();
      },
    });
    writable.on('finish', () => resolve(html));
    writable.on('error', reject);
    stream.pipe(writable);
  });

const Loader = ({ fail = false, name }: { fail?: boolean; name: string }): ReactNode => {
  const [state, setState] = useSsrState('none', 'state-0');
  const registerEffect = useRegisterEffect('effect-0');

  useSsrEffect(
    () => {
      registerEffect(() => (fail ? Promise.reject(new Error(name)) : Promise.resolve(`loaded ${name}`))).then(
        (data) => {
          setState(data);
        },
        () => {
          setState('error');
        },
      );
    },
    [],
    'use-effect-0',
  );

  return <p>{state}</p>;
};

const Item = ({ name }: { name: string }): ReactNode => {
  const [state, setState] = useSsrState('none', 'state-0');
  const registerEffect = useRegisterEffect('effect-0');

  useSsrEffect(
    () => {
      registerEffect(() => Promise.resolve(`loaded ${name}`)).then((data) => {
        setState(data);
      });
    },
    [],
    'use-effect-0',
  );

  return <li>{state}</li>;
};

describe('server render tests', () => {
  test('pure state', async () => {
    const App = (): ReactNode => {
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

    const App = (): ReactNode => {
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
        setTimeout(
          () =>
            resolve({
              show: true,
              value: 'Wrapper Component',
            }),
          300,
        ),
      );

    const Wrapper = ({ children }: PropsWithChildren): ReactNode => {
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
        setTimeout(
          () =>
            resolve({
              show: true,
              value: 'A Component',
            }),
          300,
        ),
      );

    const A = ({ children }: PropsWithChildren): ReactNode => {
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

    const asyncFn3 = (): Promise<string> => new Promise((resolve) => setTimeout(() => resolve('B Component'), 300));

    const B = (): ReactNode => {
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

    const asyncFn4 = (): Promise<string> => new Promise((resolve) => setTimeout(() => resolve('C Component'), 300));

    const C = (): ReactNode => {
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

    const App = (): ReactNode => (
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

  test('SsrScope gives every list item its own state and effects', async () => {
    const { html, state } = await serverRender.string(() => (
      <ul>
        {['a', 'b'].map((name) => (
          <SsrScope id={name} key={name}>
            <Item name={name} />
          </SsrScope>
        ))}
      </ul>
    ));

    expect(html).toBe('<ul><li>loaded a</li><li>loaded b</li></ul>');
    expect(state).toStrictEqual({ 'a:state-0': 'loaded a', 'b:state-0': 'loaded b' });
  });

  test('nested SsrScope ids are joined', async () => {
    const { state } = await serverRender.string(() => (
      <SsrScope id="list">
        <SsrScope id={1}>
          <Item name="x" />
        </SsrScope>
      </SsrScope>
    ));

    expect(state).toStrictEqual({ 'list/1:state-0': 'loaded x' });
  });

  test('failed effect does not break rendering', async () => {
    const { html, state } = await serverRender.string(() => <Loader fail name="x" />);

    expect(html).toBe('<p>error</p>');
    expect(state).toStrictEqual({ 'state-0': 'error' });
  });

  test('cachedState is used and the effect result overrides it', async () => {
    const { html, state } = await serverRender.string(() => <Loader name="x" />, {
      cachedState: { 'state-0': 'cached', 'state-other': 'kept' },
    });

    expect(html).toBe('<p>loaded x</p>');
    expect(state).toStrictEqual({ 'state-0': 'loaded x', 'state-other': 'kept' });
  });

  test('outsideEffects are awaited together with effects', async () => {
    const outsideEffects = jest.fn(() => Promise.resolve());

    const { html } = await serverRender.string(() => <Loader name="x" />, { outsideEffects });

    expect(html).toBe('<p>loaded x</p>');
    // first render has effects, second render has none
    expect(outsideEffects).toHaveBeenCalledTimes(2);
  });

  test('iteration can be async', async () => {
    const { html } = await serverRender.string(async () => <Loader name="async" />);

    expect(html).toBe('<p>loaded async</p>');
  });

  describe('stream', () => {
    test('renders without effects', async () => {
      const { state, stream } = await serverRender.stream(() => <div>static</div>);

      expect(await streamToString(stream)).toBe('<div>static</div>');
      expect(state).toStrictEqual({});
    });

    test('waits for effects before streaming', async () => {
      const { state, stream } = await serverRender.stream(() => (
        <SsrScope id="a">
          <Loader name="a" />
        </SsrScope>
      ));

      expect(await streamToString(stream)).toBe('<p>loaded a</p>');
      expect(state).toStrictEqual({ 'a:state-0': 'loaded a' });
    });

    test('awaits outsideEffects', async () => {
      const outsideEffects = jest.fn(() => Promise.resolve());

      const { stream } = await serverRender.stream(() => <Loader name="x" />, { outsideEffects });

      expect(await streamToString(stream)).toBe('<p>loaded x</p>');
      expect(outsideEffects).toHaveBeenCalledTimes(2);
    });

    test('passes streamOptions', async () => {
      const onShellReady = jest.fn();

      const { stream } = await serverRender.stream(() => <div>static</div>, {
        streamOptions: { onShellReady },
      });
      await streamToString(stream);

      expect(onShellReady).toHaveBeenCalledTimes(1);
    });

    test('streamOptionsFn receives the final state', async () => {
      const streamOptionsFn = jest.fn(() => ({}));

      const { stream } = await serverRender.stream(() => <Loader name="x" />, { streamOptionsFn });
      await streamToString(stream);

      expect(streamOptionsFn).toHaveBeenCalledWith({ 'state-0': 'loaded x' });
    });

    test('throws when streaming is not supported', async () => {
      const descriptor = Object.getOwnPropertyDescriptor(
        ReactDOMServer,
        'renderToPipeableStream',
      ) as PropertyDescriptor;
      Object.defineProperty(ReactDOMServer, 'renderToPipeableStream', { configurable: true, value: undefined });

      try {
        await expect(serverRender.stream(() => <div />)).rejects.toThrow('Streaming is available only on React 18');
      } finally {
        Object.defineProperty(ReactDOMServer, 'renderToPipeableStream', descriptor);
      }
    });
  });
});
