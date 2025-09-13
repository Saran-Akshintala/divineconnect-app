import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { poojariAPI } from '../../services/api';

// Async thunks
export const fetchPoojaris = createAsyncThunk(
  'poojaris/fetchPoojaris',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await poojariAPI.getPoojaris(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch poojaris');
    }
  }
);

export const fetchFeaturedPoojaris = createAsyncThunk(
  'poojaris/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await poojariAPI.getFeaturedPoojaris();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured poojaris');
    }
  }
);

export const fetchPoojariById = createAsyncThunk(
  'poojaris/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await poojariAPI.getPoojariById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch poojari details');
    }
  }
);

export const fetchAvailability = createAsyncThunk(
  'poojaris/fetchAvailability',
  async ({ id, date, month, year }, { rejectWithValue }) => {
    try {
      const response = await poojariAPI.getAvailability(id, { date, month, year });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch availability');
    }
  }
);

export const updatePoojariProfile = createAsyncThunk(
  'poojaris/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await poojariAPI.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'poojaris/updateAvailability',
  async (availabilityData, { rejectWithValue }) => {
    try {
      const response = await poojariAPI.updateAvailability(availabilityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Availability update failed');
    }
  }
);

const initialState = {
  list: [],
  featured: [],
  selectedPoojari: null,
  availability: null,
  loading: false,
  featuredLoading: false,
  availabilityLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    city: '',
    state: '',
    language: '',
    minRating: 0,
    maxPrice: null,
    specialization: '',
    sortBy: 'rating',
    sortOrder: 'DESC'
  }
};

const poojariSlice = createSlice({
  name: 'poojaris',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedPoojari: (state, action) => {
      state.selectedPoojari = action.payload;
    },
    clearSelectedPoojari: (state) => {
      state.selectedPoojari = null;
      state.availability = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Poojaris
      .addCase(fetchPoojaris.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoojaris.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.poojaris;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPoojaris.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Featured
      .addCase(fetchFeaturedPoojaris.pending, (state) => {
        state.featuredLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedPoojaris.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featured = action.payload.poojaris;
        state.error = null;
      })
      .addCase(fetchFeaturedPoojaris.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchPoojariById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoojariById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPoojari = action.payload.poojari;
        state.error = null;
      })
      .addCase(fetchPoojariById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Availability
      .addCase(fetchAvailability.pending, (state) => {
        state.availabilityLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.availabilityLoading = false;
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.availabilityLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updatePoojariProfile.fulfilled, (state, action) => {
        if (state.selectedPoojari) {
          state.selectedPoojari = action.payload.poojari;
        }
      })
      // Update Availability
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.availability = {
          ...state.availability,
          ...action.payload
        };
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setSelectedPoojari, 
  clearSelectedPoojari 
} = poojariSlice.actions;
export default poojariSlice.reducer;
