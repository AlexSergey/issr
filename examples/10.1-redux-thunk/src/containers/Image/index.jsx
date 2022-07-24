import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {requestImage, requestImageError, requestImageSuccess } from './action';
import { useSsrEffect } from '@issr/core';
import rest from '../../utils/rest';

function getImage(dispatch) {
  dispatch(requestImage());
  return rest.get('https://api.github.com/users/defunkt')
    .then(({ data }) => {
      dispatch(requestImageSuccess({ url: data.avatar_url }));
    })
    .catch(() => dispatch(requestImageError()))
}

const Image = () => {
  const dispatch = useDispatch();
  const image = useSelector(state => state.imageReducer);

  useSsrEffect(() => dispatch(getImage));

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

export default Image;
