-- Initialize DivineConnect Database
-- This script sets up the initial database structure and seed data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE user_role AS ENUM ('devotee', 'poojari');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'partial_refund');
CREATE TYPE payment_provider AS ENUM ('razorpay', 'paytm', 'phonepe', 'gpay', 'cash');
CREATE TYPE materials_provider AS ENUM ('devotee', 'poojari', 'both');
CREATE TYPE cancelled_by AS ENUM ('user', 'poojari', 'admin');

-- Insert seed data for development
INSERT INTO users (id, name, phone, email, role, verified, created_at, updated_at) VALUES
  (uuid_generate_v4(), 'John Devotee', '+919876543210', 'john@example.com', 'devotee', true, NOW(), NOW()),
  (uuid_generate_v4(), 'Pandit Sharma', '+919876543211', 'sharma@example.com', 'poojari', true, NOW(), NOW()),
  (uuid_generate_v4(), 'Pandit Kumar', '+919876543212', 'kumar@example.com', 'poojari', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(city, state);
CREATE INDEX IF NOT EXISTS idx_poojari_profiles_rating ON poojari_profiles(rating);
CREATE INDEX IF NOT EXISTS idx_poojari_profiles_verified ON poojari_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
