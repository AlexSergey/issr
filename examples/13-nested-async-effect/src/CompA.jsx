import { useSsrEffect, useSsrState, useRegisterEffect } from '@issr/core';

const asyncFn2 = () => new Promise((resolve) => setTimeout(() => resolve({ value: 'A Component', show: true }), 1000));

const A = ({ children }) => {
  const [state, setState] = useSsrState({ value: 'none ', show: false });
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn2).then((data) => {
      setState(data);
    });
  }, []);

  return (
    <div>
      <p>{state.value}</p>
      {state.show && children}
    </div>
  );
};

export default A;
