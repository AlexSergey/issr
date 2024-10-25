import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createSsr } from '@issr/core';
import { routes } from './App';

const SSR = createSsr(window.SSR_DATA);

const router = createBrowserRouter(routes);

hydrateRoot(
  document.getElementById('root'),
  <SSR>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </SSR>,
);
