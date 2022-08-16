import { Switch, Route, Link } from 'react-router-dom';
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
    <div>
      <h1>{state}</h1>
      <Link to="/secondary">secondary</Link>
    </div>
  );
};

const Secondary = () => (
  <div>
    <h1>Secondary</h1>
    <Link to="/">Home</Link>
  </div>
);

export const App = () => (
  <Switch>
    <Route path="/secondary" component={Secondary} />
    <Route path="/" component={Home} exact />
  </Switch>
);
