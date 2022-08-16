import { useSelector, useDispatch } from 'react-redux';
import { fetchImage } from './action';
import { useSsrEffect, useRegisterEffect } from '@issr/core';

const Image = () => {
  const dispatch = useDispatch();
  const image = useSelector(state => state.imageReducer);
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(dispatch, fetchImage());
  }, []);

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
