<p align="center">
  <img alt="iSSR" src="http://natrube.net/issr/logo.svg">
</p>

The easiest way to move your React application to Server-Side Rendering. Handles Side Effects and synchronizes State.

## Table of Contents

- [Articles](#articles)
- [Features](#features)
- [Getting Started](#getting-started)
- [SSR](#ssr)
- [Problems](#problems)
- [Motivation](#motivation)
- [Using](#using)
- [License](#the-mit-license)

## Articles
- [ENG: Server-Side Rendering from zero to hero](https://dev.to/alexsergey/server-side-rendering-from-zero-to-hero-2610)
- [RU: Server-Side Rendering с нуля до профи](https://habr.com/ru/post/527310/)

## Features

- **iSSR** supports native setState, Redux (thunk, sagas), Mobx, Apollo and other state management libraries
- TypeScript support
- React 19 and React-Compiler support
- Small size (5kb)
- No dependencies

## Getting Started

Modern JS applications are divided into 2 types:
- CSR - *Client-Side rendering*. The application will be displayed only after downloading and executing all the necessary JS code. Until then, the user will see a blank page. It degrades the UX and is bad for SEO.
- SSR - *Server-Side rendering*. The auxiliary server doesn't send a blank page, but a page with data. Thus, the user can immediately start working with the application, and search engine bots will index the page.

## SSR

Schematically, the SSR application looks like this:

![iSSR](http://natrube.net/issr/schema.png)

- SSR application consists of two sub-applications - frontend and backend with common logic.
- NodeJS app runs React app.
- **iSSR** handles all asynchronous operations.
- After receiving data from asynchronous operations, the React application is rendered.
- NodeJS' application serves HTML to the user.

## Problems

One of the key problems with SSR applications are asynchronous operations. JS is an asynchronous language, all requests to the server, on which our application data depends, are asynchronous. They affect the state of the system - these are side effects. Since content availability is critical for search engines, we must handle this asynchronous behavior. The React Server Renderer is designed as a synchronous operation that steps through our React-DOM step by step and turns it into HTML.

The second problem is hydration. A process that allows us to associate the received HTML and the state of the application from the server with what will be built in the user's browser.

**iSSR** handles asynchronous operations and synchronizes state on the client.

## Motivation

React currently has many solutions for building SSR applications. The most popular solution is **Next.JS**. This is a great framework with many possibilities, iSSR cannot replace it. But, **Next.JS** requires rewriting your existing application completely. **Next.JS** is a framework, which means you have to use its approaches. **iSSR** is just a small library that handles side effects and synchronizes state.
- You can very quickly migrate your existing application to SSR using **iSSR** without major changes.
- You can use any build system.
- You can use any state management solution like Redux, Apollo, Mobx or native setState.
- You can use any other SSR libraries (for example @loadable, react-helmet, etc).

## Usage

The simplest example of an SSR application using an asynchronous function via setState

### Example:

Here is a simple Todo List Application without SSR. It uses *jsonplaceholder* for mocking the data:

```jsx
import { useState, useEffect } from 'react';
import { render } from 'react-dom';

const getTodos = () => {
  return fetch('https://jsonplaceholder.typicode.com/todos')
   .then(data => data.json())
};

const TodoList = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    getTodos()
      .then(todos => setTodos(todos))
  }, []);

  return (
    <div>
      <h1>Hi</h1>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.title}</li>
        ))}
      </ul>
    </div>
  )
}

render(
  <TodoList />,
  document.getElementById('root')
);
```

It's very simple, when we open the application it will load the todo list data from the server and render it.

**Let's change this app to SSR:**

**Step 1**. Installation:

```sh
npm install @issr/core --save
npm install @issr/babel-plugin --save-dev
```

Basic webpack configuration for SSR:

```sh
npm install @babel/core @babel/preset-react babel-loader webpack webpack-cli nodemon-webpack-plugin --save-dev
```

*For this example we should install node-fetch because native **fetch** does not support **node.js**. Also, for the server we will use express, but you can use any module*

```sh
npm install node-fetch express --save
```

**Step 2**. Make *webpack.config.js* in the root of project

```js
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

const commonConfig = {
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
                '@issr/babel-plugin'
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
    ...commonConfig,
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
    ...commonConfig,
    entry: './src/client.jsx',
    output: {
      path: path.resolve(__dirname, './public'),
      filename: 'index.js',
    }
  }
];
```

If you are using *react-compiler*, *@issr/babel-plugin* must be first.

The main goal is to create 2 applications **client** and **server** with common logic.

**Step 3**. Let's separate the general logic from rendering. Let's create **App.jsx**, and take out the common part for both Frontend and Backend:

```jsx
import React from 'react';
import fetch from 'node-fetch';
import { useSsrState, useSsrEffect, useRegisterEffect } from '@issr/core';

const getTodos = () => {
  return fetch('https://jsonplaceholder.typicode.com/todos')
   .then(data => data.json())
};

export const App = () => {
  const [todos, setTodos] = useSsrState([]);
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(getTodos).then(todos => {
      setTodos(todos);
    });
  }, []);

  return (
    <div>
      <h1>Hi</h1>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
};
```

In this code, *getTodos* is an asynchronous operation that makes call to the *jsonplaceholder* server and gets the todo list data.

 - *useRegisterEffect* is a hook to wrap your async logic. Async method from this function will fetch the data from the server.
**if you need to pass additional parameters to the function you can pass these params to registerEffect**:
```js
const getTodos = (page) => {
  return fetch(`https://somedatasite.com/articles/${page}`)
    .then(data => data.json())
};
// ....
const [page, setPage] = useSsrState(1);
const [todos, setTodos] = useSsrState([]);
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(getTodos, page).then(todos => {
      setTodos(todos);
    });
  }, [page]);
```

 - *useSsrState* is analogue of useState only with SSR support

 - *useSsrEffect* is analogue React's useEffect; for SSR.

**Step 4**. **client.jsx** should contain part of the application for Frontend

```jsx
import React from 'react';
import { hydrate } from 'react-dom';
import { createSsr } from '@issr/core';
import { App } from './App';

const SSR = createSsr(window.SSR_DATA);

hydrate(
  <SSR>
    <App />
  </SSR>,
  document.getElementById('root')
);
```

The code:

```js
const SSR = createSsr(window.SSR_DATA);
```

Associates the state executed on the server with the application on the client side. For correct work *useSsrState* on the client

**Step 5**. **server.jsx** should contain the logic of the NodeJS application, it is convenient to use the koa/express framework or similar for this:

```jsx
import React from 'react';
import express from 'express';
import { serverRender } from '@issr/core';
import serialize from 'serialize-javascript';
import { App } from './App';

const app = express();

app.use(express.static('public'));

app.get('/*', async (req, res) => {
  const { html, state } = await serverRender.string(() => <App />);

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
 - *sererRender* - contains 2 methods:
   - **string** - will render your application to the string
   - **stream** - this method will work React 18 only. It's *PipeableStream*. Please, see the example: [React18](https://github.com/AlexSergey/issr/blob/master/examples/19-react-18)

There are 2 important points in this code:

```js
app.use(express.static('public'));
```

The server should serve the folder where frontend part of application is built.

```html
<script>
  window.SSR_DATA = ${serialize(state, { isJSON: true })}
</script>
```

This code saves the executed state on the server to use it on the client side later .

**Step 6**
The final step is webpack's scripts for development mode and building. Add to your **package.json**:

```json
"scripts": {
  "start": "webpack -w --mode development",
  "build": "webpack"
},
```
***

- **Please see [Articles](#articles) to learn how implement SSR for Redux/Sagas/Thunks and other.**
- **Please see "examples" folder to learn other cases** - <a href="https://github.com/AlexSergey/issr/blob/master/examples" target="_blank">here</a>

***

## The MIT License

Copyright (c) Aleksandrov Sergey

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
