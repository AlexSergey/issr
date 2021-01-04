# iSSR

**iSSR** the easiest way to move your React application to Server Side Rendering.

## Articles

## Features
- TypeScript support
- Extremely small size (5kb)
- Without dependencies
- **iSSR** supports native setState, Redux (thunk, sagas), Mobx, Apollo and other state management libraries


## Getting Started
Modern JS applications are divided into 2 types:
- CSR - Client-Side rendering. The application will be displayed only after downloading and executing all the necessary JS code. Until then, the user will see a blank page. It degrades the UX and is bad for SEO.
- SSR - Server-Side rendering. The auxiliary server doesn't send a blank page, but a page with data. Thus, the user can immediately start working with the application, and the Secondary Server does not give a blank page but a page with data. The user can immediately start working with the application and SEO bots will index the page.

There are 2 problems when building SSR applications

## Side effect's issue

For example, in a blog written in React, articles are loaded into the application via an asynchronous request to the server. Articles, in this case, are an important part of the application for the SEO bot to perform high-quality content indexing and for the user to immediately see the page content.
This asynchronous piece of code must participate in the SSR.
React out of the box can render an application on the server, but without considering asynchronous operations.
**iSSR** allows for asynchronous behavior during SSR.

## Compilation issue

In production mode, we need to have an artifact for deployment. For these purposes, we need to compile both the client and the backend of the application.

Schematically it looks like this:

![iSSR](https://www.rockpack.io/readme_assets/rockpack_ussr_1.png)

- SSR application consists of two sub-applications - frontend, backend with common logic.
- NodeJS app runs React app.
- **iSSR** handles all asynchronous operations.
- After receiving data from asynchronous operations, the React application is rendered.
- NodeJS application serves HTML to the user.

## Using

The simplest example of an SSR application using an asynchronous function via setState

### Example:
There is a simple application without SSR:

```jsx
import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve({ text: 'Hello world' }), 1000));

export const App = () => {
  const [state, setState] = useState({ text: 'text here' });

  useEffect(() => {
    asyncFn()
        .then(data => setState(data))
  }, []);

  return (
    <div>
      <h1>{state.text}</h1>
    </div>
  );
};

render(
  <App />,
  document.getElementById('root')
);
```

**Let's change this app to SSR:**

1. Installation:

```sh
# NPM
npm install @issr/core --save
npm install @babel/core @babel/preset-react @issr/babel-loader babel-loader webpack webpack-cli nodemon-webpack-plugin --save-dev
```

2. Make *webpack.config.js* in the root of project

```js
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

const common = {
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react'
              ],
              plugins: [
                '@issr/babel-loader'
              ]
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [
      '.js',
      '.jsx'
    ]
  }
}

module.exports = [
  {
    ...common,
    target: 'node',
    entry: './src/server.jsx',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'index.js',
    },
    plugins: [
      new NodemonPlugin({
        watch: path.resolve(__dirname, './dist'),
      })
    ]
  },
  {
    ...common,
    entry: './src/client.jsx',
    output: {
      path: path.resolve(__dirname, './public'),
      filename: 'index.js',
    }
  }
];
```
The main goal is to create 2 applications **client** and **server** with common logic.

3. Let's separate the general logic from render. Let's create **App.jsx**, and take out the common part for both Frontend and Backend:

```jsx
import React from 'react';
import { useSsrState, useSsrEffect } from '@issr/core';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve({ text: 'Hello world' }), 1000));

export const App = () => {
  const [state, setState] = useSsrEffect({ text: 'text here' });

  useSsrState(async () => {
    const data = await asyncFn();
    setState(data);
  });

  return (
    <div>
      <h1>{state.text}</h1>
    </div>
  );
};
```

In this code, *asyncFn* is an asynchronous operation that emulates a call to the server.

 - *useSsrState* is analogue of useState only with SSR support

 - *useSsrEffect* is analogue useEffect (() => {}, []); for SSR. It works with async logic.

4. **client.jsx** should contain part of the application for Frontend

```jsx
import React from 'react';
import { hydrate } from 'react-dom';
import createSsr from '@issr/core';
import { App } from './App';

const [SSR] = createSsr(window.SSR_DATA);

hydrate(
  <SSR>
    <App />
  </SSR>,
  document.getElementById('root')
);
```

The code:
```js
const [SSR] = createSsr(window.SSR_DATA);
```
Associates the state executed on the server with the application on the client. For correct work *useSsrState* on the client

5. **server.jsx** should contain the logic of the NodeJS application, for this it is convenient to use the koa/express framework or similar:

```jsx
import React from 'react';
import express from 'express';
import { serverRender } from '@issr/core';
import serialize from 'serialize-javascript';
import { App } from './App';

const app = express();

app.use(express.static('public'));

app.get('/*', async (req, res) => {
  const { html, state } = await serverRender(() => <App />);

  res.send(`
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script>
      window.SSR_DATA = ${serialize(state, { isJSON: true })}
    </script>
</head>
<body>
    <div id="root">${html}</div>
    <script src="/index.js"></script>
</body>
</html>
`);
});

app.listen(4000, () => {
  console.log('Example app listening on port 4000!');
});
```
There are 2 important points in this code:
5.1
```js
app.use(express.static('public'));
```
The server should serve the folder where the build frontend part of application.

5.2
```html
<script>
  window.SSR_DATA = ${serialize(state, { isJSON: true })}
</script>
```

This code saves the executed state on the server for later continuation of work with it on the client.

***

**Please see "examples" folder** - <a href="https://github.com/AlexSergey/issr/blob/master/examples" target="_blank">here</a>

***

## The MIT License

Copyright (c) Aleksandrov Sergey

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


