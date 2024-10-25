import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import imageReducer from './containers/Image/reducer';
import { isNotProduction, isProduction } from './utils/mode';

export default ({ initState = {} } = {}) => {
  const middleware = getDefaultMiddleware({
    immutableCheck: true,
    serializableCheck: true,
    thunk: true,
  });

  const store = configureStore({
    devTools: isNotProduction(),
    middleware: isProduction() ? middleware.concat([]) : middleware.concat([logger]),
    preloadedState: initState,
    reducer: {
      imageReducer,
    },
  });

  return { store };
};
