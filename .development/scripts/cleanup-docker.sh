#!/bin/bash

# Black-Cross Platform - Docker Cleanup Script
# Complete cleanup of Docker containers, volumes, and network
# Version: 1.0.0

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

NETWORK_NAME="blackcross-network"

# Logging functions
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_step() { echo -e "${CYAN}➜${NC} $1"; }

log_header() {
    echo ""
    echo -e "${BOLD}${CYAN}========================================${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}========================================${NC}"
    echo ""
}

print_banner() {
    echo ""
    echo -e "${BOLD}${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${RED}║  Black-Cross - Docker Cleanup          ║${NC}"
    echo -e "${BOLD}${RED}║  ⚠  WARNING: DATA WILL BE LOST ⚠       ║${NC}"
    echo -e "${BOLD}${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
}

confirm_cleanup() {
    echo -e "${YELLOW}${BOLD}This will:${NC}"
    echo -e "  ${RED}•${NC} Stop all Black-Cross containers"
    echo -e "  ${RED}•${NC} Remove all containers"
    echo -e "  ${RED}•${NC} Delete ALL data volumes (PostgreSQL, MongoDB, etc.)"
    echo ""

    read -p "Continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Cleanup cancelled."
        exit 0
    fi
}

stop_containers() {
    log_header "Stopping Containers"
    log_step "Stopping all containers..."
    docker-compose stop 2>/dev/null || log_warning "Some containers may already be stopped"
    log_success "Containers stopped"
    echo ""
}

remove_containers_and_volumes() {
    log_header "Removing Containers and Volumes"
    log_warning "Deleting ALL data..."
    sleep 2

    log_step "Removing containers and volumes..."
    docker-compose down -v 2>/dev/null || log_warning "Cleanup completed with warnings"
    log_success "Containers and volumes removed"
    echo ""
}

remove_network() {
    log_header "Removing Network"
    log_step "Removing network..."
    if docker network inspect "$NETWORK_NAME" &> /dev/null; then
        docker network rm "$NETWORK_NAME" 2>/dev/null || log_warning "Network may be in use"
        log_success "Network removed"
    else
        log_warning "Network not found"
    fi
    echo ""
}

print_completion() {
    log_header "Cleanup Complete"
    echo -e "${GREEN}${BOLD}Docker environment cleaned!${NC}"
    echo ""
    echo -e "${BOLD}To set up again:${NC}"
    echo -e "  ${CYAN}Run:${NC} ./setup-docker.sh"
    echo ""
}

main() {
    print_banner
    confirm_cleanup
    stop_containers
    remove_containers_and_volumes
    remove_network
    print_completion
}

main "$@"
