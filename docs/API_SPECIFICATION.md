# DivineConnect API Specification

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.divineconnect.com/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "errors": array (optional)
}
```

---

## Authentication APIs

### 1. Send OTP
**POST** `/auth/login`

Send OTP to user's phone number for authentication.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otpSent": true,
    "expiresIn": 300
  }
}
```

### 2. Verify OTP & Login/Register
**POST** `/auth/verify`

Verify OTP and login existing user or register new user.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "phone": "+919876543210",
      "role": "devotee",
      "isActive": true
    }
  }
}
```

### 3. Get User Profile
**GET** `/auth/profile` 🔒

Get current user's profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "phone": "+919876543210",
      "email": "john@example.com",
      "role": "devotee",
      "profileImage": null,
      "address": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  }
}
```

### 4. Update User Profile
**PUT** `/auth/profile` 🔒

Update current user's profile information.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

---

## Poojari APIs

### 1. Get All Poojaris
**GET** `/poojaris`

Get list of all poojaris with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `city` (string): Filter by city
- `state` (string): Filter by state
- `language` (string): Filter by language
- `minRating` (number): Minimum rating filter
- `maxPrice` (number): Maximum price filter
- `specialization` (string): Filter by specialization
- `sortBy` (string): Sort by 'rating', 'price', or 'experience'
- `sortOrder` (string): 'asc' or 'desc'

**Response:**
```json
{
  "success": true,
  "data": {
    "poojaris": [
      {
        "id": 1,
        "userId": 1,
        "bio": "Experienced Poojari with 15+ years in traditional ceremonies",
        "experienceYears": 15,
        "languages": ["Hindi", "Sanskrit", "English"],
        "specializations": ["Ganesh Pooja", "Satyanarayan Katha"],
        "pricingPerHour": 1500,
        "pricingPerService": 2500,
        "averageRating": 4.8,
        "totalReviews": 127,
        "city": "Mumbai",
        "state": "Maharashtra",
        "user": {
          "id": 1,
          "name": "Pandit Rajesh Sharma",
          "phone": "+919876543210",
          "profileImage": null
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### 2. Get Featured Poojaris
**GET** `/poojaris/featured`

Get list of featured poojaris.

**Response:**
```json
{
  "success": true,
  "data": {
    "poojaris": [
      {
        "id": 1,
        "userId": 1,
        "bio": "Experienced Poojari...",
        "averageRating": 4.8,
        "totalReviews": 127,
        "user": {
          "name": "Pandit Rajesh Sharma"
        }
      }
    ]
  }
}
```

### 3. Get Poojari by ID
**GET** `/poojaris/:id`

Get detailed information about a specific poojari.

**Response:**
```json
{
  "success": true,
  "data": {
    "poojari": {
      "id": 1,
      "userId": 1,
      "bio": "Experienced Poojari with 15+ years...",
      "experienceYears": 15,
      "languages": ["Hindi", "Sanskrit", "English"],
      "specializations": ["Ganesh Pooja", "Satyanarayan Katha"],
      "pricingPerHour": 1500,
      "pricingPerService": 2500,
      "averageRating": 4.8,
      "totalReviews": 127,
      "city": "Mumbai",
      "state": "Maharashtra",
      "user": {
        "id": 1,
        "name": "Pandit Rajesh Sharma",
        "phone": "+919876543210",
        "profileImage": null
      }
    }
  }
}
```

### 4. Get Poojari Availability
**GET** `/poojaris/:id/availability`

Get availability slots for a specific poojari.

**Query Parameters:**
- `date` (string): Specific date (YYYY-MM-DD)
- `month` (string): Specific month (YYYY-MM)
- `year` (string): Specific year (YYYY)

**Response:**
```json
{
  "success": true,
  "data": {
    "availability": [
      {
        "date": "2024-01-15",
        "startTime": "09:00",
        "endTime": "12:00",
        "isAvailable": true
      }
    ]
  }
}
```

### 5. Get Poojari Reviews
**GET** `/poojaris/:id/reviews`

Get reviews for a specific poojari.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellent service, very knowledgeable",
        "serviceQuality": 5,
        "punctuality": 5,
        "communication": 5,
        "wouldRecommend": true,
        "createdAt": "2024-01-10T10:00:00Z",
        "user": {
          "name": "John Doe",
          "profileImage": null
        }
      }
    ]
  }
}
```

---

## Booking APIs

### 1. Create Booking
**POST** `/bookings` 🔒

Create a new booking.

**Request Body:**
```json
{
  "poojariId": 1,
  "serviceType": "Ganesh Pooja",
  "serviceDescription": "Traditional Ganesh Pooja for home",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "10:00",
  "durationHours": 2,
  "amount": 3000,
  "address": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "contactPhone": "+919876543210",
  "alternatePhone": "+919876543211",
  "specialRequirements": "Need to complete before 12 PM",
  "materialsRequired": ["Flowers", "Fruits", "Sweets"],
  "materialsProvidedBy": "devotee",
  "bookingNotes": "First time booking"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": 1,
      "userId": 1,
      "poojariId": 1,
      "serviceType": "Ganesh Pooja",
      "scheduledDate": "2024-01-15",
      "scheduledTime": "10:00",
      "amount": 3000,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  }
}
```

### 2. Get User Bookings
**GET** `/bookings` 🔒

Get all bookings for the current user.

**Query Parameters:**
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": 1,
        "serviceType": "Ganesh Pooja",
        "scheduledDate": "2024-01-15",
        "scheduledTime": "10:00",
        "amount": 3000,
        "status": "confirmed",
        "paymentStatus": "paid",
        "poojari": {
          "name": "Pandit Rajesh Sharma",
          "phone": "+919876543210"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

### 3. Get Booking Details
**GET** `/bookings/:id` 🔒

Get detailed information about a specific booking.

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": 1,
      "serviceType": "Ganesh Pooja",
      "serviceDescription": "Traditional Ganesh Pooja for home",
      "scheduledDate": "2024-01-15",
      "scheduledTime": "10:00",
      "durationHours": 2,
      "amount": 3000,
      "status": "confirmed",
      "paymentStatus": "paid",
      "address": "123 Main Street",
      "city": "Mumbai",
      "user": {
        "name": "John Doe",
        "phone": "+919876543210"
      },
      "poojari": {
        "name": "Pandit Rajesh Sharma",
        "phone": "+919876543210"
      },
      "transactions": [],
      "review": null
    }
  }
}
```

### 4. Update Booking Status
**PUT** `/bookings/:id/status` 🔒

Update booking status (for poojaris).

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Confirmed for the requested time"
}
```

### 5. Cancel Booking
**PUT** `/bookings/:id/cancel` 🔒

Cancel a booking.

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

---

## Payment APIs

### 1. Create Payment Order
**POST** `/payments/create-order` 🔒

Create a Razorpay payment order.

**Request Body:**
```json
{
  "bookingId": 1,
  "amount": 3000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_razorpay_id",
    "amount": 300000,
    "currency": "INR",
    "key": "rzp_test_key"
  }
}
```

### 2. Verify Payment
**POST** `/payments/verify` 🔒

Verify payment after successful transaction.

**Request Body:**
```json
{
  "razorpayOrderId": "order_razorpay_id",
  "razorpayPaymentId": "pay_razorpay_id",
  "razorpaySignature": "signature_hash",
  "bookingId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "bookingId": 1,
    "paymentStatus": "completed"
  }
}
```

### 3. Process Refund
**POST** `/payments/refund` 🔒

Process refund for a transaction.

**Request Body:**
```json
{
  "transactionId": 1,
  "amount": 3000,
  "reason": "Service cancelled"
}
```

---

## Review APIs

### 1. Create Review
**POST** `/reviews` 🔒

Create a review for a completed booking.

**Request Body:**
```json
{
  "bookingId": 1,
  "rating": 5,
  "comment": "Excellent service, very professional",
  "serviceQuality": 5,
  "punctuality": 5,
  "communication": 5,
  "wouldRecommend": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "id": 1,
      "bookingId": 1,
      "rating": 5,
      "comment": "Excellent service, very professional",
      "serviceQuality": 5,
      "punctuality": 5,
      "communication": 5,
      "wouldRecommend": true,
      "createdAt": "2024-01-20T10:00:00Z",
      "user": {
        "name": "John Doe"
      }
    }
  }
}
```

### 2. Get Review by ID
**GET** `/reviews/:id`

Get detailed information about a specific review.

### 3. Update Review
**PUT** `/reviews/:id` 🔒

Update an existing review (only by review author).

### 4. Delete Review
**DELETE** `/reviews/:id` 🔒

Delete a review (only by review author).

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Validation Error | Request validation failed |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

- **General APIs**: 100 requests per minute per IP
- **Authentication APIs**: 10 requests per minute per IP
- **Payment APIs**: 20 requests per minute per user

---

## Development Notes

### Mock Data in Development
In development mode (`NODE_ENV=development`), the following APIs return mock data:
- All Poojari APIs return predefined sample data
- Authentication uses fixed OTP: `123456`
- Payment integration uses Razorpay test mode
- Database operations are mocked to avoid connection requirements

### Environment Variables Required
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=divineconnect
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Firebase (for OTP)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Testing the APIs

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test authentication:**
   ```bash
   # Send OTP
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "+919876543210"}'
   
   # Verify OTP (use 123456 in development)
   curl -X POST http://localhost:3000/api/v1/auth/verify \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "+919876543210", "otp": "123456"}'
   ```

3. **Test poojari listing:**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/poojaris?city=Mumbai&minRating=4"
   ```

4. **Test booking creation:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/bookings \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"poojariId": 1, "serviceType": "Ganesh Pooja", ...}'
   ```
