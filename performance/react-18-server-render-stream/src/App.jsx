import { useSsrState, useSsrEffect, useRegisterEffect } from '@issr/core';

import Html from './Html';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

const AppComponent = () => {
  const [state, setState] = useSsrState('i am test ');
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

export const App = () => (
  <Html title="React SSR Demo">
    <AppComponent />
  </Html>
)
