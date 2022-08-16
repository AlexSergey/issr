import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { App } from './App';
import { createSsr } from '@issr/core';
import createStore from './store';

const SSR = createSsr();

const { store } = createStore({
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
