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
  const {html, state} = await serverRender.string(() => <App />);
  console.log(html);
  ctx.body = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script>
      window.SSR_DATA = ${serialize(state, {isJSON: true})}
    </script>
</head>
<body>
    <div id="root">${html}</div>
    <script src="/index.js"></script>
</body>
</html>
`;
});

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(4000, () => {
  console.log(`Server is listening ${4000} port`);
});
