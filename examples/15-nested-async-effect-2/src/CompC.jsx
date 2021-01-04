import React from 'react';
import { useSsrEffect, useSsrState } from '@issr/core';

const asyncFn4 = () => new Promise((resolve) => setTimeout(() => resolve('C Component'), 1000));

const C = () => {
  const [state, setState] = useSsrState('none');

  useSsrEffect(async () => {
    const data = await asyncFn4();
    setState(data);
  });
  return <div>
    <p>{state}</p>
  </div>;
}

export default C;
