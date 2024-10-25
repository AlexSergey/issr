import { createRoot } from 'react-dom/client';
import { createSsr, useRegisterEffect, useSsrState, useSsrEffect } from '@issr/core';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve('Hello world'), 1000));

const App = ({ children }) => {
  const [state, setState] = useSsrState('text here');
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(asyncFn).then((data) => {
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

const root = createRoot(document.getElementById('root'));
const root2 = createRoot(document.getElementById('root2'));

(async () => {
  const SSR = createSsr({}, { onlyClient: true });

  root.render(
    <SSR>
      <App>{(setState) => <button onClick={() => setState('Hello world 2')}>Click</button>}</App>
    </SSR>,
  );

  await SSR.effectCollection.runEffects();
  const SSR2 = createSsr(SSR.getState(), { onlyClient: true });

  root2.render(
    <SSR2>
      <App />
    </SSR2>,
  );
})();
