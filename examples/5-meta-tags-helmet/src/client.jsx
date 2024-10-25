import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { routes } from './App';
import { createSsr } from '@issr/core';

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
