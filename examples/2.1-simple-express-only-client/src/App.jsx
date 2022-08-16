import { useSsrState, useSsrEffect, useRegisterEffect } from '@issr/core';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

export const App = () => {
  const [state, setState] = useSsrState('text here');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn).then(data => {
      setState(data);
    });
  }, []);

  return (
    <div>
      <h1>{state}</h1>
    </div>
  );
};
