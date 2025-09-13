import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api/v1' 
  : 'https://your-production-api.com/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.multiRemove(['authToken', 'user']);
      // You might want to dispatch a logout action here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (phone, firebaseToken) =>
    apiClient.post('/auth/login', { phone, firebaseToken }),
  
  register: (userData) =>
    apiClient.post('/auth/register', userData),
  
  refreshToken: () =>
    apiClient.post('/auth/refresh'),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getProfile: () =>
    apiClient.get('/auth/me'),
  
  updateProfile: (profileData) =>
    apiClient.put('/auth/profile', profileData),
};

// User API
export const userAPI = {
  getProfile: () =>
    apiClient.get('/users/profile'),
  
  updateProfile: (profileData) =>
    apiClient.put('/users/profile', profileData),
  
  uploadAvatar: (imageData) =>
    apiClient.post('/users/upload-avatar', imageData),
  
  updateFcmToken: (fcmToken) =>
    apiClient.put('/users/fcm-token', { fcmToken }),
};

// Poojari API
export const poojariAPI = {
  getPoojaris: (filters = {}) =>
    apiClient.get('/poojaris', { params: filters }),
  
  getFeaturedPoojaris: () =>
    apiClient.get('/poojaris/featured'),
  
  getPoojariById: (id) =>
    apiClient.get(`/poojaris/${id}`),
  
  getAvailability: (id, params = {}) =>
    apiClient.get(`/poojaris/${id}/availability`, { params }),
  
  updateProfile: (profileData) =>
    apiClient.put('/poojaris/profile', profileData),
  
  updateAvailability: (availabilityData) =>
    apiClient.put('/poojaris/availability', availabilityData),
  
  uploadVideo: (videoData) =>
    apiClient.post('/poojaris/upload-video', videoData),
  
  getReviews: (id, params = {}) =>
    apiClient.get(`/poojaris/${id}/reviews`, { params }),
};

// Booking API
export const bookingAPI = {
  createBooking: (bookingData) =>
    apiClient.post('/bookings', bookingData),
  
  getUserBookings: (filters = {}) =>
    apiClient.get('/bookings', { params: filters }),
  
  getBookingById: (id) =>
    apiClient.get(`/bookings/${id}`),
  
  updateBookingStatus: (id, statusData) =>
    apiClient.put(`/bookings/${id}/status`, statusData),
  
  cancelBooking: (id, cancelData) =>
    apiClient.put(`/bookings/${id}/cancel`, cancelData),
  
  getPoojariDashboard: () =>
    apiClient.get('/bookings/poojari/dashboard'),
};

// Review API
export const reviewAPI = {
  createReview: (reviewData) =>
    apiClient.post('/reviews', reviewData),
  
  getReviewById: (id) =>
    apiClient.get(`/reviews/${id}`),
  
  updateReview: (id, reviewData) =>
    apiClient.put(`/reviews/${id}`, reviewData),
  
  deleteReview: (id) =>
    apiClient.delete(`/reviews/${id}`),
};

// Payment API
export const paymentAPI = {
  createOrder: (orderData) =>
    apiClient.post('/payments/create-order', orderData),
  
  verifyPayment: (paymentData) =>
    apiClient.post('/payments/verify', paymentData),
  
  processRefund: (refundData) =>
    apiClient.post('/payments/refund', refundData),
};

export default apiClient;
