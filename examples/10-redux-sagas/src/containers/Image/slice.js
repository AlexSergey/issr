import { createSlice } from '@reduxjs/toolkit';

const imageSlice = createSlice({
  initialState: {
    error: false,
    loading: false,
    url: '',
  },
  name: 'image',
  reducers: {
    requestImage(state) {
      state.url = '';
      state.loading = true;
      state.error = false;
    },
    requestImageError(state, { payload }) {
      state.url = '';
      state.loading = false;
      state.error = true;
    },
    requestImageSuccess(state, { payload }) {
      state.url = payload.url;
      state.loading = false;
      state.error = false;
    },
  },
  selectors: {
    getImage: (state) => state,
  },
});

export const { requestImage, requestImageError, requestImageSuccess } = imageSlice.actions;
export const { getImage } = imageSlice.selectors;
export default imageSlice.reducer;
