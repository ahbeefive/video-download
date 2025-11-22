# 🎥 VideoGrab - Video Downloader

Download videos from YouTube, TikTok, Facebook, Instagram, and Twitter without watermarks!

## ✨ Features

- 📥 Download from multiple platforms (YouTube, TikTok, Facebook, Instagram, Twitter)
- 🎬 Multiple quality options (360p, 480p, 720p, 1080p, 4K)
- 🎵 MP3 audio extraction
- 📱 Mobile responsive design
- 🎨 Admin panel for banner management
- 📞 Customizable contact information
- ⚡ Fast and reliable

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Start server:**
```bash
npm start
```

3. **Open browser:**
```
http://localhost:3000
```

### Admin Panel

```
URL: http://localhost:3000/admin.html
Username: admin
Password: admin123
```

## 📦 Deployment

### Deploy to Render.com

1. **Push to GitHub**
2. **Connect to Render.com**
3. **Render will automatically:**
   - Install Node.js dependencies
   - Install yt-dlp
   - Install ffmpeg
   - Start the server

### Environment Variables (Optional)

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string (optional)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name (optional)
- `CLOUDINARY_API_KEY` - Cloudinary API key (optional)
- `CLOUDINARY_API_SECRET` - Cloudinary API secret (optional)

## 📁 Project Structure

```
├── server.js           # Main server file
├── index.html          # Frontend homepage
├── admin.html          # Admin panel
├── script.js           # Frontend JavaScript
├── styles.css          # Styles
├── database.js         # Database models
├── data/               # Data storage
│   ├── settings.json   # Settings
│   └── banners.json    # Banners
├── banners/            # Uploaded banners
├── downloads/          # Temporary downloads
└── images/             # Static images
```

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (optional) + JSON files
- **Download:** yt-dlp, ffmpeg
- **Frontend:** Vanilla JavaScript, CSS

## 📝 Admin Features

- Upload/edit/delete banner ads
- Set maximum active banners
- Add contact information (Facebook, TikTok, Telegram, Phone, Email, WhatsApp)
- Enable/disable banners
- Set banner duration and transitions

## 🔧 Configuration

### Change Admin Credentials

Edit `server.js`:
```javascript
const ADMIN_USER = "admin";
const ADMIN_PASS = "your_password";
```

### Data Storage

Data is stored in:
- `data/settings.json` - Settings and contact info
- `data/banners.json` - Banner configurations
- `banners/` - Uploaded banner images

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## ⚠️ Disclaimer

This tool is for educational purposes. Please respect copyright laws and terms of service of the platforms you download from.

## 🌟 Support

If you find this project helpful, please give it a star on GitHub!
