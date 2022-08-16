import { render } from 'react-dom';
import { createSsr, useRegisterEffect, useSsrState, useSsrEffect } from '@issr/core';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

const App = ({ children }) => {
  const [state, setState] = useSsrState('text here');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn).then(data => {
      setState(data);
    });
  }, []);

  return (
    <div>
      <h1>{state}</h1>
      {typeof children === 'function' ? children(setState) : children}
    </div>
  );
};

(async () => {
  const SSR = createSsr({}, { onlyClient: true });

  render(
    <SSR>
      <App>
        {setState => <button onClick={() => setState('Hello world 2')}>Click</button>}
      </App>
    </SSR>, document.getElementById('root')
  );

  await SSR.effectCollection.runEffects();
  const SSR2 = createSsr(SSR.getState(), { onlyClient: true });

  render(
    <SSR2>
      <App />
    </SSR2>, document.getElementById('root2')
  );
})();
