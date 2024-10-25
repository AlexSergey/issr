import { Readable } from 'stream';
import StreamConcat from 'stream-concat';
import path from 'path';
import React from 'react';
import Koa from 'koa';
import serve from 'koa-static';
import Router from 'koa-router';
import serialize from 'serialize-javascript';
import { App } from './App';
import { serverRender } from '@issr/core';

const app = new Koa();
const router = new Router();

app.use(serve(path.resolve(__dirname, '../public')));

router.get(/.*/, async (ctx) => {
  ctx.respond = false;
  ctx.res.statusCode = 200;
  ctx.response.set('content-type', 'text/html');

  const { stream } = await serverRender.stream(() => <App />, {
    streamOptionsFn: (state) => ({
      bootstrapScripts: ['/index.js'],
      bootstrapScriptContent: `window.SSR_DATA = ${serialize(state, { isJSON: true })}`
    })
  });

  stream.pipe(ctx.res);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const server = app.listen(2999, () => {
  console.log(`Server is listening ${2999} port`);
});
