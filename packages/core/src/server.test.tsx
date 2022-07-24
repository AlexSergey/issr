/**
 * @jest-environment node
 */
import React from 'react';
import { serverRender } from './server';
import { useSsrState, useSsrEffect } from './hooks';

describe('server render tests', () => {
  test('pure state', async () => {
    const App = (): JSX.Element => {
      const [state, setState] = useSsrState('', 'state-0');

      useSsrEffect((): Promise<void> => (
        new Promise(resolve => {
          setTimeout(() => {
            setState('test bar');
            resolve();
          }, 500);
        })
      ), 'effect-0');

      return (
        <div>{state}</div>
      );
    };

    const { html, state } = await serverRender(() => (
      <App />
    ));

    const key = Object.keys(state)[0];

    expect(html)
      .toBe('<div>test bar</div>');
    expect(state)
      .toStrictEqual({ [key]: 'test bar' });
  });

  test('pure state and external callback', async () => {
    let called = false;

    const outsideEffect = (): Promise<void> => (
      new Promise(resolve => {
        setTimeout(() => {
          called = true;
          resolve();
        }, 500);
      })
    );

    const externalCallback = async (): Promise<void> => {
      if (!called) {
        await outsideEffect();
      }
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    const App = (): JSX.Element => {
      const [state, setState] = useSsrState('', 'state-0');

      // eslint-disable-next-line sonarjs/no-identical-functions
      useSsrEffect((): Promise<void> => (
        // eslint-disable-next-line sonarjs/no-identical-functions
        new Promise(resolve => {
          setTimeout(() => {
            setState('test bar');
            resolve();
          }, 500);
        })
      ), 'effect-0');

      return (
        <div>{state}</div>
      );
    };

    const { html, state } = await serverRender(() => (
      <App />
    ), externalCallback);

    const key = Object.keys(state)[0];

    expect(called)
      .toBe(true);
    expect(html)
      .toBe('<div>test bar</div>');
    expect(state)
      .toStrictEqual({ [key]: 'test bar' });
  });
});
