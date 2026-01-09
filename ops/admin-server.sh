#!/bin/bash
#
# Buildly Website Admin Server Management Script
# 
# Usage: ./ops/admin-server.sh [start|stop|restart|status|setup]
#
# This script manages the development server for the Buildly website admin interface.
# It handles virtual environment setup, dependency installation, and server lifecycle.
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_ROOT/.venv"
REQUIREMENTS_FILE="$PROJECT_ROOT/requirements.txt"
PID_FILE="$PROJECT_ROOT/.admin-server.pid"
LOG_FILE="$PROJECT_ROOT/.admin-server.log"
SERVER_SCRIPT="$PROJECT_ROOT/dev-server.py"
DEFAULT_PORT=8000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Buildly Website Admin Server${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if Python 3 is available
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        # Check if it's Python 3
        if python --version 2>&1 | grep -q "Python 3"; then
            PYTHON_CMD="python"
        else
            print_error "Python 3 is required but not found"
            exit 1
        fi
    else
        print_error "Python is not installed"
        exit 1
    fi
    
    print_info "Using Python: $($PYTHON_CMD --version)"
}

# Check if virtual environment exists and is valid
venv_exists() {
    [[ -d "$VENV_DIR" ]] && [[ -f "$VENV_DIR/bin/activate" ]]
}

# Check if requirements need updating
requirements_changed() {
    local marker_file="$VENV_DIR/.requirements-hash"
    
    # If no requirements file, no update needed
    if [[ ! -f "$REQUIREMENTS_FILE" ]] || [[ ! -s "$REQUIREMENTS_FILE" ]]; then
        return 1
    fi
    
    # If no marker file, needs update
    if [[ ! -f "$marker_file" ]]; then
        return 0
    fi
    
    # Compare hash of requirements file
    local current_hash=$(md5 -q "$REQUIREMENTS_FILE" 2>/dev/null || md5sum "$REQUIREMENTS_FILE" | cut -d' ' -f1)
    local stored_hash=$(cat "$marker_file" 2>/dev/null)
    
    [[ "$current_hash" != "$stored_hash" ]]
}

# Create or update virtual environment
setup_venv() {
    print_info "Setting up virtual environment..."
    
    if ! venv_exists; then
        print_info "Creating new virtual environment at $VENV_DIR"
        $PYTHON_CMD -m venv "$VENV_DIR"
        print_success "Virtual environment created"
    else
        print_info "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Upgrade pip
    print_info "Upgrading pip..."
    pip install --upgrade pip -q
    
    # Install requirements if they exist and have changed
    if [[ -f "$REQUIREMENTS_FILE" ]] && [[ -s "$REQUIREMENTS_FILE" ]]; then
        if requirements_changed; then
            print_info "Installing/updating dependencies from requirements.txt..."
            pip install -r "$REQUIREMENTS_FILE"
            
            # Store hash of requirements file
            local current_hash=$(md5 -q "$REQUIREMENTS_FILE" 2>/dev/null || md5sum "$REQUIREMENTS_FILE" | cut -d' ' -f1)
            echo "$current_hash" > "$VENV_DIR/.requirements-hash"
            print_success "Dependencies installed"
        else
            print_info "Dependencies are up to date"
        fi
    else
        print_info "No requirements.txt found or file is empty (using standard library only)"
    fi
    
    print_success "Virtual environment is ready"
}

# Get the PID of running server
get_server_pid() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        # Check if process is actually running
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "$pid"
            return 0
        else
            # Stale PID file, clean up
            rm -f "$PID_FILE"
        fi
    fi
    
    # Try to find by process name
    local pid=$(pgrep -f "python.*dev-server.py" 2>/dev/null | head -1)
    if [[ -n "$pid" ]]; then
        echo "$pid"
        return 0
    fi
    
    return 1
}

# Check if server is running
is_running() {
    get_server_pid > /dev/null 2>&1
}

# Start the server
start_server() {
    local port="${1:-$DEFAULT_PORT}"
    
    print_info "Starting admin server on port $port..."
    
    if is_running; then
        local pid=$(get_server_pid)
        print_warning "Server is already running (PID: $pid)"
        print_info "Access admin at: http://localhost:$port/admin/"
        return 0
    fi
    
    # Ensure virtual environment is set up
    setup_venv
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Start server in background
    print_info "Launching server..."
    nohup "$VENV_DIR/bin/python" "$SERVER_SCRIPT" "$port" > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$pid" > "$PID_FILE"
    
    # Wait a moment and check if it started successfully
    sleep 2
    
    if ps -p "$pid" > /dev/null 2>&1; then
        print_success "Server started successfully (PID: $pid)"
        echo ""
        print_info "Access the admin interface at:"
        echo -e "  ${GREEN}→ Admin Dashboard:  http://localhost:$port/admin/${NC}"
        echo -e "  ${GREEN}→ Content Editor:   http://localhost:$port/admin/editor.html${NC}"
        echo -e "  ${GREEN}→ Settings:         http://localhost:$port/admin/settings.html${NC}"
        echo -e "  ${GREEN}→ Social Manager:   http://localhost:$port/admin/social.html${NC}"
        echo ""
        print_info "Logs: $LOG_FILE"
    else
        print_error "Failed to start server. Check logs at: $LOG_FILE"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# Stop the server
stop_server() {
    print_info "Stopping admin server..."
    
    if ! is_running; then
        print_warning "Server is not running"
        rm -f "$PID_FILE"
        return 0
    fi
    
    local pid=$(get_server_pid)
    
    # Try graceful shutdown first
    kill "$pid" 2>/dev/null
    
    # Wait for process to stop
    local count=0
    while ps -p "$pid" > /dev/null 2>&1 && [[ $count -lt 10 ]]; do
        sleep 1
        ((count++))
    done
    
    # Force kill if still running
    if ps -p "$pid" > /dev/null 2>&1; then
        print_warning "Forcing shutdown..."
        kill -9 "$pid" 2>/dev/null
        sleep 1
    fi
    
    rm -f "$PID_FILE"
    print_success "Server stopped"
}

# Restart the server
restart_server() {
    local port="${1:-$DEFAULT_PORT}"
    print_info "Restarting admin server..."
    stop_server
    sleep 1
    start_server "$port"
}

# Show server status
show_status() {
    print_header
    
    if is_running; then
        local pid=$(get_server_pid)
        print_success "Server is RUNNING (PID: $pid)"
        
        # Try to determine the port
        local port=$(lsof -Pan -p "$pid" -i 2>/dev/null | grep LISTEN | awk '{print $9}' | cut -d: -f2 | head -1)
        if [[ -n "$port" ]]; then
            echo ""
            print_info "Listening on port: $port"
            print_info "Admin URL: http://localhost:$port/admin/"
        fi
    else
        print_warning "Server is NOT RUNNING"
    fi
    
    echo ""
    
    # Virtual environment status
    if venv_exists; then
        print_success "Virtual environment: EXISTS at $VENV_DIR"
        if [[ -f "$REQUIREMENTS_FILE" ]] && [[ -s "$REQUIREMENTS_FILE" ]]; then
            if requirements_changed; then
                print_warning "Requirements: NEEDS UPDATE"
            else
                print_success "Requirements: UP TO DATE"
            fi
        else
            print_info "Requirements: None specified"
        fi
    else
        print_warning "Virtual environment: NOT CREATED"
    fi
    
    echo ""
}

# Show usage information
show_usage() {
    print_header
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start [port]    Start the admin server (default port: $DEFAULT_PORT)"
    echo "  stop            Stop the admin server"
    echo "  restart [port]  Restart the admin server"
    echo "  status          Show server and environment status"
    echo "  setup           Set up virtual environment and install dependencies"
    echo "  logs            Show server logs"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start server on port 8000"
    echo "  $0 start 3000     # Start server on port 3000"
    echo "  $0 restart        # Restart server"
    echo "  $0 status         # Check if server is running"
    echo ""
}

# Show logs
show_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        print_info "Showing last 50 lines of log file..."
        echo ""
        tail -50 "$LOG_FILE"
        echo ""
        print_info "Full log at: $LOG_FILE"
        print_info "Use 'tail -f $LOG_FILE' to follow logs"
    else
        print_warning "No log file found"
    fi
}

# Main entry point
main() {
    check_python
    
    case "${1:-}" in
        start)
            start_server "${2:-$DEFAULT_PORT}"
            ;;
        stop)
            stop_server
            ;;
        restart)
            restart_server "${2:-$DEFAULT_PORT}"
            ;;
        status)
            show_status
            ;;
        setup)
            setup_venv
            ;;
        logs)
            show_logs
            ;;
        help|--help|-h)
            show_usage
            ;;
        "")
            # Default action: smart start
            if is_running; then
                show_status
            else
                start_server "$DEFAULT_PORT"
            fi
            ;;
        *)
            print_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
