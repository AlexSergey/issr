import ReactDOMServer, { RenderToPipeableStreamOptions, PipeableStream } from 'react-dom/server';

import { createSsr, IInitState } from './i-ssr';

interface IState {
  [key: string]: unknown;
}

interface IServerRenderResultString {
  html: string;
  state: IState;
}

interface IServerRenderResultStream {
  stream: PipeableStream;
  state: IState;
}

interface IServerRenderOptions<T> {
  cachedState?: IInitState;
  outsideEffects?: T;
  streamOptions?: RenderToPipeableStreamOptions;
  streamOptionsFn?: (state: IState) => RenderToPipeableStreamOptions;
}

export const serverRender = {
  stream: async <T extends Function>(
    iteration: (count?: number) => JSX.Element,
    opts?: IServerRenderOptions<T>,
  ): Promise<IServerRenderResultStream> => {
    if (typeof ReactDOMServer.renderToPipeableStream === 'undefined') {
      throw new Error('Streaming is available only on React 18 or more');
    }
    const SSR = createSsr(opts?.cachedState);

    const renderStream = (App: JSX.Element): PipeableStream =>
      ReactDOMServer.renderToPipeableStream(
        <SSR>{App}</SSR>,
        typeof opts?.streamOptionsFn === 'function' ? opts?.streamOptionsFn(SSR.getState()) : opts?.streamOptions,
      );

    const renderNested = async (): Promise<PipeableStream> => {
      const App = await iteration();

      ReactDOMServer.renderToString(<SSR>{App}</SSR>);

      const waited = SSR.effectCollection.getWaited();

      if (typeof opts?.outsideEffects === 'function') {
        await opts.outsideEffects();

        if (waited.length === 0) {
          return renderStream(App);
        }
      }

      if (waited.length === 0) {
        return renderStream(App);
      }

      if (waited.length > 0) {
        await SSR.effectCollection.runEffects();

        return await renderNested();
      }

      return renderStream(App);
    };

    const stream = await renderNested();

    return {
      state: SSR.getState(),
      stream,
    };
  },

  string: async <T extends Function>(
    iteration: (count?: number) => JSX.Element,
    opts?: IServerRenderOptions<T>,
  ): Promise<IServerRenderResultString> => {
    const SSR = createSsr(opts?.cachedState);

    const renderNested = async (): Promise<string> => {
      const App = await iteration();

      const _html = ReactDOMServer.renderToString(<SSR>{App}</SSR>);

      const waited = SSR.effectCollection.getWaited();

      if (typeof opts?.outsideEffects === 'function') {
        await opts.outsideEffects();

        if (waited.length === 0) {
          return ReactDOMServer.renderToString(<SSR>{App}</SSR>);
        }
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
      state: SSR.getState(),
    };
  },
};
