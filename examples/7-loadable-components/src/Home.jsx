import React from 'react';
import { Link } from 'react-router-dom';
import { useSsrState, useSsrEffect } from '@issr/core';
import { asyncFn } from './asyncFn';

const Home = () => {
  const [state, setState] = useSsrState('i am test ');

  useSsrEffect(async () => {
    const data = await asyncFn();
    setState(data);
  });

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
