import { useSsrEffect, useSsrState, useRegisterEffect } from '@issr/core';

const asyncFn3 = () => new Promise((resolve) => setTimeout(() => resolve('B Component'), 1000));

const B = () => {
  const [state, setState] = useSsrState('none');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn3).then(data => {
      setState(data);
    });
  }, []);

  return <div>
    <p>{state}</p>
  </div>;
}

export default B;
