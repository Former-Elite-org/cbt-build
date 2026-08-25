import { configureStore } from '@reduxjs/toolkit';

import { createLogger } from 'redux-logger';
import rootReducer from './reducers/index';
import { useDispatch } from 'react-redux';

const logger = createLogger();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true }).concat(logger),
});

export const useAppDispatch = () => useDispatch();

export default store;
