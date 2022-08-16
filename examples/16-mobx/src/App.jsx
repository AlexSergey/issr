import { observer } from 'mobx-react';
import { useStore } from './Connect';
import { useSsrEffect, useRegisterEffect } from '@issr/core';

export const App = observer(() => {
  const { helloWorld } = useStore();
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(helloWorld.setString);
  }, []);

  return (
    <div>
      <h1>{helloWorld.state}</h1>
    </div>
  );
});
