#!/bin/bash

# Martin++ Deployment Script
# This script helps deploy the Martin++ application to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="martin-plus-plus"
DOCKER_IMAGE_NAME="${PROJECT_NAME}:latest"
ENV_FILE=".env.production"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
pre_deployment_checks() {
    print_status "Running pre-deployment checks..."

    # Check if Docker is installed
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if .env.production exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Production environment file '$ENV_FILE' not found."
        print_status "Copy .env.production and configure your environment variables."
        exit 1
    fi

    # Check if required environment variables are set
    if ! grep -q "YOUR_OPENAI_API_KEY" "$ENV_FILE"; then
        print_error "Please set your OPENAI_API_KEY in $ENV_FILE"
        exit 1
    fi

    if ! grep -q "YOUR_GOOGLE_CLIENT_ID" "$ENV_FILE"; then
        print_error "Please configure your Google API credentials in $ENV_FILE"
        exit 1
    fi

    print_success "Pre-deployment checks passed!"
}

# Build the application
build_application() {
    print_status "Building Martin++ application..."

    # Build the Docker image
    docker build -t "$DOCKER_IMAGE_NAME" .

    if [ $? -eq 0 ]; then
        print_success "Application built successfully!"
    else
        print_error "Failed to build application"
        exit 1
    fi
}

# Start services
start_services() {
    print_status "Starting services with Docker Compose..."

    # Load environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    # Start services
    docker-compose up -d

    if [ $? -eq 0 ]; then
        print_success "Services started successfully!"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Health check
health_check() {
    print_status "Performing health checks..."

    # Wait for services to be ready
    sleep 30

    # Check if the application is responding
    max_attempts=10
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        print_status "Health check attempt $attempt/$max_attempts..."

        if curl -f --max-time 10 http://localhost/health >/dev/null 2>&1; then
            print_success "Health check passed!"
            return 0
        fi

        sleep 10
        ((attempt++))
    done

    print_error "Health check failed after $max_attempts attempts"
    print_status "Check logs with: docker-compose logs"
    exit 1
}

# Show deployment status
show_status() {
    print_success "Martin++ deployment completed successfully!"
    echo ""
    echo "📊 Deployment Status:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Docker containers: $(docker-compose ps --services --filter "status=running" | wc -l) running"
    echo "✅ Application: $(docker-compose ps martin-app | grep -c "Up") service(s) up"
    echo "✅ Database: $(docker-compose ps postgres | grep -c "Up") service(s) up"
    echo "✅ Cache: $(docker-compose ps redis | grep -c "Up") service(s) up"
    echo "✅ Load Balancer: $(docker-compose ps nginx | grep -c "Up") service(s) up"
    echo ""
    echo "🔗 Access Points:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 Frontend: https://your-domain.com"
    echo "🔌 API: https://your-domain.com/api/v1"
    echo "💓 Health Check: https://your-domain.com/health"
    echo ""
    echo "📋 Useful Commands:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "docker-compose logs -f              # View logs"
    echo "docker-compose ps                   # View container status"
    echo "docker-compose restart martin-app   # Restart application"
    echo "docker-compose down                 # Stop all services"
    echo "docker system prune -a             # Clean up unused images"
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    print_success "Services restarted"
}

# Backup database
backup_database() {
    print_status "Creating database backup..."

    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="backup_${timestamp}.sql"

    docker exec martin-postgres pg_dump -U martin_user martin > "$backup_file"

    if [ $? -eq 0 ]; then
        print_success "Database backup created: $backup_file"
    else
        print_error "Failed to create database backup"
    fi
}

# Show usage
usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy the application (default)"
    echo "  build     - Build the application only"
    echo "  start     - Start services only"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show deployment status"
    echo "  backup    - Create database backup"
    echo "  logs      - Show application logs"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy          # Full deployment"
    echo "  $0 stop && $0 start # Restart services"
    echo "  $0 logs -f          # Follow logs"
    echo ""
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        print_status "Starting Martin++ deployment..."
        pre_deployment_checks
        build_application
        start_services
        health_check
        show_status
        ;;
    "build")
        pre_deployment_checks
        build_application
        ;;
    "start")
        start_services
        health_check
        show_status
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        health_check
        show_status
        ;;
    "status")
        show_status
        ;;
    "backup")
        backup_database
        ;;
    "logs")
        docker-compose logs "${@:2}"
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        usage
        exit 1
        ;;
esac
