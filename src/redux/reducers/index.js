import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth'; // Example reducer
// import themeSettingSlice from '../../core/data/redux/themeSettingSlice';
// import sidebarSlice from '../../core/data/redux/sidebarSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  // themeSetting: themeSettingSlice,
  // sidebarSlice: sidebarSlice
});

export default rootReducer;
