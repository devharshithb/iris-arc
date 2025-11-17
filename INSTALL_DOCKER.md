# 🐳 Installing Docker on WSL2 - Quick Guide

This guide will help you install Docker on Windows with WSL2 integration.

---

## Prerequisites

- Windows 10 version 2004 or higher, or Windows 11
- WSL2 installed and configured
- At least 4GB of RAM

---

## Installation Steps

### Step 1: Download Docker Desktop

1. Visit https://www.docker.com/products/docker-desktop
2. Click "Download for Windows"
3. Run the installer (`Docker Desktop Installer.exe`)

### Step 2: Installation Options

During installation:
- ✅ **Check:** "Use WSL 2 instead of Hyper-V" (recommended)
- ✅ **Check:** "Add shortcut to desktop"
- Click "Ok" and wait for installation to complete
- Click "Close and restart" when prompted

### Step 3: Enable WSL Integration

After your computer restarts:

1. Open Docker Desktop
2. Click the gear icon (⚙️) for Settings
3. Go to **Resources → WSL Integration**
4. Enable:
   - ✅ "Enable integration with my default WSL distro"
   - ✅ Toggle ON for your specific distro (e.g., Ubuntu)
5. Click **"Apply & Restart"**

### Step 4: Verify Installation in WSL2

Open your WSL2 terminal and run:

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Test Docker installation
docker run hello-world
```

You should see:
```
Docker version 24.x.x, build xxxxxxx
Docker Compose version v2.x.x
Hello from Docker! ...
```

---

## Common Issues & Solutions

### Issue 1: "docker: command not found"

**Solution:**
1. Make sure Docker Desktop is running
2. Open Docker Desktop Settings
3. Go to Resources → WSL Integration
4. Enable integration with your distro
5. Restart WSL: `wsl --shutdown` (in PowerShell), then reopen WSL

### Issue 2: "Cannot connect to the Docker daemon"

**Solution:**
1. Start Docker Desktop application
2. Wait for Docker to fully start (check system tray icon)
3. Try the command again

### Issue 3: Docker Desktop won't start

**Solution:**
1. Check Windows version: `winver` (must be 2004+)
2. Ensure WSL2 is installed:
   ```powershell
   wsl --list --verbose
   ```
3. Update WSL kernel:
   ```powershell
   wsl --update
   ```
4. Restart computer

### Issue 4: Slow performance

**Solutions:**
- Move your project to WSL filesystem: `/home/username/projects/`
- Don't work on Windows filesystem from WSL (`/mnt/c/`)
- Increase Docker Desktop memory: Settings → Resources → Advanced

---

## Alternative: Install Docker Engine Directly in WSL2

If you don't want Docker Desktop, you can install Docker Engine in WSL2:

```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo service docker start
```

**Note:** You'll need to start Docker service manually each time:
```bash
sudo service docker start
```

Or add to `~/.bashrc`:
```bash
# Auto-start Docker
if service docker status 2>&1 | grep -q "is not running"; then
    sudo service docker start
fi
```

---

## Verify Everything Works

Once installed, test with Iris Arc:

```bash
# Navigate to project
cd /home/username/iris-arc

# Copy environment file
cp .env.example .env

# Edit .env and set JWT_SECRET
nano .env

# Build and run
docker compose up --build
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Next Steps

1. ✅ Docker installed and working
2. ✅ WSL integration enabled
3. 📖 Read [DOCKER.md](DOCKER.md) for full deployment guide
4. 🚀 Run `docker compose up` to start Iris Arc

---

## Resources

- [Docker Desktop WSL 2 backend](https://docs.docker.com/desktop/wsl/)
- [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Docker Documentation](https://docs.docker.com/)

---

**Need help?** Check the [DOCKER.md](DOCKER.md) troubleshooting section or open an issue on GitHub.
