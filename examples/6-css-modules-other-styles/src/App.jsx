import { Link } from 'react-router-dom';
import { useSsrState, useSsrEffect, useRegisterEffect } from '@issr/core';
import styles from './styles.module.scss';
import './styles.css';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

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
      <div className={styles.block}>
        <h1>{state}</h1>
        <Link to="/secondary">secondary</Link>
      </div>
    </>
  );
};

const Secondary = () => (
  <>
    <MetaTags>
      <title>Secondary</title>
      <meta name="description" content="Secondary page" />
    </MetaTags>
    <div className={styles.block}>
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
