import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';

// Async thunks
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (imageData, { rejectWithValue }) => {
    try {
      const response = await userAPI.uploadAvatar(imageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Avatar upload failed');
    }
  }
);

export const updateFcmToken = createAsyncThunk(
  'user/updateFcmToken',
  async (fcmToken, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateFcmToken(fcmToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'FCM token update failed');
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
  uploadingAvatar: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (state.profile) {
        state.profile[field] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        if (state.profile) {
          state.profile.profileImage = action.payload.profileImage;
        }
        state.error = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload;
      })
      // Update FCM Token
      .addCase(updateFcmToken.fulfilled, (state) => {
        // FCM token updated successfully
      });
  },
});

export const { clearError, setProfile, updateProfileField } = userSlice.actions;
export default userSlice.reducer;
