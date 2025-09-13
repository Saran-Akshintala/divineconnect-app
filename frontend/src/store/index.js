import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import poojariSlice from './slices/poojariSlice';
import bookingSlice from './slices/bookingSlice';
import reviewSlice from './slices/reviewSlice';
import appSlice from './slices/appSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'], // Only persist auth and user data
};

const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  poojaris: poojariSlice,
  bookings: bookingSlice,
  reviews: reviewSlice,
  app: appSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
