import React from 'react';
import { hydrate } from 'react-dom';
import { CreateStoreProvider } from './Connect';
import { App } from './App';
import createSsr from '@issr/core';

const [SSR] = createSsr();

const { StoreProvider } = CreateStoreProvider(window.MOBX_DATA);

hydrate(
  <SSR>
    <StoreProvider>
      <App />
    </StoreProvider>
  </SSR>,
  document.getElementById('root')
);
