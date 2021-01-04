import React from 'react';
import { useSsrEffect, useSsrState } from '@issr/core';

const asyncFn2 = () => new Promise((resolve) => setTimeout(() => resolve({ value: 'A Component', show: true }), 1000));

const A = ({ children }) => {
  const [state, setState] = useSsrState({ value: 'none ', show: false });

  useSsrEffect(async () => {
    const data = await asyncFn2();
    setState(data);
  });
  return <div>
    <p>{state.value}</p>
    {state.show && children}
  </div>;
}

export default A;
