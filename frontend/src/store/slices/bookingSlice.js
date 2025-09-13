import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from '../../services/api';

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.createBooking(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking creation failed');
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUser',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getUserBookings(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBookingById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking details');
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updateBookingStatus(id, { status, notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Status update failed');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.cancelBooking(id, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking cancellation failed');
    }
  }
);

export const fetchPoojariDashboard = createAsyncThunk(
  'bookings/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getPoojariDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

const initialState = {
  list: [],
  selectedBooking: null,
  dashboard: null,
  loading: false,
  dashboardLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    updateBookingInList: (state, action) => {
      const updatedBooking = action.payload;
      const index = state.list.findIndex(booking => booking.id === updatedBooking.id);
      if (index !== -1) {
        state.list[index] = updatedBooking;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload.booking);
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.bookings;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Booking by ID
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload.booking;
        state.error = null;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Booking Status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const updatedBooking = action.payload.booking;
        if (state.selectedBooking && state.selectedBooking.id === updatedBooking.id) {
          state.selectedBooking = updatedBooking;
        }
        const index = state.list.findIndex(booking => booking.id === updatedBooking.id);
        if (index !== -1) {
          state.list[index] = updatedBooking;
        }
      })
      // Cancel Booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const updatedBooking = action.payload.booking;
        if (state.selectedBooking && state.selectedBooking.id === updatedBooking.id) {
          state.selectedBooking = updatedBooking;
        }
        const index = state.list.findIndex(booking => booking.id === updatedBooking.id);
        if (index !== -1) {
          state.list[index] = updatedBooking;
        }
      })
      // Fetch Dashboard
      .addCase(fetchPoojariDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchPoojariDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
        state.error = null;
      })
      .addCase(fetchPoojariDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedBooking, 
  clearSelectedBooking, 
  updateBookingInList 
} = bookingSlice.actions;
export default bookingSlice.reducer;
