# ✅ GitHub Upload Checklist

## Before Uploading

### 1. Change Admin Credentials ⚠️
- [ ] Open `server.js`
- [ ] Change `ADMIN_USER` (line ~30)
- [ ] Change `ADMIN_PASS` (line ~31)
- [ ] Save file

### 2. Verify Files
- [ ] Check `.gitignore` exists
- [ ] Check `README.md` exists
- [ ] Check `render.yaml` exists
- [ ] Check `package.json` exists

### 3. Test Locally
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Test download at http://localhost:3000
- [ ] Test admin at http://localhost:3000/admin.html

## GitHub Repository Settings

- [ ] Repository name: `video-download`
- [ ] Description: `App video downloader`
- [ ] Visibility: **Public**
- [ ] Add README: **Turn ON**
- [ ] Add .gitignore: **No .gitignore** (we have one)
- [ ] Add license: **MIT License**

## Upload Commands

```bash
# 1. Navigate to folder
cd "GD Download"

# 2. Initialize git
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit: Video downloader app"

# 5. Connect to GitHub
git remote add origin https://github.com/ahbeefive/video-download.git

# 6. Push
git branch -M main
git push -u origin main
```

## After Upload

- [ ] Check repository on GitHub
- [ ] Verify files are uploaded
- [ ] Check README displays correctly
- [ ] Ready to deploy to Render.com!

## Files That Should Be Uploaded

✅ Core files (server.js, index.html, etc.)
✅ Documentation (README.md, etc.)
✅ Configuration (render.yaml, package.json)
✅ Images folder
✅ Empty data/ and banners/ folders

## Files That Should NOT Be Uploaded

❌ node_modules/
❌ yt-dlp.exe
❌ ffmpeg.exe
❌ .env
❌ downloads/
❌ User uploaded banners
❌ User settings (data/*.json)

## 🎉 Ready!

Once all checkboxes are checked, you're ready to upload!
