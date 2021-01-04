import React from 'react';
import { useSsrState, useSsrEffect } from '@issr/core';

const effect = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

const asyncFn = async (resolve) => {
  const data = await effect();
  resolve(data);
}

const simpleFn = (resolve) => asyncFn(resolve);

export const App = () => {
  const [state, setState] = useSsrState('text here');

  useSsrEffect(() => (
    new Promise(resolve => simpleFn(resolve, 1000))
      .then(setState)
  ));

  return (
    <div>
      <h1>{state}</h1>
    </div>
  );
};
