# DivineConnect Database Schema

## Overview
DivineConnect uses PostgreSQL as the primary database with Sequelize ORM for Node.js integration.

## Database Configuration
- **Database**: PostgreSQL 15+
- **ORM**: Sequelize
- **Extensions**: uuid-ossp, postgis (for location data)

## Tables

### users
Core user table for both devotees and poojaris.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | Full name |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | Phone number with country code |
| email | VARCHAR(255) | UNIQUE | Email address (optional) |
| role | ENUM('devotee', 'poojari') | NOT NULL, DEFAULT 'devotee' | User role |
| verified | BOOLEAN | DEFAULT false | Phone verification status |
| firebase_uid | VARCHAR(255) | UNIQUE | Firebase authentication UID |
| profile_image | VARCHAR(500) | | Profile image URL |
| date_of_birth | DATE | | Date of birth |
| gender | ENUM('male', 'female', 'other') | | Gender |
| address | TEXT | | Full address |
| city | VARCHAR(100) | | City |
| state | VARCHAR(100) | | State |
| pincode | VARCHAR(10) | | Postal code |
| latitude | DECIMAL(10,8) | | GPS latitude |
| longitude | DECIMAL(11,8) | | GPS longitude |
| is_active | BOOLEAN | DEFAULT true | Account status |
| last_login | TIMESTAMP | | Last login time |
| fcm_token | VARCHAR(500) | | Firebase messaging token |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_phone` on phone
- `idx_users_role` on role
- `idx_users_location` on (city, state)

### poojari_profiles
Extended profile information for poojaris.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Profile identifier |
| user_id | UUID | FOREIGN KEY → users(id), UNIQUE | Reference to user |
| bio | TEXT | | Profile description |
| experience_years | INTEGER | CHECK (experience_years >= 0) | Years of experience |
| languages | TEXT[] | DEFAULT '{}' | Spoken languages |
| specializations | TEXT[] | DEFAULT '{}' | Service specializations |
| pricing_per_hour | DECIMAL(10,2) | CHECK (pricing_per_hour >= 0) | Hourly rate |
| pricing_per_service | DECIMAL(10,2) | CHECK (pricing_per_service >= 0) | Per-service rate |
| video_intro_url | VARCHAR(500) | | Video introduction URL |
| certificates | TEXT[] | DEFAULT '{}' | Certificate URLs |
| rating | DECIMAL(3,2) | DEFAULT 0.00, CHECK (rating >= 0 AND rating <= 5) | Average rating |
| total_reviews | INTEGER | DEFAULT 0 | Total review count |
| total_bookings | INTEGER | DEFAULT 0 | Total completed bookings |
| availability_schedule | JSONB | | Weekly availability schedule |
| blocked_dates | DATE[] | DEFAULT '{}' | Unavailable dates |
| is_verified | BOOLEAN | DEFAULT false | Verification status |
| verification_documents | TEXT[] | DEFAULT '{}' | Document URLs |
| bank_account_number | VARCHAR(50) | | Bank account number |
| bank_ifsc | VARCHAR(20) | | Bank IFSC code |
| bank_account_holder | VARCHAR(100) | | Account holder name |
| pan_number | VARCHAR(20) | | PAN number |
| is_available | BOOLEAN | DEFAULT true | Current availability |
| featured | BOOLEAN | DEFAULT false | Featured status |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:**
- `idx_poojari_profiles_rating` on rating
- `idx_poojari_profiles_verified` on is_verified
- `idx_poojari_profiles_featured` on featured

### bookings
Service booking records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Booking identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Devotee reference |
| poojari_id | UUID | FOREIGN KEY → users(id) | Poojari reference |
| service_type | VARCHAR(100) | NOT NULL | Type of service |
| service_description | TEXT | | Detailed description |
| scheduled_date | DATE | NOT NULL | Service date |
| scheduled_time | TIME | NOT NULL | Service time |
| duration_hours | DECIMAL(3,1) | NOT NULL, DEFAULT 1.0 | Duration in hours |
| status | ENUM | NOT NULL, DEFAULT 'pending' | Booking status |
| amount | DECIMAL(10,2) | NOT NULL, CHECK (amount >= 0) | Total amount |
| payment_status | ENUM | NOT NULL, DEFAULT 'pending' | Payment status |
| address | TEXT | NOT NULL | Service location |
| city | VARCHAR(100) | NOT NULL | City |
| state | VARCHAR(100) | NOT NULL | State |
| pincode | VARCHAR(10) | NOT NULL | Postal code |
| latitude | DECIMAL(10,8) | | GPS coordinates |
| longitude | DECIMAL(11,8) | | GPS coordinates |
| special_requirements | TEXT | | Special instructions |
| materials_required | TEXT[] | DEFAULT '{}' | Required materials |
| materials_provided_by | ENUM('devotee', 'poojari', 'both') | DEFAULT 'devotee' | Material provider |
| contact_phone | VARCHAR(20) | NOT NULL | Contact number |
| alternate_phone | VARCHAR(20) | | Alternate contact |
| booking_notes | TEXT | | User notes |
| poojari_notes | TEXT | | Poojari notes |
| cancellation_reason | TEXT | | Cancellation reason |
| cancelled_by | ENUM('user', 'poojari', 'admin') | | Who cancelled |
| cancelled_at | TIMESTAMP | | Cancellation time |
| confirmed_at | TIMESTAMP | | Confirmation time |
| completed_at | TIMESTAMP | | Completion time |
| reminder_sent | BOOLEAN | DEFAULT false | Reminder status |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Indexes:**
- `idx_bookings_user` on user_id
- `idx_bookings_poojari` on poojari_id
- `idx_bookings_status` on status
- `idx_bookings_date` on scheduled_date

### reviews
User reviews and ratings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Review identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Reviewer reference |
| poojari_id | UUID | FOREIGN KEY → users(id) | Poojari reference |
| booking_id | UUID | FOREIGN KEY → bookings(id) | Booking reference |
| rating | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Overall rating |
| comment | TEXT | | Review comment |
| service_quality | INTEGER | CHECK (service_quality >= 1 AND service_quality <= 5) | Service quality rating |
| punctuality | INTEGER | CHECK (punctuality >= 1 AND punctuality <= 5) | Punctuality rating |
| communication | INTEGER | CHECK (communication >= 1 AND communication <= 5) | Communication rating |
| would_recommend | BOOLEAN | DEFAULT true | Recommendation status |
| is_verified | BOOLEAN | DEFAULT false | Verification status |
| helpful_count | INTEGER | DEFAULT 0 | Helpful votes |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Constraints:**
- UNIQUE(user_id, booking_id) - One review per booking per user

### transactions
Payment transaction records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Transaction identifier |
| booking_id | UUID | FOREIGN KEY → bookings(id) | Booking reference |
| amount | DECIMAL(10,2) | NOT NULL, CHECK (amount >= 0) | Transaction amount |
| currency | VARCHAR(10) | DEFAULT 'INR' | Currency code |
| provider | ENUM | DEFAULT 'razorpay' | Payment provider |
| provider_transaction_id | VARCHAR(100) | | Provider transaction ID |
| provider_order_id | VARCHAR(100) | | Provider order ID |
| provider_payment_id | VARCHAR(100) | | Provider payment ID |
| status | ENUM | DEFAULT 'pending' | Transaction status |
| transaction_type | ENUM | DEFAULT 'payment' | Transaction type |
| gateway_response | JSONB | | Gateway response data |
| failure_reason | VARCHAR(500) | | Failure reason |
| processed_at | TIMESTAMP | | Processing time |
| refunded_at | TIMESTAMP | | Refund time |
| refund_amount | DECIMAL(10,2) | | Refunded amount |
| platform_fee | DECIMAL(10,2) | DEFAULT 0.00 | Platform fee |
| gateway_fee | DECIMAL(10,2) | DEFAULT 0.00 | Gateway fee |
| net_amount | DECIMAL(10,2) | | Net amount to poojari |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

## Relationships

### One-to-One
- users ↔ poojari_profiles (user_id)

### One-to-Many
- users → bookings (as user)
- users → bookings (as poojari)
- users → reviews (as reviewer)
- users → reviews (as reviewed poojari)
- bookings → transactions
- bookings → reviews

## Enums

### user_role
- `devotee`: Service seeker
- `poojari`: Service provider

### booking_status
- `pending`: Awaiting confirmation
- `confirmed`: Confirmed by poojari
- `in_progress`: Service in progress
- `completed`: Service completed
- `cancelled`: Booking cancelled
- `refunded`: Payment refunded

### payment_status
- `pending`: Payment not made
- `paid`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded

### transaction_status
- `pending`: Transaction initiated
- `processing`: Being processed
- `completed`: Successfully completed
- `failed`: Transaction failed
- `cancelled`: Transaction cancelled
- `refunded`: Amount refunded

## Sample Queries

### Get top-rated poojaris in a city
```sql
SELECT u.name, u.city, pp.rating, pp.total_reviews
FROM users u
JOIN poojari_profiles pp ON u.id = pp.user_id
WHERE u.city = 'Mumbai' AND u.role = 'poojari'
ORDER BY pp.rating DESC, pp.total_reviews DESC
LIMIT 10;
```

### Get booking statistics for a poojari
```sql
SELECT 
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
  AVG(amount) as avg_booking_amount
FROM bookings 
WHERE poojari_id = 'poojari_uuid';
```

### Get monthly revenue for a poojari
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(net_amount) as revenue
FROM transactions t
JOIN bookings b ON t.booking_id = b.id
WHERE b.poojari_id = 'poojari_uuid' 
  AND t.status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```
