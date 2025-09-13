# DivineConnect - Spiritual Services Marketplace

A comprehensive platform connecting devotees with verified Poojaris for authentic spiritual services and Pooja bookings.

## 🕉️ Overview

DivineConnect is a spiritual services marketplace that enables devotees to discover, connect with, and book verified Poojaris for various spiritual ceremonies and services. The platform ensures authentic spiritual experiences while providing convenience and transparency.

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo (Cross-platform mobile app)
- **Backend**: Node.js with Express.js (RESTful API)
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Firebase Auth (OTP-based login)
- **Payments**: Razorpay integration (Sandbox ready)
- **Notifications**: WhatsApp API (Mock service for development)
- **Infrastructure**: Docker Compose for local development

## 📁 Project Structure

```
divineconnect-app/
├── frontend/           # React Native (Expo) mobile app
├── backend/           # Node.js Express API server
├── docs/              # Documentation, wireframes, API specs
├── infra/             # Docker Compose and infrastructure
├── .gitignore         # Git ignore patterns
├── README.md          # This file
└── LICENSE            # Project license
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Docker & Docker Compose
- Expo CLI (`npm install -g @expo/cli`)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/divineconnect-app.git
   cd divineconnect-app
   ```

2. **Start the backend services**
   ```bash
   cd infra
   docker-compose up -d
   cd ../backend
   npm install
   cp .env.example .env
   # Configure your .env file with required credentials
   npm run dev
   ```

3. **Start the frontend app**
   ```bash
   cd frontend
   npm install
   npx expo start
   ```

## 🔧 Environment Configuration

Copy `.env.example` to `.env` in the backend directory and configure:

- Database connection (PostgreSQL)
- Firebase credentials
- Razorpay API keys
- JWT secret
- WhatsApp API credentials

## 📱 Key Features

### For Devotees
- 🔐 Secure OTP-based authentication
- 🔍 Search and filter Poojaris by location, language, and budget
- 👤 View detailed Poojari profiles with video introductions
- 📅 Real-time availability and booking system
- 💳 Secure payment processing
- ⭐ Review and rating system
- 📱 WhatsApp notifications for booking updates

### For Poojaris
- 📝 Comprehensive profile management
- 🎥 Video introduction uploads
- 📅 Availability calendar management
- 💰 Flexible pricing options
- 📊 Booking and earnings dashboard
- ⭐ Customer feedback and ratings

## 🗄️ Database Schema

### Core Entities
- **Users**: Devotees and Poojaris with role-based access
- **PoojariProfiles**: Extended profiles for service providers
- **Bookings**: Service booking management
- **Reviews**: Rating and feedback system
- **Transactions**: Payment tracking and history

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - OTP-based login
- `POST /api/auth/verify` - OTP verification
- `POST /api/auth/refresh` - Token refresh

### Poojaris
- `GET /api/poojaris` - List with filters
- `GET /api/poojaris/:id` - Profile details
- `GET /api/poojaris/:id/availability` - Calendar slots

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - User bookings
- `PUT /api/bookings/:id` - Update booking status

### Reviews
- `POST /api/reviews` - Add review
- `GET /api/reviews/:poojariId` - Poojari reviews

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with devotion for the spiritual community
- Inspired by the need for authentic spiritual services
- Dedicated to preserving and promoting spiritual traditions

---

**Made with 🕉️ for the spiritual community**
