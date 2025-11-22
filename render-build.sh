#!/bin/bash
# Render.com build script

echo "📦 Installing dependencies..."
npm install

echo "📥 Installing yt-dlp..."
pip install -U yt-dlp

echo "📥 Installing ffmpeg..."
apt-get update
apt-get install -y ffmpeg

echo "✅ Build complete!"
