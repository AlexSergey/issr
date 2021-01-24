import React from 'react';
import { hydrate, render } from 'react-dom';
import { App } from './App';
import createSsr from '@issr/core';

const onlyClient = Boolean(process.env.client);

const SSR = createSsr(window.SSR_DATA, { onlyClient });

const rootElement = document.getElementById("root");

if (rootElement.hasChildNodes()) {
  hydrate(
    <SSR>
      <App />
    </SSR>,
    rootElement
  );
} else {
  render(
    <SSR>
      <App />
    </SSR>,
    rootElement
  );
}
