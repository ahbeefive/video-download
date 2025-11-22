# 📦 GitHub Upload Guide

## ✅ Repository Settings

Use these settings on GitHub:

- **Repository name**: `video-download` ✅
- **Description**: `App video downloader` ✅
- **Visibility**: **Public** ✅
- **Add README**: **Turn ON** ✅
- **Add .gitignore**: **No .gitignore** (we have one) ✅
- **Add license**: **MIT License** (recommended) ✅

## 📁 Files That WILL Be Uploaded

### Core Files (Required):
```
✅ server.js              # Main server
✅ index.html             # Frontend
✅ admin.html             # Admin panel
✅ login.html             # Login page
✅ script.js              # Frontend JavaScript
✅ styles.css             # Styles
✅ database.js            # Database models
✅ package.json           # Dependencies
✅ package-lock.json      # Lock file
```

### Configuration Files:
```
✅ .gitignore             # Git ignore rules
✅ .env.example           # Environment example
✅ render.yaml            # Render config
✅ render-build.sh        # Build script
✅ railway.json           # Railway config
✅ nixpacks.toml          # Nixpacks config
✅ Dockerfile             # Docker config
✅ .dockerignore          # Docker ignore
```

### Documentation:
```
✅ README.md              # Main documentation
✅ DEPLOYMENT.md          # Deployment guide
✅ QUICKSTART.md          # Quick start
✅ CHANGELOG.md           # Changes log
✅ TESTING.md             # Testing guide
```

### Folders:
```
✅ data/.gitkeep          # Empty data folder
✅ banners/.gitkeep       # Empty banners folder (if exists)
✅ images/                # Static images
```

## ❌ Files That WON'T Be Uploaded (Ignored)

### Automatically Ignored:
```
❌ node_modules/          # Dependencies (too large)
❌ downloads/             # Temporary downloads
❌ banners/*.png          # User uploaded images
❌ banners/*.jpg
❌ data/*.json            # User settings
❌ yt-dlp.exe             # Windows executable
❌ ffmpeg.exe             # Windows executable
❌ .env                   # Environment secrets
❌ *.log                  # Log files
```

### Should Delete Before Upload:
```
❌ banners.json           # Old file (use data/banners.json)
❌ settings.json          # Old file (use data/settings.json)
❌ test-server.html       # Test file (optional)
❌ start.bat              # Windows only (optional)
❌ START_SERVER.md        # Duplicate doc (optional)
```

## 🚀 How to Upload to GitHub

### Step 1: Clean Up (Optional)
```bash
cd "GD Download"

# Delete old/duplicate files
del banners.json
del settings.json
del test-server.html
del START_SERVER.md
```

### Step 2: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: Video downloader app"
```

### Step 3: Connect to GitHub
```bash
git remote add origin https://github.com/ahbeefive/video-download.git
git branch -M main
git push -u origin main
```

## ⚠️ Important: Before Uploading

### 1. Change Admin Credentials
Edit `server.js` (around line 30):
```javascript
const ADMIN_USER = "your_username";  // ← Change this!
const ADMIN_PASS = "your_password";  // ← Change this!
```

### 2. Check .env.example
Make sure `.env.example` exists (not `.env`):
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Verify .gitignore
Make sure `.gitignore` is working:
```bash
git status
```

Should NOT see:
- ❌ node_modules/
- ❌ yt-dlp.exe
- ❌ ffmpeg.exe
- ❌ .env

## 📊 Expected Repository Size

- **Without node_modules**: ~5-10 MB
- **With images**: ~10-20 MB
- **Total**: Small and fast to clone!

## ✅ After Upload

Your repository will be ready for:
- ✅ Render.com deployment
- ✅ Railway deployment
- ✅ Docker deployment
- ✅ Local development
- ✅ Collaboration

## 🎉 Done!

Once uploaded, your repository will be at:
```
https://github.com/ahbeefive/video-download
```

Then you can deploy to Render.com following `DEPLOYMENT.md`!
