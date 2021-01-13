import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { App } from './App';
import createSsr from '@issr/core';
import createStore from './store';
import rest from './utils/rest';

const SSR = createSsr();

const { store } = createStore({
  rest,
  initState: window.REDUX_DATA
});

hydrate(
  <SSR>
    <Provider store={store}>
      <App />
    </Provider>
  </SSR>,
  document.getElementById('root')
);
