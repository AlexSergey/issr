import path from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import Router from 'koa-router';
import serialize from 'serialize-javascript';
import { transformHtmlTemplate } from '@unhead/react/server';

import { serverRender } from '@issr/core';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { routes } from './App';
import { createHead, UnheadProvider } from '@unhead/react/client';

const app = new Koa();
const router = new Router();

app.use(serve(path.resolve(__dirname, '../public')));

function createFetchRequest(ctx, req) {
  const origin = `${req.protocol}://${req.get('host')}`;
  // Note: This had to take originalUrl into account for presumably vite's proxying
  const url = new URL(req.originalUrl || req.url, origin);

  const controller = new AbortController();
  ctx.res.on('close', () => controller.abort());

  const headers = new Headers();

  for (const [key, values] of Object.entries(req.headers)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  const init = {
    body: req.method !== 'GET' && req.method !== 'HEAD' ? ctx.body : null,
    headers,
    method: req.method,
    signal: controller.signal,
  };

  return new Request(url.href, init);
}

router.get(/.*/, async (ctx) => {
  const head = createHead();

  const { dataRoutes, query } = createStaticHandler(routes);
  const fetchRequest = createFetchRequest(ctx, ctx.request);
  const context = await query(fetchRequest);

  const router = createStaticRouter(dataRoutes, context);

  const { html, state } = await serverRender.string(() => (
    <UnheadProvider head={head}>
      <StaticRouterProvider context={context} router={router} />
    </UnheadProvider>
  ));

  ctx.body = await transformHtmlTemplate(
    head,
    `  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="/css/styles.css" />
    <script><!--app-state--></script>
</head>
<body>
    <div id="root"><!--app-html--></div>
    <script src="/index.js"></script>
</body>
</html>`
      .replace(`<!--app-html-->`, html ?? '')
      .replace('<!--app-state-->', `window.SSR_DATA = ${serialize(state, { isJSON: true })}`),
  );
});

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(4000, () => {
  console.log(`Server is listening ${4000} port`);
});
