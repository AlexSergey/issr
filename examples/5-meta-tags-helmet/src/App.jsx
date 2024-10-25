import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSsrState, useSsrEffect, useRegisterEffect } from '@issr/core';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

const Home = () => {
  const [state, setState] = useSsrState('i am test ');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn).then(data => {
      setState(data);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Home</title>
        <meta name="description" content="Home page" />
      </Helmet>
      <div>
        <h1>{state}</h1>
        <Link to="/secondary">secondary</Link>
      </div>
    </>
  );
};

const Secondary = () => (
  <>
    <Helmet>
      <title>Secondary</title>
      <meta name="description" content="Secondary page" />
    </Helmet>
    <div>
      <h1>Secondary</h1>
      <Link to="/">Home</Link>
    </div>
  </>
);

export const routes = [
  {
    children: [
      {
        element: <Secondary />,
        path: '/secondary',
      },
      {
        element: <Home />,
        path: '/',
      },
    ],
  },
];
