import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { routes } from './App';
import { createSsr } from '@issr/core';

const SSR = createSsr(window.SSR_DATA);

const router = createBrowserRouter(routes);
const head = createHead();

hydrateRoot(
  document.getElementById('root'),
  <SSR>
    <UnheadProvider head={head}>
      <RouterProvider router={router} />
    </UnheadProvider>
  </SSR>,
);
