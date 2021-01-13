/**
 * @jest-environment node
 */
import React from 'react';
import { shallow } from 'enzyme';
import { useSsrEffect, useSsrState } from './hooks';
import createSsr from './iSSR';

describe('hooks tests', () => {
  test('useSsrEffect - Basic load on ready', async () => {
    const SSR = createSsr();
    let called = false;

    const App = (): JSX.Element => {
      useSsrEffect(() => (
        new Promise(resolve => {
          setTimeout(() => {
            called = true;
            resolve();
          }, 500);
        })
      ), 'effect-0');

      return null;
    };

    shallow(
      <SSR>
        <App />
      </SSR>
    ).html();

    await SSR.effectCollection.runEffects();

    expect(called).toBe(true);
  });

  test('useSsrState - Load state by source', async () => {
    const SSR = createSsr({
      'custom-id': 'bar'
    });

    const App = (): JSX.Element => {
      const [state] = useSsrState('', 'custom-id');

      return (
        <div>
          {state}
        </div>
      );
    };

    const result = shallow(
      <SSR>
        <App />
      </SSR>
    )
      .html();

    expect(result).toBe('<div>bar</div>');
  });

  test('useSsrState - use setState isomorphic', async () => {
    const SSR = createSsr();

    const App = (): JSX.Element => {
      const [state, setState] = useSsrState('', 'state-0');

      useSsrEffect(() => (
        new Promise(resolve => {
          setTimeout(() => {
            setState('async bar');
            resolve();
          }, 500);
        })
      ), 'effect-0');

      return (
        <div>
          {state}
        </div>
      );
    };

    shallow(
      <SSR>
        <App />
      </SSR>
    )
      .html();

    await SSR.effectCollection.runEffects();
    const state = SSR.getState();

    const key = Object.keys(state)[0];

    expect(state).toStrictEqual({ [key]: 'async bar' });
  });
});
