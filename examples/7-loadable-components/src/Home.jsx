import { Link } from 'react-router-dom';
import { useSsrState, useSsrEffect, useRegisterEffect } from '@issr/core';
import { asyncFn } from './asyncFn';

const Home = () => {
  const [state, setState] = useSsrState('i am test ');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn).then((data) => {
      setState(data);
    });
  }, []);

  return (
    <>
      <div>
        <h1>{state}</h1>
        <Link to="/secondary">secondary</Link>
      </div>
    </>
  );
};

export default Home;
