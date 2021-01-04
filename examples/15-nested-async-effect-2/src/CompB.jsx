import React from 'react';
import { useSsrEffect, useSsrState } from '@issr/core';

const asyncFn3 = () => new Promise((resolve) => setTimeout(() => resolve('B Component'), 1000));

const B = () => {
  const [state, setState] = useSsrState('none');

  useSsrEffect(async () => {
    const data = await asyncFn3();
    setState(data);
  });
  return <div>
    <p>{state}</p>
  </div>;
}

export default B;
