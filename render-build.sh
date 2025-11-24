#!/usr/bin/env bash
# Render.com build script

set -o errexit

echo "📦 Installing Node dependencies..."
npm ci

echo "📥 Upgrading pip..."
pip install --upgrade pip

echo "📥 Installing latest yt-dlp..."
pip install --upgrade --force-reinstall yt-dlp

echo "📥 Checking yt-dlp version..."
yt-dlp --version

echo "📥 Installing ffmpeg..."
# Render provides ffmpeg, just verify it's available
if command -v ffmpeg &> /dev/null; then
    echo "✅ ffmpeg is available"
    ffmpeg -version | head -n 1
else
    echo "⚠️ ffmpeg not found, trying to install..."
    apt-get update && apt-get install -y ffmpeg || echo "Using system ffmpeg"
fi

echo "✅ Build complete!"
