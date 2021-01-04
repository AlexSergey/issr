import React, { useEffect } from 'react';
import CustomScroll from 'react-customscroll';
import { useSsrState, useSsrEffect, isClient } from '@issr/core';
import './styles.css';

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve(['1', '2', '3']), 1000));

export const App = () => {
  const [state, setState] = useSsrState([]);

  useSsrEffect(async () => {
    const data = await asyncFn();
    setState(data);
  });

  useEffect(() => {
    if (isClient()) {
      setTimeout(() => {
        document.getElementById('block-3')
          .scrollIntoView();
      }, 100);
    }
  }, []);

  return (
    <CustomScroll>
      <div>
        <h1>Items</h1>
        {state.map((item) => (
          <div id={`block-${item}`} style={{ height: '1000px' }} key={`block-${item}`}>
            <h2>{item}</h2>
          </div>
        ))}
      </div>
    </CustomScroll>
  );
};
