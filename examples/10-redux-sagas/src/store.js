import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';

import watchFetchImage from './containers/Image/saga';
import imageReducer from './containers/Image/slice';
import { isNotProduction, isProduction } from './utils/mode';

export default ({ initState = {}, rest } = {}) => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    devTools: isNotProduction(),
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        immutableCheck: true,
        serializableCheck: true,
        thunk: false,
      });

      return isProduction() ? middleware.concat([sagaMiddleware]) : middleware.concat([logger, sagaMiddleware]);
    },
    preloadedState: initState,
    reducer: {
      image: imageReducer,
    },
  });

  function* sagas() {
    yield fork(watchFetchImage, rest);
  }

  const rootSaga = sagaMiddleware.run(sagas);

  return { rootSaga, store };
};
