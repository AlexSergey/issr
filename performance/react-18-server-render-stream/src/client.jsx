import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import createSsr from '@issr/core';

document.addEventListener('DOMContentLoaded', () => {
  const SSR = createSsr(window.SSR_DATA);

  const container = document.getElementById('app');

  hydrateRoot(container, (
    <SSR>
      <App />
    </SSR>
  ));
});
