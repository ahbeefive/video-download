# 🚀 Deployment Guide

## Deploy to Render.com (Recommended)

### Step 1: Prepare Your Repository

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/video-downloader.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect settings from `render.yaml`
5. Click "Create Web Service"

### Step 3: Wait for Build

Render will automatically:
- ✅ Install Node.js dependencies
- ✅ Install yt-dlp
- ✅ Install ffmpeg
- ✅ Start your server

### Step 4: Access Your Site

Your site will be available at:
```
https://your-app-name.onrender.com
```

Admin panel:
```
https://your-app-name.onrender.com/admin.html
Username: admin
Password: admin123
```

## Environment Variables (Optional)

Add these in Render dashboard if needed:

- `MONGODB_URI` - MongoDB connection string (for database storage)
- `CLOUDINARY_CLOUD_NAME` - For cloud image storage
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Local Development

### Windows:
```bash
npm install
start.bat
```

### Linux/Mac:
```bash
npm install
npm start
```

## Important Notes

### For Render.com:
- ✅ Free tier available
- ✅ Auto-installs yt-dlp and ffmpeg
- ✅ HTTPS included
- ⚠️ Free tier spins down after 15 min of inactivity
- ⚠️ First request after spin-down takes ~30 seconds

### Data Storage:
- Settings and banners are stored in `data/` folder
- On Render, this data persists between deploys
- For production, consider using MongoDB (optional)

### Admin Credentials:
⚠️ **IMPORTANT:** Change default admin credentials in `server.js`:
```javascript
const ADMIN_USER = "your_username";
const ADMIN_PASS = "your_secure_password";
```

## Troubleshooting

### Build Fails:
- Check `render-build.sh` has execute permissions
- Check Node.js version (18+ required)

### Downloads Not Working:
- Ensure yt-dlp and ffmpeg are installed
- Check Render build logs

### Data Not Persisting:
- Check `data/` folder exists
- Check file permissions

## Support

For issues, check:
- Render build logs
- Browser console (F12)
- Server logs in Render dashboard

## 🎉 Done!

Your video downloader is now live and ready to use!
