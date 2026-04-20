FROM node:22-alpine AS builder

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Copy source code and config files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose the application port
EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "start"]
