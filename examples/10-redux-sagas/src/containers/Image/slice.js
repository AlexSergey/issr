import { createSlice } from '@reduxjs/toolkit';

const imageSlice = createSlice({
  name: 'image',
  initialState: {
    url: '',
    loading: false,
    error: false,
  },
  selectors: {
    getImage: (state) => state,
  },
  reducers: {
    requestImage(state) {
      state.url = '';
      state.loading = true;
      state.error = false;
    },
    requestImageSuccess(state, { payload }) {
      state.url = payload.url;
      state.loading = false;
      state.error = false;
    },
    requestImageError(state, {payload}) {
      state.url = '';
      state.loading = false;
      state.error = true;
    },
  }
});

export const {requestImage, requestImageSuccess, requestImageError} = imageSlice.actions;
export const { getImage} = imageSlice.selectors;
export default imageSlice.reducer;
