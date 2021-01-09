import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import imageReducer from './containers/Image/reducer';
import { isProduction, isNotProduction } from './utils/mode';

export default ({ initState = {} } = {}) => {
  const middleware = getDefaultMiddleware({
    immutableCheck: true,
    serializableCheck: true,
    thunk: true,
  });

  const store = configureStore({
    reducer: {
      imageReducer
    },
    devTools: isNotProduction(),
    middleware: isProduction() ? middleware.concat([
    ]) : middleware.concat([
      logger
    ]),
    preloadedState: initState
  });

  return { store };
};
