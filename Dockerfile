# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm install

# Copy all frontend source code
COPY . .

# Build the frontend (creates /app/dist)
RUN npm run build

# Stage 2: Setup the Backend Server
FROM node:20-alpine
WORKDIR /app

# Copy the built frontend assets from stage 1 to /app/dist
COPY --from=frontend-builder /app/dist ./dist

# Copy the server code to /app/server
COPY server ./server

# Install backend dependencies
WORKDIR /app/server
RUN npm install --production

# Set default env vars (can be overridden in Coolify)
ENV PORT=3001
ENV NODE_ENV=production

# Expose the port
EXPOSE 3001

# Start the server
CMD ["node", "index.js"]
