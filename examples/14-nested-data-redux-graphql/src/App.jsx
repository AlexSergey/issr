import { useSsrEffect, useSsrState, useRegisterEffect } from '@issr/core';
import { Apollo } from './Apollo';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve({ value: 'Hello world', apollo: true }), 1000));

export const App = () => {
  const [state, setState] = useSsrState({ value: 'i am test ', apollo: false });
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn).then(data => {
      setState(data);
    });
  }, []);

  return (
    <div>
      <h1>{state.value}</h1>
      {state.apollo && <Apollo />}
    </div>
  );
};
