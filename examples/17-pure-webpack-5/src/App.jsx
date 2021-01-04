import React from 'react';
import { useSsrState, useSsrEffect } from '@issr/core';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

export const App = () => {
  const [state, setState] = useSsrState('i am test ');

  useSsrEffect(async () => {
    const data = await asyncFn();
    setState(data);
  });

  return (
    <div>
      <h1>{state}</h1>
    </div>
  );
};
