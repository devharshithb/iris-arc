# 🐳 Docker Deployment Guide for Iris Arc

This guide covers Docker and Docker Compose deployment for the Iris Arc application.

---

## 📋 Prerequisites

### For Windows (WSL2)

1. **Install Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop
   - During installation, ensure "Use WSL 2 instead of Hyper-V" is selected

2. **Enable WSL 2 Integration**
   - Open Docker Desktop
   - Go to Settings → Resources → WSL Integration
   - Enable integration with your WSL 2 distro (e.g., Ubuntu)
   - Click "Apply & Restart"

3. **Verify Installation in WSL2**
   ```bash
   docker --version
   docker compose version
   ```

### For Linux

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### For macOS

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify with `docker --version` and `docker compose version`

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd iris-arc
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your values
nano .env
```

**Important:** Generate a secure JWT secret:
```bash
openssl rand -hex 32
```

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

The services will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 4. Stop the Services

```bash
# Stop services (keeps containers)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes
docker compose down -v
```

---

## 📦 Docker Compose Services

### Backend Service

- **Container:** `iris-arc-backend`
- **Port:** 8000
- **Image:** Built from `./backend/Dockerfile`
- **Volume:** `backend-data` for SQLite database persistence
- **Health Check:** HTTP GET to root endpoint

### Frontend Service

- **Container:** `iris-arc-frontend`
- **Port:** 3000
- **Image:** Built from `./web/Dockerfile`
- **Depends On:** backend (waits for backend health check)
- **Health Check:** wget to localhost:3000

---

## 🔧 Docker Commands

### Building Images

```bash
# Build all services
docker compose build

# Build specific service
docker compose build backend
docker compose build frontend

# Build without cache (clean build)
docker compose build --no-cache
```

### Running Services

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# Start specific service
docker compose up backend
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# View last 100 lines
docker compose logs --tail=100
```

### Managing Containers

```bash
# List running containers
docker compose ps

# Stop services
docker compose stop

# Start stopped services
docker compose start

# Restart services
docker compose restart

# Remove stopped containers
docker compose rm
```

### Executing Commands in Containers

```bash
# Access backend shell
docker compose exec backend /bin/bash

# Access frontend shell
docker compose exec frontend /bin/sh

# Run Python commands in backend
docker compose exec backend python -c "print('Hello from backend')"

# Check backend database
docker compose exec backend ls -la /app/data/
```

---

## 🗄️ Data Persistence

### Backend Database Volume

The SQLite database is stored in a Docker volume named `backend-data`:

```bash
# Inspect volume
docker volume inspect iris-arc_backend-data

# Backup database
docker compose exec backend cp /app/data/irisarc.db /app/backup.db
docker cp iris-arc-backend:/app/backup.db ./backup.db

# Restore database
docker cp ./backup.db iris-arc-backend:/app/backup.db
docker compose exec backend cp /app/backup.db /app/data/irisarc.db
```

---

## 🔐 Environment Variables

### Backend (.env)

```bash
JWT_SECRET=<your-secret-key>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
FRONTEND_ORIGIN=http://localhost:3000
SHOW_DEV_OTP=1
```

### Frontend

Frontend env vars are set in `docker-compose.yml`:
```yaml
environment:
  - NEXT_PUBLIC_BACKEND_BASE_URL=http://backend:8000
```

**Note:** In Docker network, services communicate using service names (`backend`, `frontend`), but external access uses `localhost`.

---

## 🏗️ Multi-Stage Builds

### Backend Dockerfile

- **Base:** `python:3.11-slim`
- **Dependencies:** Installed from `requirements.txt`
- **Port:** 8000
- **Command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Frontend Dockerfile

- **Stage 1 (deps):** Install Node dependencies
- **Stage 2 (builder):** Build Next.js application
- **Stage 3 (runner):** Production image with minimal size
- **Port:** 3000
- **Command:** `node server.js` (Next.js standalone)

---

## 🧪 Development with Docker

### Development Mode

For development, you can mount source code as volumes:

```yaml
# Add to docker-compose.yml under backend service
volumes:
  - ./backend:/app
  - backend-data:/app/data

# Add to docker-compose.yml under frontend service
volumes:
  - ./web:/app
  - /app/node_modules  # Prevent overwriting node_modules
```

Then restart:
```bash
docker compose down
docker compose up
```

### Hot Reload

For backend hot reload, change the CMD in `backend/Dockerfile`:
```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

For frontend, Next.js development mode:
```dockerfile
CMD ["pnpm", "dev"]
```

---

## 🚀 Production Deployment

### Build Production Images

```bash
# Build with specific tags
docker build -t iris-arc-backend:latest ./backend
docker build -t iris-arc-frontend:latest ./web
```

### Push to Registry

```bash
# Tag for Docker Hub
docker tag iris-arc-backend:latest username/iris-arc-backend:latest
docker tag iris-arc-frontend:latest username/iris-arc-frontend:latest

# Push to registry
docker push username/iris-arc-backend:latest
docker push username/iris-arc-frontend:latest
```

### Production docker-compose.yml

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: username/iris-arc-backend:latest
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_ORIGIN=https://yourdomain.com
    restart: always

  frontend:
    image: username/iris-arc-frontend:latest
    environment:
      - NEXT_PUBLIC_BACKEND_BASE_URL=https://api.yourdomain.com
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
```

Run production:
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Check container status
docker compose ps

# Inspect container
docker inspect iris-arc-backend
```

### Port Already in Use

```bash
# Find process using port 8000
sudo lsof -i :8000

# Or change port in docker-compose.yml
ports:
  - "8001:8000"  # Map host port 8001 to container port 8000
```

### Network Issues

```bash
# Inspect network
docker network inspect iris-arc_iris-arc-network

# Recreate network
docker compose down
docker network prune
docker compose up
```

### Clear Everything

```bash
# Stop and remove everything
docker compose down -v

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

### Database Issues

```bash
# Reset database
docker compose down -v
docker compose up

# Access database directly
docker compose exec backend sqlite3 /app/data/irisarc.db
```

---

## 📊 Monitoring

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats iris-arc-backend
```

### Health Checks

```bash
# Check health status
docker compose ps

# Manual health check
docker compose exec backend python -c "import requests; print(requests.get('http://localhost:8000/').json())"
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** — Use `.env.example` as template
2. **Use strong JWT secrets** — Generate with `openssl rand -hex 32`
3. **Run containers as non-root** — Already configured in Dockerfiles
4. **Keep images updated** — Regularly rebuild with latest base images
5. **Use secrets management** — Consider Docker secrets for production
6. **Scan images for vulnerabilities** — Use `docker scan`

```bash
# Scan images for vulnerabilities
docker scan iris-arc-backend:latest
docker scan iris-arc-frontend:latest
```

---

## 📝 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Docker Documentation](https://fastapi.tiangolo.com/deployment/docker/)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker compose logs -f`
2. Verify environment variables: `docker compose config`
3. Ensure Docker is running: `docker ps`
4. Check network connectivity: `docker network ls`
5. Review health checks: `docker compose ps`

For WSL2-specific issues, ensure Docker Desktop WSL integration is enabled.

---

**Happy Dockerizing! 🐳**
