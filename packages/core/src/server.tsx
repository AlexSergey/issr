import React from 'react';
import { renderToString } from 'react-dom/server';
import createSSR from './iSSR';

interface StateInterface {
  [key: string]: unknown;
}

interface ServerRenderResult {
  html: string;
  state: StateInterface;
}

export const serverRender = async (
  iteration: (count?: number) => JSX.Element,
  outsideEffects?: Function
): Promise<ServerRenderResult> => {
  const SSR = createSSR({ });
  const renderNested = async (): Promise<string> => {
    const App = await iteration();

    const _html = renderToString((
      <SSR>
        {App}
      </SSR>
    ));

    const waited = SSR.effectCollection.getWaited();

    if (typeof outsideEffects === 'function') {
      await outsideEffects();
    }

    if (waited.length === 0) {
      return _html;
    }

    if (waited.length > 0) {
      await SSR.effectCollection.runEffects();

      return await renderNested();
    }

    return _html;
  };

  const html = await renderNested();

  return {
    html,
    state: SSR.getState()
  };
};
