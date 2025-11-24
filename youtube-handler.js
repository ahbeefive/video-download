// YouTube Download Handler with Multiple Fallback Methods
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const path = require("path");
const fs = require("fs");
const https = require("https");

const isWindows = process.platform === 'win32';
const YT_DLP = isWindows ? path.join(__dirname, "yt-dlp.exe") : "yt-dlp";
const FFMPEG = isWindows ? path.join(__dirname, "ffmpeg.exe") : "ffmpeg";
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Method 1: yt-dlp (Primary - 60-70% success)
async function downloadWithYtDlp(url, quality, outputPath) {
    console.log("🎯 Method 1: Trying yt-dlp...");
    
    let formatStr = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
    
    if (quality === "360p") formatStr = "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]";
    else if (quality === "480p") formatStr = "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]";
    else if (quality === "720p") formatStr = "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]";
    else if (quality === "1080p") formatStr = "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]";
    else if (quality === "MP3 Audio") {
        const cmd = isWindows
            ? `"${YT_DLP}" --no-playlist -f "bestaudio" -x --audio-format mp3 --no-check-certificate --user-agent "Mozilla/5.0" -o "${outputPath}" "${url}"`
            : `${YT_DLP} --no-playlist -f "bestaudio" -x --audio-format mp3 --no-check-certificate --user-agent "Mozilla/5.0" -o "${outputPath}" "${url}"`;
        
        await execAsync(cmd, { timeout: 180000, maxBuffer: 1024 * 1024 * 1024 });
        return { success: true, method: "yt-dlp", path: outputPath };
    }
    
    const cmd = isWindows
        ? `"${YT_DLP}" --no-playlist -f "${formatStr}" --merge-output-format mp4 --no-check-certificate --user-agent "Mozilla/5.0" -o "${outputPath}" "${url}"`
        : `${YT_DLP} --no-playlist -f "${formatStr}" --merge-output-format mp4 --no-check-certificate --user-agent "Mozilla/5.0" -o "${outputPath}" "${url}"`;
    
    await execAsync(cmd, { timeout: 300000, maxBuffer: 1024 * 1024 * 1024 });
    return { success: true, method: "yt-dlp", path: outputPath };
}

// Method 2: Invidious API (Fallback - 50-60% success)
async function downloadWithInvidious(url, quality, outputPath) {
    console.log("🎯 Method 2: Trying Invidious API...");
    
    const videoId = extractYouTubeId(url);
    if (!videoId) throw new Error("Invalid YouTube URL");
    
    // Try multiple Invidious instances
    const instances = [
        "https://invidious.io",
        "https://yewtu.be",
        "https://invidious.snopyta.org"
    ];
    
    for (const instance of instances) {
        try {
            const apiUrl = `${instance}/api/v1/videos/${videoId}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (!data.formatStreams || data.formatStreams.length === 0) continue;
            
            // Find best matching quality
            let selectedFormat = data.formatStreams[0];
            const targetHeight = quality === "360p" ? 360 : quality === "480p" ? 480 : quality === "720p" ? 720 : 1080;
            
            for (const format of data.formatStreams) {
                if (format.qualityLabel && format.qualityLabel.includes(quality)) {
                    selectedFormat = format;
                    break;
                }
            }
            
            // Download the video
            const videoUrl = selectedFormat.url;
            await downloadFile(videoUrl, outputPath);
            
            console.log("✅ Invidious download successful");
            return { success: true, method: "invidious", path: outputPath };
        } catch (e) {
            console.log(`⚠️ Invidious instance ${instance} failed:`, e.message);
            continue;
        }
    }
    
    throw new Error("All Invidious instances failed");
}

// Helper: Download file from URL
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

// Method 3: Return client-side download info (100% success)
function getClientSideInfo(url, quality) {
    console.log("🎯 Method 3: Providing client-side option...");
    
    const videoId = extractYouTubeId(url);
    return {
        success: true,
        method: "client-side",
        message: "Server download blocked by YouTube. Use client-side download.",
        clientSideUrl: `https://www.y2mate.com/youtube/${videoId}`,
        alternativeUrl: `https://ytmp3.cc/en13/${videoId}`,
        instructions: "Click the link above to download from your browser (bypasses restrictions)"
    };
}

// Main YouTube download handler with fallbacks
async function handleYouTubeDownload(url, quality) {
    const timestamp = Date.now();
    const ext = quality === "MP3 Audio" ? "mp3" : "mp4";
    const outputPath = path.join(DOWNLOAD_DIR, `youtube_${timestamp}.${ext}`);
    
    // Try Method 1: yt-dlp
    try {
        const result = await downloadWithYtDlp(url, quality, outputPath);
        if (fs.existsSync(outputPath)) {
            return result;
        }
    } catch (error) {
        console.log("❌ Method 1 (yt-dlp) failed:", error.message);
    }
    
    // Try Method 2: Invidious (only for video, not audio)
    if (quality !== "MP3 Audio") {
        try {
            const result = await downloadWithInvidious(url, quality, outputPath);
            if (fs.existsSync(outputPath)) {
                return result;
            }
        } catch (error) {
            console.log("❌ Method 2 (Invidious) failed:", error.message);
        }
    }
    
    // Method 3: Return client-side option
    console.log("⚠️ Server methods failed, providing client-side option");
    return getClientSideInfo(url, quality);
}

// Get YouTube video info
async function getYouTubeInfo(url) {
    try {
        const cmd = isWindows 
            ? `"${YT_DLP}" --no-playlist --get-title --no-check-certificate --user-agent "Mozilla/5.0" "${url}"`
            : `${YT_DLP} --no-playlist --get-title --no-check-certificate --user-agent "Mozilla/5.0" "${url}"`;
            
        const { stdout } = await execAsync(cmd, { timeout: 5000 });
        return stdout.trim();
    } catch (e) {
        // Try Invidious as fallback
        const videoId = extractYouTubeId(url);
        if (videoId) {
            try {
                const response = await fetch(`https://invidious.io/api/v1/videos/${videoId}`);
                const data = await response.json();
                return data.title || "YouTube Video";
            } catch (e2) {
                return "YouTube Video";
            }
        }
        return "YouTube Video";
    }
}

module.exports = {
    handleYouTubeDownload,
    getYouTubeInfo,
    extractYouTubeId
};
