FROM node:22-alpine

WORKDIR /app

# Install system dependencies if needed (Vite/React usually don't need much)
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5173

# Run in dev mode
CMD ["npm", "run", "dev", "--", "--host"]
