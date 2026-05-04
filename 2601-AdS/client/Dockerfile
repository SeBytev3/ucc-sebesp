# Builder stage
FROM node:22-alpine AS builder

# Install system dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable corepack and use latest npm
RUN corepack enable && corepack prepare npm@11.13.0 --activate

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code and config files
COPY . .

# Build React application
RUN npm run build

# Production stage (using a lightweight server or just node for dev)
# For a real production React app, Nginx is better, but to maintain 
# parity with the server's node-based approach and dev workflow:
FROM node:22-alpine

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S nodejs && adduser -S vitejs -G nodejs

# Enable corepack and use latest npm
RUN corepack enable && corepack prepare npm@11.13.0 --activate

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/vite.config.ts ./
# In case we want to run source code in dev mode via volumes
COPY --from=builder /app/src ./src

# Ensure permissions for the non-root user
RUN chown -R vitejs:nodejs /app

# Switch to the non-root user
USER vitejs

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 5173

# Command to run (overridden in docker-compose for dev)
CMD ["npm", "run", "preview", "--", "--host"]
