# DivineConnect Deployment Guide

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **PostgreSQL**: 15.x or higher
- **Docker**: 20.x or higher (for containerized deployment)
- **Redis**: 7.x or higher (optional, for caching)

### Required Accounts & Services
- **Firebase**: For authentication
- **Razorpay**: For payment processing
- **WhatsApp Business API**: For notifications (optional)
- **Cloud Storage**: AWS S3/Google Cloud Storage (for file uploads)

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/divineconnect-app.git
cd divineconnect-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with required credentials
npm run dev
```

### 3. Database Setup
```bash
# Using Docker
cd infra
docker-compose up -d postgres

# Or install PostgreSQL locally and create database
createdb divineconnect_db
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

### 5. Full Docker Setup
```bash
cd infra
docker-compose up -d
```

## Environment Configuration

### Backend (.env)
```bash
# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=divineconnect_db
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_256_bits_minimum
JWT_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

# Razorpay
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# WhatsApp (Optional)
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_API_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=divineconnect-uploads

# CORS
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

## Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Server Setup (Ubuntu 20.04+)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Database Setup
```bash
sudo -u postgres createuser --createdb --pwprompt divineconnect
sudo -u postgres createdb -O divineconnect divineconnect_db
```

#### 3. Application Deployment
```bash
# Clone and setup application
git clone https://github.com/your-username/divineconnect-app.git
cd divineconnect-app/backend
npm ci --production
cp .env.example .env
# Configure production environment variables

# Run database migrations
npm run db:migrate

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/divineconnect
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. SSL Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Docker Deployment

#### 1. Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
    restart: unless-stopped
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: divineconnect_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 2. Deploy with Docker
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend npm run db:migrate

# Check logs
docker-compose logs -f backend
```

### Option 3: Cloud Platform Deployment

#### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create divineconnect-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
# ... set all other environment variables

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run npm run db:migrate
```

#### AWS ECS Deployment
1. Create ECR repository
2. Build and push Docker image
3. Create ECS cluster and service
4. Configure RDS PostgreSQL instance
5. Set up Application Load Balancer
6. Configure Route 53 for domain

#### Google Cloud Run Deployment
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/divineconnect-backend
gcloud run deploy --image gcr.io/PROJECT_ID/divineconnect-backend --platform managed
```

## Mobile App Deployment

### Expo/EAS Build

#### 1. Setup EAS
```bash
cd frontend
npm install -g @expo/cli
npm install -g eas-cli
eas login
eas build:configure
```

#### 2. Configure app.json
```json
{
  "expo": {
    "name": "DivineConnect",
    "slug": "divineconnect-app",
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

#### 3. Build for Android
```bash
eas build --platform android
```

#### 4. Build for iOS
```bash
eas build --platform ios
```

#### 5. Submit to Stores
```bash
# Android Play Store
eas submit --platform android

# iOS App Store
eas submit --platform ios
```

## Monitoring & Maintenance

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs

# Restart application
pm2 restart all
```

### 2. Database Maintenance
```bash
# Backup database
pg_dump divineconnect_db > backup_$(date +%Y%m%d).sql

# Restore database
psql divineconnect_db < backup_20240115.sql

# Monitor database performance
SELECT * FROM pg_stat_activity;
```

### 3. Health Checks
```bash
# API health check
curl https://api.yourdomain.com/health

# Database connection check
curl https://api.yourdomain.com/api/v1/auth/me
```

### 4. Log Management
```bash
# Rotate logs with logrotate
sudo nano /etc/logrotate.d/divineconnect

# Content:
/var/log/divineconnect/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload all
    endscript
}
```

## Security Checklist

### Backend Security
- [ ] Environment variables properly configured
- [ ] JWT secret is strong and secure
- [ ] Database credentials are secure
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] HTTPS is enforced

### Database Security
- [ ] Database user has minimal required permissions
- [ ] Database is not publicly accessible
- [ ] Regular backups are configured
- [ ] Connection is encrypted (SSL)

### Infrastructure Security
- [ ] Firewall is properly configured
- [ ] SSH keys are used (no password auth)
- [ ] Regular security updates
- [ ] Monitoring and alerting setup
- [ ] SSL certificates are valid

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U divineconnect -d divineconnect_db

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### Application Won't Start
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs divineconnect-backend

# Restart application
pm2 restart divineconnect-backend
```

#### High Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart if needed
pm2 restart all
```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_bookings_date_status 
ON bookings(scheduled_date, status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE city = 'Mumbai';
```

#### Application Optimization
- Enable Redis caching
- Implement database connection pooling
- Use CDN for static assets
- Enable gzip compression
- Implement API response caching

## Backup Strategy

### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="divineconnect_db"

# Database backup
pg_dump $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
```

### Cron Job Setup
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```
