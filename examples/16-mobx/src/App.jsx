import React from 'react';
import { observer } from 'mobx-react';
import { useStore } from './Connect';
import { useSsrEffect } from '@issr/core';

export const App = observer(() => {
  const { helloWorld } = useStore();

  useSsrEffect(async () => {
    await helloWorld.setString();
  });

  return (
    <div>
      <h1>{helloWorld.state}</h1>
    </div>
  );
});
