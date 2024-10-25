import path from 'node:path';
import Koa from 'koa';
import serve from 'koa-static';
import Router from 'koa-router';
import serialize from 'serialize-javascript';
import { App } from './App';
import { serverRender } from '@issr/core';

const app = new Koa();
const router = new Router();
const ABORT_DELAY = 10000;

app.use(serve(path.resolve(__dirname, '../public')));

router.get(/.*/, async (ctx) => {
  let didError = false;

  /**
   * NOTE: use promise to force koa waiting for streaming.
   */
  return new Promise(async (resolve, reject) => {
    const { stream } = await serverRender.stream(
      () => (
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#000000" />
            <meta name="description" content="iSSR example with React 18" />
            <title>Issr</title>
          </head>
          <body>
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<b>Enable JavaScript to run this app.</b>`,
              }}
            />
            <div id="root">
              <App />
            </div>
          </body>
        </html>
      ),
      {
        streamOptionsFn: (state) => ({
          bootstrapScripts: ['/index.js'],
          bootstrapScriptContent: `window.SSR_DATA = ${serialize(state, { isJSON: true })}`,
          onShellReady() {
            ctx.respond = false;
            ctx.res.statusCode = didError ? 500 : 200;
            ctx.response.set('content-type', 'text/html');
            stream.pipe(ctx.res);
            ctx.res.end();
            resolve();
          },
          onError() {
            didError = true;
            reject();
          },
        }),
      },
    );

    setTimeout(() => {
      stream.abort();
      reject();
    }, ABORT_DELAY);
  });
});

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(4000, () => {
  console.log(`Server is listening ${4000} port`);
});
