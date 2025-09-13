import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewAPI } from '../../services/api';

// Async thunks
export const createReview = createAsyncThunk(
  'reviews/create',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.createReview(reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Review creation failed');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.updateReview(id, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Review update failed');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reviewAPI.deleteReview(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Review deletion failed');
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addReview: (state, action) => {
      state.list.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload.review);
        state.error = null;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Review
      .addCase(updateReview.fulfilled, (state, action) => {
        const updatedReview = action.payload.review;
        const index = state.list.findIndex(review => review.id === updatedReview.id);
        if (index !== -1) {
          state.list[index] = updatedReview;
        }
      })
      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.list = state.list.filter(review => review.id !== deletedId);
      });
  },
});

export const { clearError, addReview } = reviewSlice.actions;
export default reviewSlice.reducer;
