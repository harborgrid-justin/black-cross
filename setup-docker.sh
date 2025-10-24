#!/bin/bash

# Black-Cross Platform - Docker Setup Script
# Automated one-command setup for development environment
# Version: 1.0.0

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuration
PROJECT_NAME="Black-Cross"
NETWORK_NAME="blackcross-network"

# Logging functions
log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_step() {
    echo -e "${CYAN}➜${NC} $1"
}

log_header() {
    echo ""
    echo -e "${BOLD}${CYAN}========================================${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}========================================${NC}"
    echo ""
}

# Print banner
print_banner() {
    echo ""
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║                                                            ║${NC}"
    echo -e "${BOLD}${CYAN}║           ${GREEN}Black-Cross Platform${CYAN} - Docker Setup          ║${NC}"
    echo -e "${BOLD}${CYAN}║                                                            ║${NC}"
    echo -e "${BOLD}${CYAN}║     Enterprise Cyber Threat Intelligence Platform          ║${NC}"
    echo -e "${BOLD}${CYAN}║                                                            ║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"

    local all_good=true

    # Check Docker
    log_step "Checking Docker..."
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
        log_success "Docker $DOCKER_VERSION installed"
    else
        log_error "Docker not found. Please install Docker: https://docs.docker.com/get-docker/"
        all_good=false
    fi

    # Check Docker Compose
    log_step "Checking Docker Compose..."
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null 2>&1; then
        log_success "Docker Compose installed"
    else
        log_error "Docker Compose not found"
        all_good=false
    fi

    # Check Docker daemon
    log_step "Checking Docker daemon..."
    if docker info &> /dev/null; then
        log_success "Docker daemon is running"
    else
        log_error "Docker daemon is not running. Please start Docker."
        all_good=false
    fi

    if [ "$all_good" = false ]; then
        echo ""
        echo "Setup failed. Please fix the issues above and try again."
        exit 1
    fi

    echo ""
}

# Setup environment files
setup_environment_files() {
    log_header "Setting Up Environment Files"

    # Backend .env
    log_step "Checking backend/.env..."
    if [ -f "backend/.env" ]; then
        log_success "backend/.env already exists"
    else
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            log_success "Created backend/.env from .env.example"
            log_warning "Review backend/.env and update secrets before production!"
        else
            log_warning "backend/.env.example not found, skipping"
        fi
    fi

    # Frontend .env
    log_step "Checking frontend/.env..."
    if [ -f "frontend/.env" ]; then
        log_success "frontend/.env already exists"
    else
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            log_success "Created frontend/.env from .env.example"
        else
            log_warning "frontend/.env.example not found, skipping"
        fi
    fi

    echo ""
}

# Create Docker network
create_network() {
    log_header "Creating Docker Network"

    log_step "Checking for existing network..."
    if docker network inspect "$NETWORK_NAME" &> /dev/null; then
        log_success "Network '$NETWORK_NAME' already exists"
    else
        log_step "Creating network '$NETWORK_NAME'..."
        docker network create "$NETWORK_NAME" || {
            log_error "Failed to create Docker network"
            exit 1
        }
        log_success "Network created successfully"
    fi

    echo ""
}

# Start services
start_services() {
    log_header "Starting Services"

    log_step "Starting all containers..."
    docker-compose up -d || {
        log_error "Failed to start services"
        exit 1
    }

    log_success "All services started"
    echo ""
}

# Wait for services
wait_for_services() {
    log_header "Waiting for Services to be Ready"

    local max_wait=60
    local elapsed=0
    local check_interval=3

    # PostgreSQL
    log_step "Waiting for PostgreSQL..."
    while ! docker exec blackcross-postgres pg_isready -U blackcross &> /dev/null; do
        if [ $elapsed -ge $max_wait ]; then
            log_warning "PostgreSQL timeout (may still be starting)"
            break
        fi
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
        echo -n "."
    done
    echo ""
    log_success "PostgreSQL is ready"

    echo ""
}

# Display status
display_status() {
    log_header "Service Status"

    docker-compose ps
    echo ""
}

# Print access information
print_access_info() {
    log_header "Setup Complete! 🎉"

    echo -e "${GREEN}${BOLD}Black-Cross platform is now running!${NC}"
    echo ""
    echo -e "${BOLD}Access URLs:${NC}"
    echo -e "  ${CYAN}Frontend:${NC}  http://localhost:3000"
    echo -e "  ${CYAN}Backend:${NC}   http://localhost:8080"
    echo ""
    echo -e "${BOLD}Useful Commands:${NC}"
    echo -e "  ${CYAN}View logs:${NC}       docker-compose logs -f"
    echo -e "  ${CYAN}Stop services:${NC}   docker-compose stop"
    echo -e "  ${CYAN}Start services:${NC}  docker-compose start"
    echo -e "  ${CYAN}Service status:${NC}  docker-compose ps"
    echo ""
    echo -e "${GREEN}Happy threat hunting! 🔒${NC}"
    echo ""
}

# Main execution
main() {
    print_banner
    check_prerequisites
    setup_environment_files
    create_network
    start_services
    wait_for_services
    display_status
    print_access_info
}

# Run main function
main "$@"
