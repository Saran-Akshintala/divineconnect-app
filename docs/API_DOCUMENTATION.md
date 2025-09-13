# DivineConnect API Documentation

## Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://api.divineconnect.com/api/v1`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Authentication Endpoints

### POST /auth/login
Login with phone number and Firebase token.

**Request Body:**
```json
{
  "phone": "+919876543210",
  "firebaseToken": "firebase_id_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "User Name",
      "phone": "+919876543210",
      "role": "devotee|poojari",
      "verified": true
    },
    "token": "jwt_token"
  }
}
```

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "User Name",
  "phone": "+919876543210",
  "email": "user@example.com",
  "role": "devotee|poojari",
  "firebaseToken": "firebase_id_token"
}
```

### POST /auth/refresh
Refresh JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

### GET /auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

## Poojari Endpoints

### GET /poojaris
Get list of poojaris with filters.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 50)
- `city` (string): Filter by city
- `state` (string): Filter by state
- `language` (string): Filter by language
- `minRating` (float): Minimum rating (0-5)
- `maxPrice` (float): Maximum price per hour
- `specialization` (string): Filter by specialization
- `sortBy` (string): Sort field (rating, price, experience)
- `sortOrder` (string): Sort order (ASC, DESC)

**Response:**
```json
{
  "success": true,
  "data": {
    "poojaris": [
      {
        "id": "uuid",
        "name": "Poojari Name",
        "city": "City",
        "state": "State",
        "poojariProfile": {
          "rating": 4.5,
          "total_reviews": 25,
          "pricing_per_hour": 500,
          "languages": ["Hindi", "English"],
          "specializations": ["Ganesh Pooja", "Wedding"]
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

### GET /poojaris/featured
Get featured poojaris.

### GET /poojaris/:id
Get poojari profile by ID.

### GET /poojaris/:id/availability
Get poojari availability.

**Query Parameters:**
- `date` (string): Specific date (YYYY-MM-DD)
- `month` (integer): Month (1-12)
- `year` (integer): Year

### PUT /poojaris/profile
Update poojari profile (Poojari only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bio": "Profile description",
  "experienceYears": 10,
  "languages": ["Hindi", "English", "Sanskrit"],
  "specializations": ["Ganesh Pooja", "Wedding Ceremony"],
  "pricingPerHour": 500,
  "pricingPerService": 2000
}
```

## Booking Endpoints

### POST /bookings
Create a new booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "poojariId": "uuid",
  "serviceType": "Ganesh Pooja",
  "serviceDescription": "Monthly Ganesh Pooja at home",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "10:00",
  "durationHours": 2.0,
  "amount": 1000,
  "address": "Complete address",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "contactPhone": "+919876543210",
  "specialRequirements": "Need flowers and prasad",
  "materialsRequired": ["Flowers", "Incense", "Prasad"],
  "materialsProvidedBy": "devotee"
}
```

### GET /bookings
Get user bookings.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (string): Filter by status
- `page` (integer): Page number
- `limit` (integer): Items per page

### GET /bookings/:id
Get booking details by ID.

### PUT /bookings/:id/status
Update booking status.

**Request Body:**
```json
{
  "status": "confirmed|in_progress|completed|cancelled",
  "notes": "Optional notes"
}
```

### PUT /bookings/:id/cancel
Cancel a booking.

**Request Body:**
```json
{
  "reason": "Cancellation reason"
}
```

## Review Endpoints

### POST /reviews
Create a review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Excellent service",
  "serviceQuality": 5,
  "punctuality": 5,
  "communication": 5,
  "wouldRecommend": true
}
```

### PUT /reviews/:id
Update a review.

### DELETE /reviews/:id
Delete a review.

## Payment Endpoints

### POST /payments/create-order
Create Razorpay order.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bookingId": "uuid",
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_razorpay_id",
    "amount": 100000,
    "currency": "INR",
    "key": "rzp_test_key"
  }
}
```

### POST /payments/verify
Verify payment.

**Request Body:**
```json
{
  "razorpayOrderId": "order_id",
  "razorpayPaymentId": "payment_id",
  "razorpaySignature": "signature",
  "bookingId": "uuid"
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Validation Error | Request validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Rate Limiting
- 100 requests per 15 minutes per IP
- Higher limits for authenticated users
- Specific limits for payment endpoints

## Webhooks

### Razorpay Webhook
**Endpoint:** `/payments/webhook`
**Method:** POST
**Headers:** 
- `X-Razorpay-Signature`: Webhook signature

**Events:**
- `payment.captured`
- `payment.failed`
- `refund.processed`
