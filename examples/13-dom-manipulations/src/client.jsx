import { hydrate } from 'react-dom';
import { App } from './App';
import { createSsr } from '@issr/core';

const SSR = createSsr(window.SSR_DATA);

hydrate(
  <SSR>
    <App />
  </SSR>,
  document.getElementById('root')
);
