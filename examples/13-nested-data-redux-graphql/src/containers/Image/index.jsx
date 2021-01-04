import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchImage } from './action';
import { useSsrEffect } from '@issr/core';

const Dogs = () => {
  const dispatch = useDispatch();
  const image = useSelector(state => state.imageReducer);

  useSsrEffect(() => (
    new Promise(resolve => {
      dispatch(fetchImage(resolve));
    })
  ));

  return (
    <div>
      {image.loading ?
        <p>Loading...</p> : image.error ?
          <p>Error, try again</p> : (
            <p>
              <img width="200px" alt="random" src={image.url} />
            </p>
          )}
    </div>
  );
};

export default Dogs;
