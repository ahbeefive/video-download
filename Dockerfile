# Dockerfile for alternative deployment (Railway, Fly.io, etc.)
FROM node:18-slim

# Install FFmpeg and yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    && pip3 install yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create downloads directory
RUN mkdir -p downloads

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
