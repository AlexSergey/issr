import {hydrateRoot} from 'react-dom/client';
import { App } from './App';
import { createSsr } from '@issr/core';

const SSR = createSsr(window.SSR_DATA);

hydrateRoot(
  document.getElementById('root'),
  <SSR>
    <App />
  </SSR>,
);
