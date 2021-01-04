import React from 'react';
import { hydrate } from 'react-dom';
import { Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserHistory } from 'history';
import { App } from './App';
import createSsr from '@issr/core';

const [SSR] = createSsr(window.SSR_DATA);

hydrate(
  <SSR>
    <HelmetProvider>
      <Router history={createBrowserHistory()}>
        <App />
      </Router>
    </HelmetProvider>
  </SSR>,
  document.getElementById('root')
);
