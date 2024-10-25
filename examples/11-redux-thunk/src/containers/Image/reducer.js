import { createReducer } from '@reduxjs/toolkit';

import { requestImage, requestImageError, requestImageSuccess } from './action';

export default createReducer(
  {
    error: false,
    loading: false,
    url: '',
  },
  {
    [requestImage.type]: () => ({
      error: false,
      loading: true,
      url: '',
    }),
    [requestImageError.type]: () => ({
      error: true,
      loading: false,
      url: '',
    }),
    [requestImageSuccess.type]: (state, { payload }) => ({
      error: false,
      loading: false,
      url: payload.url,
    }),
  },
);
