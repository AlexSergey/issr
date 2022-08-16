import { hydrate } from 'react-dom';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { App } from './App';
import { createSsr } from '@issr/core';

const SSR = createSsr(window.SSR_DATA);

hydrate(
  <SSR>
    <Router history={createBrowserHistory()}>
      <App />
    </Router>
  </SSR>,
  document.getElementById('root')
);
