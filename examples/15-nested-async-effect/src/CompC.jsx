import { useSsrEffect, useSsrState, useRegisterEffect } from '@issr/core';

const asyncFn4 = () => new Promise((resolve) => setTimeout(() => resolve('C Component'), 1000));

const C = () => {
  const [state, setState] = useSsrState('none');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn4).then(data => {
      setState(data);
    });
  }, []);

  return <div>
    <p>{state}</p>
  </div>;
}

export default C;
