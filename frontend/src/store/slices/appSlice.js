import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  networkStatus: 'online',
  notifications: [],
  theme: 'light',
  language: 'en',
  location: null,
  permissions: {
    location: false,
    camera: false,
    notifications: false,
  },
  onboarding: {
    completed: false,
    currentStep: 0,
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    updatePermission: (state, action) => {
      const { permission, granted } = action.payload;
      state.permissions[permission] = granted;
    },
    setOnboardingCompleted: (state) => {
      state.onboarding.completed = true;
    },
    setOnboardingStep: (state, action) => {
      state.onboarding.currentStep = action.payload;
    },
  },
});

export const {
  setLoading,
  setNetworkStatus,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  setLanguage,
  setLocation,
  updatePermission,
  setOnboardingCompleted,
  setOnboardingStep,
} = appSlice.actions;

export default appSlice.reducer;
