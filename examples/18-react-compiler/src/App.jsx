import { useSsrState, useSsrEffect, useRegisterEffect } from '@issr/core';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello React Compiler'), 3000));

export const App = () => {
  const [state, setState] = useSsrState('i am test ');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn).then((data) => {
      setState(data);
    });
  }, []);

  return (
    <div>
      <h1>{state}</h1>
    </div>
  );
};
