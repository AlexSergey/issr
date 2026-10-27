import { act, ReactNode, StrictMode } from 'react';
import { createRoot, hydrateRoot, Root } from 'react-dom/client';

import { useSsrEffect, useSsrState } from './hooks';
import { createSsr, ExcludeSsr, SsrScope } from './i-ssr';

// Module scope: React Compiler treats these as globals inside components
const effectSpy = jest.fn();
const recoverableErrors: unknown[] = [];
const cleanupSpy = jest.fn();
let increment: () => void = jest.fn();

const EffectWithCleanup = (): ReactNode => {
  useSsrEffect(
    () => {
      effectSpy();

      return (): void => {
        cleanupSpy();
      };
    },
    [],
    'effect-1',
  );

  return null;
};

const Counter = (): ReactNode => {
  const [count, setCount] = useSsrState(0, 'counter');
  increment = (): void => setCount((prev) => prev + 1);

  return <span>{count}</span>;
};

const nextTick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

const render = async (node: ReactNode): Promise<{ container: HTMLElement; root: Root }> => {
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => {
    root.render(node);
  });

  return { container, root };
};

const EffectApp = ({ dep = 0, tick }: { dep?: number; tick: number }): ReactNode => {
  const [state] = useSsrState('none', 'state-0');

  useSsrEffect(
    () => {
      effectSpy(dep);
    },
    [dep],
    'effect-0',
  );

  return (
    <div>
      {state}-{tick}
    </div>
  );
};

const ExcludeApp = (): ReactNode => (
  <div>
    <ExcludeSsr>
      <span>a</span>
      <span>b</span>
    </ExcludeSsr>
  </div>
);

const hydrate = async (container: HTMLElement, node: ReactNode): Promise<Root> => {
  let root: Root | undefined;
  await act(async () => {
    root = hydrateRoot(container, node, {
      onRecoverableError: (error) => {
        recoverableErrors.push(error);
      },
    });
  });

  return root as Root;
};

describe('client hydration tests', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    effectSpy.mockClear();
    cleanupSpy.mockClear();
    recoverableErrors.length = 0;
  });

  test('useSsrEffect is not called again after hydration on re-render', async () => {
    const SSR = createSsr({ 'state-0': 'data' });
    const container = document.createElement('div');
    container.innerHTML = '<div>data<!-- -->-<!-- -->0</div>';

    const root = await hydrate(
      container,
      <SSR>
        <EffectApp tick={0} />
      </SSR>,
    );

    await act(async () => {
      root.render(
        <SSR>
          <EffectApp tick={1} />
        </SSR>,
      );
    });

    expect(container.textContent).toBe('data-1');
    expect(effectSpy).not.toHaveBeenCalled();
    expect(recoverableErrors).toStrictEqual([]);
  });

  test('useSsrEffect is not called after hydration in StrictMode', async () => {
    const SSR = createSsr({ 'state-0': 'data' });
    const container = document.createElement('div');
    container.innerHTML = '<div>data<!-- -->-<!-- -->0</div>';

    await hydrate(
      container,
      <StrictMode>
        <SSR>
          <EffectApp tick={0} />
        </SSR>
      </StrictMode>,
    );

    expect(effectSpy).not.toHaveBeenCalled();
    expect(recoverableErrors).toStrictEqual([]);
  });

  test('useSsrEffect runs on the client when deps change after hydration', async () => {
    const SSR = createSsr({ 'state-0': 'data' });
    const container = document.createElement('div');
    container.innerHTML = '<div>data<!-- -->-<!-- -->0</div>';

    const root = await hydrate(
      container,
      <SSR>
        <EffectApp tick={0} />
      </SSR>,
    );

    expect(effectSpy).not.toHaveBeenCalled();

    await act(async () => {
      root.render(
        <SSR>
          <EffectApp dep={1} tick={0} />
        </SSR>,
      );
    });

    expect(effectSpy).toHaveBeenCalledTimes(1);
    expect(effectSpy).toHaveBeenCalledWith(1);

    await act(async () => {
      root.render(
        <SSR>
          <EffectApp dep={0} tick={0} />
        </SSR>,
      );
    });

    expect(effectSpy).toHaveBeenCalledTimes(2);
    expect(effectSpy).toHaveBeenLastCalledWith(0);
  });

  test('scoped state is restored on hydration', async () => {
    const SSR = createSsr({ 'a:state-0': 'from a', 'b:state-0': 'from b' });
    const container = document.createElement('div');
    container.innerHTML = '<div>from a<!-- -->-<!-- -->0</div><div>from b<!-- -->-<!-- -->0</div>';

    await hydrate(
      container,
      <SSR>
        <SsrScope id="a">
          <EffectApp tick={0} />
        </SsrScope>
        <SsrScope id="b">
          <EffectApp tick={0} />
        </SsrScope>
      </SSR>,
    );

    expect(container.textContent).toBe('from a-0from b-0');
    expect(effectSpy).not.toHaveBeenCalled();
    expect(recoverableErrors).toStrictEqual([]);
  });

  test('ExcludeSsr hydrates without mismatch and renders children after mount', async () => {
    const SSR = createSsr();
    const container = document.createElement('div');
    container.innerHTML = '<div></div>';

    await hydrate(
      container,
      <SSR>
        <ExcludeApp />
      </SSR>,
    );

    expect(container.innerHTML).toBe('<div><span>a</span><span>b</span></div>');
    expect(recoverableErrors).toStrictEqual([]);
  });

  test('state is removed from the global state on unmount', async () => {
    const SSR = createSsr({ 'state-0': 'data' });
    const container = document.createElement('div');
    container.innerHTML = '<div>data<!-- -->-<!-- -->0</div>';

    const root = await hydrate(
      container,
      <SSR>
        <EffectApp tick={0} />
      </SSR>,
    );
    expect(SSR.getState()).toStrictEqual({ 'state-0': 'data' });

    await act(async () => {
      root.unmount();
    });

    expect(SSR.getState()).toStrictEqual({});
  });

  test('onlyClient mode runs effects on mount and cleans them up', async () => {
    const SSR = createSsr({}, { onlyClient: true });

    const { root } = await render(
      <SSR>
        <EffectWithCleanup />
      </SSR>,
    );
    expect(effectSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  test('components mounted after hydration run their effects', async () => {
    const SSR = createSsr();
    const container = document.createElement('div');
    container.innerHTML = '';

    const root = await hydrate(container, <SSR>{null}</SSR>);
    expect(effectSpy).not.toHaveBeenCalled();

    // OnComplete switches loading off in a timeout after hydration
    await act(nextTick);

    await act(async () => {
      root.render(
        <SSR>
          <EffectWithCleanup />
        </SSR>,
      );
    });
    expect(effectSpy).toHaveBeenCalledTimes(1);
  });

  test('functional setState updates the component and the global state', async () => {
    const SSR = createSsr({}, { onlyClient: true });

    const { container } = await render(
      <SSR>
        <Counter />
      </SSR>,
    );

    await act(async () => {
      increment();
      increment();
    });

    expect(container.textContent).toBe('2');
    expect(SSR.getState()).toStrictEqual({ counter: 2 });
  });

  test('ExcludeSsr renders function children after hydration', async () => {
    const SSR = createSsr();
    const container = document.createElement('div');
    container.innerHTML = '';

    await hydrate(
      container,
      <SSR>
        <ExcludeSsr>{() => <b>fn</b>}</ExcludeSsr>
      </SSR>,
    );

    expect(container.innerHTML).toBe('<b>fn</b>');
    expect(recoverableErrors).toStrictEqual([]);
  });

  test('ExcludeSsr without children renders nothing', async () => {
    const SSR = createSsr({}, { onlyClient: true });

    const { container } = await render(
      <SSR>
        <ExcludeSsr>{undefined}</ExcludeSsr>
      </SSR>,
    );

    expect(container.innerHTML).toBe('');
  });
});
