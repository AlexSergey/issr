import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { loadableReady } from '@loadable/component';
import { createSsr } from '@issr/core';
import { routes } from './App';

const SSR = createSsr(window.SSR_DATA);

const router = createBrowserRouter(routes);

loadableReady(() =>
  hydrateRoot(
    document.getElementById('root'),
    <SSR>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </SSR>,
  ),
);
