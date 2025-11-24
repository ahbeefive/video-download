const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { exec } = require("child_process");
const execAsync = promisify(exec);
const multer = require("multer");
const { connectDB, Settings, Banner } = require("./database");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok", 
        platform: process.platform,
        ytdlp: YT_DLP,
        ffmpeg: FFMPEG
    });
});

const DATA_DIR = path.join(__dirname, "data");
const DOWNLOAD_DIR = path.join(__dirname, "downloads");
const BANNERS_DIR = path.join(__dirname, "banners");
const BANNERS_FILE = path.join(DATA_DIR, "banners.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// Initialize directories
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);
if (!fs.existsSync(BANNERS_DIR)) fs.mkdirSync(BANNERS_DIR);

// Initialize data files if they don't exist
if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
        maxBanners: 3,
        contactFacebook: '',
        contactTiktok: '',
        contactTelegram: '',
        contactPhone: '',
        contactEmail: '',
        contactWhatsapp: ''
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    console.log('✅ Created default settings.json');
}

if (!fs.existsSync(BANNERS_FILE)) {
    const defaultBanners = [
        {
            desktopImage: '/images/banners/banner1.jpg',
            mobileImage: '/images/banners/banner1.jpg',
            link: '',
            duration: 5,
            transition: 'fade',
            enabled: true
        },
        {
            desktopImage: '/images/banners/banner2.jpg',
            mobileImage: '/images/banners/banner2.jpg',
            link: '',
            duration: 5,
            transition: 'fade',
            enabled: true
        },
        {
            desktopImage: '/images/banners/banner3.gif',
            mobileImage: '/images/banners/banner3.gif',
            link: '',
            duration: 5,
            transition: 'fade',
            enabled: true
        }
    ];
    fs.writeFileSync(BANNERS_FILE, JSON.stringify(defaultBanners, null, 2));
    console.log('✅ Created default banners.json');
}

// Admin credentials (change these!)
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";
const ADMIN_TOKEN = "admin_token_static_12345";

// Cloudinary setup for banner storage (optional - set env vars to enable)
const cloudinary = require('cloudinary').v2;
const useCloudinary = process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary enabled for banner storage');
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, BANNERS_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

// SIMPLE: Load banners from file only
function loadBanners() {
    try {
        if (fs.existsSync(BANNERS_FILE)) {
            const data = JSON.parse(fs.readFileSync(BANNERS_FILE, 'utf8'));
            console.log('✅ Loaded', data.length, 'banners');
            return data;
        }
    } catch (e) {
        console.error('❌ Error loading banners:', e.message);
    }
    
    // Create defaults if file doesn't exist
    const defaults = [
        {
            desktopImage: '/images/banners/banner1.jpg',
            mobileImage: '/images/banners/banner1.jpg',
            link: '',
            duration: 5,
            transition: 'fade',
            enabled: true
        }
    ];
    saveBanners(defaults);
    return defaults;
}

// SIMPLE: Save banners to file only
function saveBanners(banners) {
    try {
        fs.writeFileSync(BANNERS_FILE, JSON.stringify(banners, null, 2));
        console.log('✅ Saved', banners.length, 'banners');
        return true;
    } catch (e) {
        console.error('❌ Error saving banners:', e.message);
        return false;
    }
}

// SIMPLE: Load settings from file only
function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
            console.log('✅ Loaded settings');
            return data;
        }
    } catch (e) {
        console.error('❌ Error loading settings:', e.message);
    }
    
    // Create defaults if file doesn't exist
    const defaults = { 
        maxBanners: 3,
        contactFacebook: '',
        contactTiktok: '',
        contactTelegram: '',
        contactPhone: '',
        contactEmail: '',
        contactWhatsapp: ''
    };
    saveSettings(defaults);
    return defaults;
}

// SIMPLE: Save settings to file only
function saveSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        console.log('✅ Saved settings');
        return true;
    } catch (e) {
        console.error('❌ Error saving settings:', e.message);
        return false;
    }
}



// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (token === ADMIN_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
}

// Paths to executables (use system binaries on Linux/Render, local on Windows)
const isWindows = process.platform === 'win32';
const YT_DLP = isWindows ? path.join(__dirname, "yt-dlp.exe") : "yt-dlp";
const FFMPEG = isWindows ? path.join(__dirname, "ffmpeg.exe") : "ffmpeg";

// Auto-cleanup: Delete files older than 1 hour
function cleanupOldFiles() {
    try {
        const files = fs.readdirSync(DOWNLOAD_DIR);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        files.forEach(file => {
            const filePath = path.join(DOWNLOAD_DIR, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtimeMs > oneHour) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Cleaned up: ${file}`);
            }
        });
    } catch (err) {
        console.error("Cleanup error:", err.message);
    }
}

setInterval(cleanupOldFiles, 30 * 60 * 1000);
cleanupOldFiles();

function detectPlatform(url) {
    if (/youtu\.?be/.test(url)) return "youtube";
    if (/tiktok/.test(url)) return "tiktok";
    if (/facebook|fb\.watch/.test(url)) return "facebook";
    if (/instagram/.test(url)) return "instagram";
    if (/twitter|x\.com/.test(url)) return "twitter";
    return "unknown";
}

app.post("/api/video-info", async (req, res) => {
    const { url } = req.body;
    console.log("📥 Video info request:", url);
    
    if (!url) return res.status(400).json({ error: "URL required" });

    const platform = detectPlatform(url);
    console.log("🎬 Platform:", platform);

    try {
        // For YouTube, get title quickly with extra options to bypass restrictions
        if (platform === "youtube") {
            try {
                const cmd = isWindows 
                    ? `"${YT_DLP}" --no-playlist --get-title --no-check-certificate --user-agent "Mozilla/5.0" "${url}"`
                    : `${YT_DLP} --no-playlist --get-title --no-check-certificate --user-agent "Mozilla/5.0" "${url}"`;
                    
                const { stdout } = await execAsync(cmd, { timeout: 5000 });
                const title = stdout.trim();
                console.log("✅ Title:", title);

                const formats = [
                    { quality: "360p" },
                    { quality: "480p" },
                    { quality: "720p" },
                    { quality: "1080p" },
                    { quality: "MP3 Audio" },
                ];

                return res.json({ success: true, title, formats });
            } catch (e) {
                console.log("⚠️ Could not get title, using default");
                return res.json({ 
                    success: true, 
                    title: "YouTube Video", 
                    formats: [
                        { quality: "360p" },
                        { quality: "480p" },
                        { quality: "720p" },
                        { quality: "1080p" },
                        { quality: "MP3 Audio" },
                    ]
                });
            }
        }

        // For other platforms, return immediately
        res.json({ 
            success: true, 
            title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`, 
            formats: [{ quality: "Best Quality" }] 
        });
    } catch (e) {
        console.error("❌ Error:", e.message);
        res.status(500).json({ error: "Failed to fetch video info" });
    }
});

app.post("/api/download", async (req, res) => {
    try {
        const { url, quality } = req.body;
        const platform = detectPlatform(url);
        
        console.log("📥 Download:", quality, "-", url);
        
        if (!url) return res.status(400).json({ error: "URL required" });

        // Get video title for filename
        let cleanTitle = "video";
        try {
            const titleCmd = isWindows 
                ? `"${YT_DLP}" --no-playlist --get-title "${url}"`
                : `${YT_DLP} --no-playlist --get-title "${url}"`;
            const { stdout } = await execAsync(titleCmd, { timeout: 5000 });
            cleanTitle = stdout.trim()
                .replace(/[^\w\s-]/g, '_')  // Replace special chars
                .replace(/\s+/g, '_')        // Replace spaces with underscore
                .substring(0, 80);           // Limit length
            console.log("📝 Title:", cleanTitle);
        } catch (e) {
            console.log("⚠️ Could not get title, using default");
            cleanTitle = `video_${Date.now()}`;
        }

        const timestamp = Date.now();
        const fileBase = `${cleanTitle}_${timestamp}`;

        // MP3 Audio Download - Fast extraction with YouTube bypass
        if (quality === "MP3 Audio") {
            const outputPath = path.join(DOWNLOAD_DIR, `${fileBase}.mp3`);
            const cmd = isWindows
                ? `"${YT_DLP}" --no-playlist -f "bestaudio" -x --audio-format mp3 --audio-quality 5 --no-check-certificate --user-agent "Mozilla/5.0" --ffmpeg-location "${FFMPEG}" -o "${outputPath}" "${url}"`
                : `${YT_DLP} --no-playlist -f "bestaudio" -x --audio-format mp3 --audio-quality 5 --no-check-certificate --user-agent "Mozilla/5.0" -o "${outputPath}" "${url}"`;

            console.log("🎵 Downloading MP3...");
            await execAsync(cmd, { timeout: 180000, maxBuffer: 1024 * 1024 * 1024 });

            if (!fs.existsSync(outputPath)) throw new Error("Download failed");

            res.download(outputPath, `${cleanTitle}.mp3`, (err) => {
                setTimeout(() => {
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                }, 5000);
                if (err) console.error("❌ Error:", err);
                else console.log("✅ MP3 sent");
            });
            return;
        }

        // Video Download - Direct download without compression for speed
        const outputPath = path.join(DOWNLOAD_DIR, `${fileBase}.mp4`);
        
        let formatStr = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
        
        if (quality === "360p") {
            formatStr = "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]";
        } else if (quality === "480p") {
            formatStr = "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]";
        } else if (quality === "720p") {
            formatStr = "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]";
        } else if (quality === "1080p") {
            formatStr = "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]";
        } else if (quality === "4K") {
            formatStr = "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160][ext=mp4]/best[height<=2160]";
        }

        // Download video directly - FAST with YouTube bypass
        const downloadCmd = isWindows
            ? `"${YT_DLP}" --no-playlist -f "${formatStr}" --merge-output-format mp4 --no-check-certificate --user-agent "Mozilla/5.0" --ffmpeg-location "${FFMPEG}" -o "${outputPath}" "${url}"`
            : `${YT_DLP} --no-playlist -f "${formatStr}" --merge-output-format mp4 --no-check-certificate --user-agent "Mozilla/5.0" -o "${outputPath}" "${url}"`;
        
        console.log(`🎥 Downloading ${quality}...`);
        await execAsync(downloadCmd, { timeout: 300000, maxBuffer: 1024 * 1024 * 1024 });

        if (!fs.existsSync(outputPath)) throw new Error("Download failed");

        res.download(outputPath, `${cleanTitle}.mp4`, (err) => {
            setTimeout(() => {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, 5000);
            if (err) console.error("❌ Error:", err);
            else console.log(`✅ ${quality} sent`);
        });

    } catch (err) {
        console.error("❌ Download error:", err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: "Download failed. Try again." });
        }
    }
});

// Admin routes
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

app.get("/api/admin/banners", authMiddleware, (req, res) => {
    const banners = loadBanners();
    res.json(banners);
});

app.post("/api/admin/banners", authMiddleware, upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('📥 Banner upload request received');
        console.log('Files:', req.files);
        console.log('Body:', req.body);
        
        if (!req.files || !req.files.desktopImage || !req.files.mobileImage) {
            return res.status(400).json({ error: 'Both desktop and mobile images are required' });
        }
        
        let desktopUrl = '/banners/' + req.files.desktopImage[0].filename;
        let mobileUrl = '/banners/' + req.files.mobileImage[0].filename;
        
        // Upload to Cloudinary if enabled
        if (useCloudinary) {
            try {
                const desktopUpload = await cloudinary.uploader.upload(req.files.desktopImage[0].path, {
                    folder: 'video-downloader/banners'
                });
                const mobileUpload = await cloudinary.uploader.upload(req.files.mobileImage[0].path, {
                    folder: 'video-downloader/banners'
                });
                desktopUrl = desktopUpload.secure_url;
                mobileUrl = mobileUpload.secure_url;
                
                // Delete local files after upload
                fs.unlinkSync(req.files.desktopImage[0].path);
                fs.unlinkSync(req.files.mobileImage[0].path);
            } catch (e) {
                console.log('Cloudinary upload failed, using local storage');
            }
        }
        
        const banners = loadBanners();
        const newBanner = {
            desktopImage: desktopUrl,
            mobileImage: mobileUrl,
            link: req.body.link || '',
            duration: parseInt(req.body.duration) || 5,
            transition: req.body.transition || 'fade',
            enabled: true
        };
        banners.push(newBanner);
        saveBanners(banners);
        console.log('✅ Banner added');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Banner upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/admin/banners/:index/toggle", authMiddleware, (req, res) => {
    const banners = loadBanners();
    const index = parseInt(req.params.index);
    if (banners[index]) {
        banners[index].enabled = !banners[index].enabled;
        saveBanners(banners);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Banner not found" });
    }
});

app.delete("/api/admin/banners/:index", authMiddleware, (req, res) => {
    const banners = loadBanners();
    const index = parseInt(req.params.index);
    if (banners[index]) {
        // Delete files (only if local storage)
        if (!useCloudinary) {
            try {
                fs.unlinkSync(path.join(__dirname, banners[index].desktopImage));
                fs.unlinkSync(path.join(__dirname, banners[index].mobileImage));
            } catch (e) {}
        }
        banners.splice(index, 1);
        saveBanners(banners);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Banner not found" });
    }
});

app.get("/api/banners", (req, res) => {
    const settings = loadSettings();
    const banners = loadBanners();
    const filtered = banners.filter(b => b.enabled).slice(0, settings.maxBanners);
    res.json(filtered);
});

app.get("/api/admin/settings", authMiddleware, (req, res) => {
    const settings = loadSettings();
    res.json(settings);
});

app.post("/api/admin/settings", authMiddleware, (req, res) => {
    saveSettings(req.body);
    res.json({ success: true });
});

app.put("/api/admin/banners/:index", authMiddleware, (req, res) => {
    const banners = loadBanners();
    const index = parseInt(req.params.index);
    if (banners[index]) {
        banners[index].link = req.body.link || '';
        banners[index].duration = parseInt(req.body.duration) || 5;
        banners[index].transition = req.body.transition || 'fade';
        saveBanners(banners);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Banner not found" });
    }
});

app.get("/api/settings", (req, res) => {
    const settings = loadSettings();
    res.json(settings);
});

const PORT = process.env.PORT || 3000;

// Start server (no database needed!)
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Data stored in: ${DATA_DIR}`);
});

// Try to connect to database in background (optional)
connectDB().catch(() => {
    console.log('ℹ️  Running without database (using file storage)');
});
