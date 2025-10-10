# Multi-stage build for React app with nginx
# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy only the static assets from public (excluding index.html)
COPY --from=build /app/public/favicon_llm_ready.png /usr/share/nginx/html/
COPY --from=build /app/public/llm_redi_png.png /usr/share/nginx/html/
COPY --from=build /app/public/manifest.json /usr/share/nginx/html/

# Expose port 3001
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
