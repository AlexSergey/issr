import { hydrateRoot } from 'react-dom/client';
import { routes } from './App';
import { createSsr } from '@issr/core';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const SSR = createSsr(window.SSR_DATA);

const router = createBrowserRouter(routes);

hydrateRoot(
  document.getElementById('root'),
  <SSR>
    <RouterProvider router={router} />
  </SSR>,
);
