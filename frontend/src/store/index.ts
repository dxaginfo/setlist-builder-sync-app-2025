import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import setlistReducer from '../features/setlists/setlistsSlice';
import songsReducer from '../features/songs/songsSlice';
import bandsReducer from '../features/bands/bandsSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    setlists: setlistReducer,
    songs: songsReducer,
    bands: bandsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['auth/loginSuccess', 'auth/registerSuccess', 'auth/checkAuthSuccess'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;