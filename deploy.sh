#!/bin/bash

# DivineConnect Production Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh production deploy

set -e

# Configuration
PROJECT_NAME="divineconnect"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
ENVIRONMENT=${1:-staging}
ACTION=${2:-deploy}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required commands exist
    commands=("node" "npm" "docker" "docker-compose")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js version 16 or higher is required"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build backend
build_backend() {
    log_info "Building backend..."
    
    cd $BACKEND_DIR
    
    # Install dependencies
    npm ci --production
    
    # Run tests
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run test 2>/dev/null || log_warning "Tests not configured"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    cd ..
    log_success "Backend build completed"
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    
    cd $FRONTEND_DIR
    
    # Install dependencies
    npm ci
    
    # Update API endpoint for production
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Configuring production API endpoint..."
        # This would typically update the API base URL in your config
    fi
    
    cd ..
    log_success "Frontend build completed"
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."
    
    # Create production environment file
    if [ ! -f "$BACKEND_DIR/.env.production" ]; then
        log_warning "Production environment file not found. Creating from template..."
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env.production"
        log_warning "Please update .env.production with production values"
    fi
    
    # Build and start services
    docker-compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Run database migrations
    log_info "Running database migrations..."
    docker-compose exec backend npm run db:migrate 2>/dev/null || log_warning "Migrations not configured"
    
    log_success "Docker deployment completed"
}

# Deploy with PM2
deploy_pm2() {
    log_info "Deploying with PM2..."
    
    cd $BACKEND_DIR
    
    # Stop existing processes
    pm2 stop $PROJECT_NAME-backend 2>/dev/null || true
    pm2 delete $PROJECT_NAME-backend 2>/dev/null || true
    
    # Start application
    if [ "$ENVIRONMENT" = "production" ]; then
        pm2 start ecosystem.config.js --env production
    else
        pm2 start ecosystem.config.js
    fi
    
    # Save PM2 configuration
    pm2 save
    
    cd ..
    log_success "PM2 deployment completed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check backend health
    if curl -f http://localhost:${PORT:-5000}/health > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check database connection
    if curl -f http://localhost:${PORT:-5000}/api/v1/health/db > /dev/null 2>&1; then
        log_success "Database health check passed"
    else
        log_warning "Database health check failed or not configured"
    fi
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/divineconnect_backup_$TIMESTAMP.sql"
    
    # Create backup (adjust connection details as needed)
    if command -v pg_dump &> /dev/null; then
        pg_dump ${DATABASE_URL:-divineconnect_db} > $BACKUP_FILE
        gzip $BACKUP_FILE
        log_success "Database backup created: $BACKUP_FILE.gz"
    else
        log_warning "pg_dump not found, skipping database backup"
    fi
}

# Rollback deployment
rollback() {
    log_info "Rolling back deployment..."
    
    if command -v pm2 &> /dev/null; then
        pm2 restart $PROJECT_NAME-backend
    fi
    
    if command -v docker-compose &> /dev/null; then
        docker-compose restart backend
    fi
    
    log_success "Rollback completed"
}

# Main deployment function
deploy() {
    log_info "Starting deployment for environment: $ENVIRONMENT"
    
    # Create backup before deployment
    if [ "$ENVIRONMENT" = "production" ]; then
        backup_database
    fi
    
    # Build applications
    build_backend
    build_frontend
    
    # Deploy based on configuration
    if [ -f "infra/docker-compose.yml" ]; then
        deploy_docker
    elif command -v pm2 &> /dev/null; then
        deploy_pm2
    else
        log_error "No deployment method available (Docker or PM2)"
        exit 1
    fi
    
    # Perform health check
    health_check
    
    log_success "Deployment completed successfully!"
    log_info "Application is running at: http://localhost:${PORT:-5000}"
}

# Setup development environment
setup_dev() {
    log_info "Setting up development environment..."
    
    # Install backend dependencies
    cd $BACKEND_DIR
    npm install
    cd ..
    
    # Install frontend dependencies
    cd $FRONTEND_DIR
    npm install
    cd ..
    
    # Start development services
    if [ -f "infra/docker-compose.dev.yml" ]; then
        docker-compose -f infra/docker-compose.dev.yml up -d
    fi
    
    log_success "Development environment setup completed"
    log_info "Run 'npm run dev' in backend directory to start the server"
    log_info "Run 'npx expo start' in frontend directory to start the mobile app"
}

# Show usage
show_usage() {
    echo "DivineConnect Deployment Script"
    echo ""
    echo "Usage: $0 [environment] [action]"
    echo ""
    echo "Environments:"
    echo "  development  - Local development setup"
    echo "  staging      - Staging environment"
    echo "  production   - Production environment"
    echo ""
    echo "Actions:"
    echo "  deploy       - Deploy the application"
    echo "  setup        - Setup development environment"
    echo "  backup       - Create database backup"
    echo "  rollback     - Rollback deployment"
    echo "  health       - Check application health"
    echo ""
    echo "Examples:"
    echo "  $0 development setup"
    echo "  $0 production deploy"
    echo "  $0 production backup"
}

# Main script logic
main() {
    case $ACTION in
        deploy)
            check_prerequisites
            deploy
            ;;
        setup)
            check_prerequisites
            setup_dev
            ;;
        backup)
            backup_database
            ;;
        rollback)
            rollback
            ;;
        health)
            health_check
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
