import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { createSsr } from '@issr/core';

const SSR = createSsr(window.SSR_DATA);

const container = document.getElementById('root');

hydrateRoot(container, (
  <SSR>
    <App />
  </SSR>
));
