import { useSelector, useDispatch } from 'react-redux';
import { requestImage, requestImageError, requestImageSuccess } from './action';
import { useSsrEffect, useRegisterEffect } from '@issr/core';

const callApi = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Large_breaking_wave.jpg/800px-Large_breaking_wave.jpg',
      });
    }, 500);
  });

function getImage(dispatch) {
  dispatch(requestImage());
  return callApi()
    .then(({ url }) => {
      dispatch(requestImageSuccess({ url }));
    })
    .catch(() => dispatch(requestImageError()));
}

const Image = () => {
  const dispatch = useDispatch();
  const image = useSelector((state) => state.imageReducer);
  const registerEffect = useRegisterEffect();

  useSsrEffect(() => {
    registerEffect(dispatch, getImage);
  }, []);

  return (
    <div>
      {image.loading ? (
        <p>Loading...</p>
      ) : image.error ? (
        <p>Error, try again</p>
      ) : (
        <p>
          <img width="200px" alt="random" src={image.url} />
        </p>
      )}
    </div>
  );
};

export default Image;
