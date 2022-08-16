import { useEffect, useState } from 'react';
import { useSsrState, useSsrEffect, useRegisterEffect } from '@issr/core';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

export const App = () => {
  const [s, setS] = useState('');
  const [state, setState] = useSsrState('i am test ');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn).then((data) => {
      console.log('test', s);
      setState(data);
    })
  }, [s]);

  return (
    <div>
      <h1>{state} 2</h1>
      <p>{s}</p>
      <input type="text" onChange={e => setS(e.target.value)} />
    </div>
  );
};
