# Docker Commands for LLMredi Frontend

## Quick Start

### Build and Run with Docker
```bash
# Build the image
docker build -t llmredi-frontend .

# Run the container
docker run -p 3001:3001 --name llmredi-frontend llmredi-frontend

# Run in detached mode (background)
docker run -d -p 3001:3001 --name llmredi-frontend llmredi-frontend

# Stop and remove the container
docker stop llmredi-frontend
docker rm llmredi-frontend
```

## Environment Configuration

### Using Environment Variables
1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your configuration:
   ```bash
   # For production
   REACT_APP_API_BASE_URL=https://parthgoai.pythonanywhere.com
   REACT_APP_DEBUG_MODE=false
   
   # For local development
   # REACT_APP_API_BASE_URL=http://localhost:5002
   # REACT_APP_DEBUG_MODE=true
   ```

3. Run with environment variables:
   ```bash
   docker run -p 3001:3001 --env-file .env --name llmredi-frontend llmredi-frontend
   ```

## Useful Commands

### Container Management
```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs llmredi-frontend

# Follow logs in real-time
docker logs -f llmredi-frontend

# Execute commands inside container
docker exec -it llmredi-frontend sh

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune
```

### Development Commands
```bash
# Rebuild without cache
docker build --no-cache -t llmredi-frontend .

# View container health status
docker inspect llmredi-frontend | grep -A 10 "Health"

# Access nginx configuration
docker exec -it llmredi-frontend cat /etc/nginx/nginx.conf

# Test nginx configuration
docker exec -it llmredi-frontend nginx -t
```

## Accessing the Application

- **Local URL**: http://localhost:3001 (redirects to login)
- **Login Page**: http://localhost:3001/login
- **Health Check**: http://localhost:3001/health

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Use a different port
   docker run -p 3002:3001 --name llmredi-frontend llmredi-frontend
   ```

2. **Build fails**:
   ```bash
   # Clean build
   docker system prune -a
   docker build --no-cache -t llmredi-frontend .
   ```

3. **API connection issues**:
   - Check your `.env` file configuration
   - Verify the API_BASE_URL is correct
   - Check if the API server is running

4. **Container won't start**:
   ```bash
   # Check logs
   docker logs llmredi-frontend
   
   # Check nginx configuration
   docker exec -it llmredi-frontend nginx -t
   ```

### Performance Optimization

1. **Enable gzip compression** (already configured in nginx.conf)
2. **Use multi-stage build** (already implemented)
3. **Optimize image size** (using alpine images)

## Production Deployment

For production deployment, consider:

1. **Use a reverse proxy** (nginx, traefik) in front of the container
2. **Set up SSL/TLS certificates**
3. **Configure proper logging**
4. **Set up monitoring and alerting**
5. **Use container orchestration** (Docker Swarm, Kubernetes)

### Example Production Docker Run Command
```bash
# Production deployment with SSL and logging
docker run -d \
  --name llmredi-frontend-prod \
  -p 80:80 \
  -p 443:443 \
  -e NODE_ENV=production \
  -v ./ssl:/etc/nginx/ssl:ro \
  -v ./logs:/var/log/nginx \
  --restart always \
  llmredi-frontend
```
