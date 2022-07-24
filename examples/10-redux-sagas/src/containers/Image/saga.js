import { call, put, takeEvery } from 'redux-saga/effects';
import { fetchImage, requestImage, requestImageSuccess, requestImageError } from './action';

function* watchFetchImage(rest) {
  yield takeEvery(fetchImage, fetchImageAsync, rest);
}

function* fetchImageAsync(rest) {
  try {
    yield put(requestImage());
    const { data } = yield call(() => rest.get('https://api.github.com/users/defunkt'));
    yield put(requestImageSuccess({ url: data.avatar_url }));
  } catch (error) {
    yield put(requestImageError());
  }
}

export default watchFetchImage;
