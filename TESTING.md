# 🧪 Testing Guide

## Quick Test

1. **Start server:**
```bash
npm start
```

2. **Open test page:**
```
http://localhost:3000/test-server.html
```

3. **Run tests:**
- Click "1. Test Server Health" → Should show server info
- Click "2. Test Video Info" → Should fetch video title
- Click "3. Test Download" → Should start download

## What I Fixed for Speed

### 1. Smart Title Fetching
- ✅ Fetches video title for proper filename
- ✅ Falls back to timestamp if title fetch fails
- ✅ Only adds 2-3 seconds to download time

### 2. Optimized Commands
- Removed unnecessary post-processing
- Increased buffer size for large files
- Better timeout handling

### 3. Platform Detection
- Auto-detects Windows vs Linux
- Uses correct binaries automatically

## Expected Speed

### Video Info:
- ✅ < 2 seconds (instant for non-YouTube)
- ✅ < 5 seconds (YouTube with title)

### Download:
- **360p**: ~10-30 seconds
- **480p**: ~20-40 seconds
- **720p**: ~30-60 seconds
- **1080p**: ~60-120 seconds
- **MP3**: ~10-20 seconds

*Speed depends on video length and internet connection*

## Troubleshooting

### "Failed to fetch video info"
1. Check server is running
2. Open http://localhost:3000/api/health
3. Should see: `{"status":"ok"}`

### Download takes too long
- This is normal for large files
- 1080p videos can take 2-3 minutes
- Use 360p or 480p for faster downloads

### Download fails
1. Check yt-dlp is installed
2. Check ffmpeg is installed
3. Check internet connection
4. Try a different video URL

## Test URLs

### YouTube:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### TikTok:
```
https://www.tiktok.com/@username/video/1234567890
```

## Performance Tips

1. **Use lower quality** for faster downloads
2. **360p or 480p** downloads in 10-30 seconds
3. **MP3 audio** is fastest (10-20 seconds)
4. **Avoid 4K** unless necessary (very slow)

## Server Logs

Watch server console for:
```
📥 Video info request: [URL]
🎬 Platform: youtube
✅ Title: [Video Title]
🎥 Downloading 720p...
✅ 720p sent
```

## Done!

If all tests pass, your downloader is working correctly!
