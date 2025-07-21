# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy source code
COPY . .

# Build the application
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm build; \
    else \
      npm run build; \
    fi

# Expose port
EXPOSE 3000

# Start the application
CMD if [ -f pnpm-lock.yaml ]; then \
      pnpm start; \
    else \
      npm start; \
    fi