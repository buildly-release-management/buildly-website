# Buildly Website Operations Scripts

This folder contains operational scripts for managing the Buildly website development environment.

## admin-server.sh

A comprehensive bash script for managing the admin development server.

### Quick Start

```bash
# Make the script executable (first time only)
chmod +x ops/admin-server.sh

# Start the server
./ops/admin-server.sh start

# Or just run it (will auto-start if not running)
./ops/admin-server.sh
```

### Commands

| Command | Description |
|---------|-------------|
| `start [port]` | Start the admin server (default port: 8000) |
| `stop` | Stop the admin server |
| `restart [port]` | Restart the admin server |
| `status` | Show server and environment status |
| `setup` | Set up virtual environment and install dependencies |
| `logs` | Show server logs |
| `help` | Show help message |

### Examples

```bash
# Start on default port 8000
./ops/admin-server.sh start

# Start on custom port
./ops/admin-server.sh start 3000

# Check status
./ops/admin-server.sh status

# Restart after code changes
./ops/admin-server.sh restart

# Stop the server
./ops/admin-server.sh stop

# View logs
./ops/admin-server.sh logs
```

### What It Does

1. **Virtual Environment Management**
   - Creates a Python virtual environment in `.venv/` if it doesn't exist
   - Automatically activates the environment before running the server
   - Installs/updates dependencies from `requirements.txt` when changed

2. **Server Lifecycle**
   - Starts the dev-server.py in the background
   - Tracks the server PID for easy stop/restart
   - Logs output to `.admin-server.log`

3. **Smart Detection**
   - Detects if server is already running
   - Checks if dependencies need updating (via hash comparison)
   - Finds the correct Python executable

### Files Created

| File | Purpose |
|------|---------|
| `.venv/` | Python virtual environment |
| `.admin-server.pid` | Server process ID |
| `.admin-server.log` | Server output logs |
| `.venv/.requirements-hash` | Tracks requirements.txt changes |

### Admin URLs

Once the server is running:

- **Admin Dashboard**: http://localhost:8000/admin/
- **Content Editor**: http://localhost:8000/admin/editor.html
- **Settings**: http://localhost:8000/admin/settings.html
- **Social Manager**: http://localhost:8000/admin/social.html

### Troubleshooting

**Server won't start:**
```bash
# Check the logs
./ops/admin-server.sh logs

# Or view directly
tail -f .admin-server.log
```

**Port already in use:**
```bash
# Find what's using the port
lsof -i :8000

# Use a different port
./ops/admin-server.sh start 3000
```

**Reset everything:**
```bash
# Stop server and remove virtual environment
./ops/admin-server.sh stop
rm -rf .venv
./ops/admin-server.sh start
```
