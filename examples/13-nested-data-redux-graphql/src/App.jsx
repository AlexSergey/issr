import React from 'react';
import { useSsrEffect, useSsrState } from '@issr/core';
import { Apollo } from './Apollo';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve({ value: 'Hello world', apollo: true }), 1000));

export const App = () => {
  const [state, setState] = useSsrState({ value: 'i am test ', apollo: false });

  useSsrEffect(async () => {
    const data = await asyncFn();
    setState(data)
  });

  return (
    <div>
      <h1>{state.value}</h1>
      {state.apollo && <Apollo />}
    </div>
  );
};
