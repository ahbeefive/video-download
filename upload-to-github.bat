@echo off
echo ========================================
echo   UPLOADING TO GITHUB
echo ========================================
echo.

echo [1/6] Initializing Git...
git init
echo.

echo [2/6] Adding all files...
git add .
echo.

echo [3/6] Creating commit...
git commit -m "Initial commit: Video downloader"
echo.

echo [4/6] Connecting to GitHub...
git remote add origin https://github.com/ahbeefive/video-download.git
echo.

echo [5/6] Setting main branch...
git branch -M main
echo.

echo [6/6] Pushing to GitHub...
git push -u origin main
echo.

echo ========================================
echo   UPLOAD COMPLETE!
echo ========================================
echo.
echo Your code is now on GitHub at:
echo https://github.com/ahbeefive/video-download
echo.
pause
