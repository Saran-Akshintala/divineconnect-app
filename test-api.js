#!/usr/bin/env node

/**
 * DivineConnect API Test Script
 * Tests the complete user flow from authentication to booking and reviews
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let testBookingId = '';

// Test data
const testUser = {
  phoneNumber: '+919876543210',
  otp: '123456'
};

const testBooking = {
  poojariId: 1,
  serviceType: 'Ganesh Pooja',
  serviceDescription: 'Traditional Ganesh Pooja for home',
  scheduledDate: '2024-02-15',
  scheduledTime: '10:00',
  durationHours: 2,
  amount: 3000,
  address: '123 Test Street, Apartment 4B',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  contactPhone: '+919876543210',
  materialsProvidedBy: 'devotee',
  materialsRequired: ['Flowers', 'Fruits']
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (useAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API Error [${method} ${endpoint}]:`, error.response?.data || error.message);
    throw error;
  }
}

// Test functions
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Flow...');
  
  // Step 1: Send OTP
  console.log('📱 Sending OTP...');
  const otpResponse = await apiCall('POST', '/auth/login', {
    phoneNumber: testUser.phoneNumber
  });
  console.log('✅ OTP sent successfully');

  // Step 2: Verify OTP and get token
  console.log('🔑 Verifying OTP...');
  const verifyResponse = await apiCall('POST', '/auth/verify', {
    phoneNumber: testUser.phoneNumber,
    otp: testUser.otp
  });
  
  authToken = verifyResponse.data.token;
  console.log('✅ Authentication successful, token received');
  
  // Step 3: Get user profile
  console.log('👤 Getting user profile...');
  const profileResponse = await apiCall('GET', '/auth/profile', null, true);
  console.log('✅ User profile retrieved:', profileResponse.data.user.name);
}

async function testPoojariAPIs() {
  console.log('\n🕉️  Testing Poojari APIs...');
  
  // Test 1: Get all poojaris
  console.log('📋 Getting all poojaris...');
  const allPoojaris = await apiCall('GET', '/poojaris');
  console.log(`✅ Found ${allPoojaris.data.poojaris.length} poojaris`);
  
  // Test 2: Get featured poojaris
  console.log('⭐ Getting featured poojaris...');
  const featuredPoojaris = await apiCall('GET', '/poojaris/featured');
  console.log(`✅ Found ${featuredPoojaris.data.poojaris.length} featured poojaris`);
  
  // Test 3: Get poojari by ID
  console.log('🔍 Getting poojari details...');
  const poojariDetails = await apiCall('GET', '/poojaris/1');
  console.log('✅ Poojari details retrieved:', poojariDetails.data.poojari.user.name);
  
  // Test 4: Search with filters
  console.log('🔎 Testing search filters...');
  const filteredPoojaris = await apiCall('GET', '/poojaris?city=Mumbai&minRating=4&language=Hindi');
  console.log(`✅ Filtered search returned ${filteredPoojaris.data.poojaris.length} results`);
  
  // Test 5: Get poojari availability
  console.log('📅 Getting poojari availability...');
  const availability = await apiCall('GET', '/poojaris/1/availability');
  console.log('✅ Availability retrieved');
  
  // Test 6: Get poojari reviews
  console.log('⭐ Getting poojari reviews...');
  const reviews = await apiCall('GET', '/poojaris/1/reviews');
  console.log('✅ Reviews retrieved');
}

async function testBookingFlow() {
  console.log('\n📅 Testing Booking Flow...');
  
  // Step 1: Create booking
  console.log('📝 Creating booking...');
  const bookingResponse = await apiCall('POST', '/bookings', testBooking, true);
  testBookingId = bookingResponse.data.booking.id;
  console.log(`✅ Booking created with ID: ${testBookingId}`);
  
  // Step 2: Get user bookings
  console.log('📋 Getting user bookings...');
  const userBookings = await apiCall('GET', '/bookings', null, true);
  console.log(`✅ Found ${userBookings.data.bookings.length} bookings`);
  
  // Step 3: Get booking details
  console.log('🔍 Getting booking details...');
  const bookingDetails = await apiCall('GET', `/bookings/${testBookingId}`, null, true);
  console.log('✅ Booking details retrieved');
  
  // Step 4: Update booking status (simulate poojari confirming)
  console.log('✅ Updating booking status...');
  const statusUpdate = await apiCall('PUT', `/bookings/${testBookingId}/status`, {
    status: 'confirmed',
    notes: 'Confirmed for the requested time'
  }, true);
  console.log('✅ Booking status updated to confirmed');
}

async function testPaymentFlow() {
  console.log('\n💳 Testing Payment Flow...');
  
  // Step 1: Create payment order
  console.log('💰 Creating payment order...');
  const paymentOrder = await apiCall('POST', '/payments/create-order', {
    bookingId: testBookingId,
    amount: testBooking.amount
  }, true);
  console.log('✅ Payment order created:', paymentOrder.data.orderId);
  
  // Note: In a real scenario, you would integrate with Razorpay SDK here
  console.log('ℹ️  Payment verification would happen after Razorpay integration');
}

async function testReviewFlow() {
  console.log('\n⭐ Testing Review Flow...');
  
  // First, simulate booking completion
  console.log('✅ Simulating booking completion...');
  await apiCall('PUT', `/bookings/${testBookingId}/status`, {
    status: 'completed'
  }, true);
  
  // Step 1: Create review
  console.log('📝 Creating review...');
  const reviewResponse = await apiCall('POST', '/reviews', {
    bookingId: testBookingId,
    rating: 5,
    comment: 'Excellent service! Very professional and knowledgeable.',
    serviceQuality: 5,
    punctuality: 5,
    communication: 5,
    wouldRecommend: true
  }, true);
  console.log('✅ Review created successfully');
  
  // Step 2: Get review details
  const reviewId = reviewResponse.data.review.id;
  console.log('🔍 Getting review details...');
  const reviewDetails = await apiCall('GET', `/reviews/${reviewId}`);
  console.log('✅ Review details retrieved');
}

async function runAllTests() {
  console.log('🚀 Starting DivineConnect API Tests...');
  console.log('=' .repeat(50));
  
  try {
    // Check if server is running
    console.log('🔍 Checking server status...');
    await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    console.log('✅ Server is running');
    
    // Run all test suites
    await testAuthentication();
    await testPoojariAPIs();
    await testBookingFlow();
    await testPaymentFlow();
    await testReviewFlow();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Authentication Flow - PASSED');
    console.log('✅ Poojari APIs - PASSED');
    console.log('✅ Booking Flow - PASSED');
    console.log('✅ Payment Flow - PASSED');
    console.log('✅ Review Flow - PASSED');
    
  } catch (error) {
    console.log('\n' + '=' .repeat(50));
    console.log('❌ Tests failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testAuthentication,
  testPoojariAPIs,
  testBookingFlow,
  testPaymentFlow,
  testReviewFlow
};
