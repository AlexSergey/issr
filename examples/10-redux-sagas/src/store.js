import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import logger from 'redux-logger';
import imageReducer from './containers/Image/slice';
import watchFetchImage from './containers/Image/saga';
import { isProduction, isNotProduction } from './utils/mode';

export default ({ initState = {}, rest } = {}) => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      image: imageReducer
    },
    devTools: isNotProduction(),
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        immutableCheck: true,
        serializableCheck: true,
        thunk: false,
      });

      return isProduction() ? middleware.concat([
        sagaMiddleware
      ]) : middleware.concat([
        logger,
        sagaMiddleware
      ]);
    },
    preloadedState: initState
  });

  function* sagas() {
    yield fork(watchFetchImage, rest);
  }

  const rootSaga = sagaMiddleware.run(sagas);

  return { store, rootSaga };
};
