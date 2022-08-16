import { call, put, takeEvery } from 'redux-saga/effects';
import { fetchImage, requestImage, requestImageSuccess, requestImageError } from './action';

function* watchFetchImage(rest) {
  yield takeEvery(fetchImage, fetchImageAsync, rest);
}

const callApi = () => (
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Large_breaking_wave.jpg/800px-Large_breaking_wave.jpg' });
    }, 500);
  })
)

function* fetchImageAsync(rest) {
  try {
    yield put(requestImage());
    const { url } = yield call(() => callApi());
    yield put(requestImageSuccess({ url }));
  } catch (error) {
    yield put(requestImageError());
  }
}

export default watchFetchImage;
