const mongoose = require('mongoose');

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/video-downloader';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        // Continue without DB - fallback to file system
    }
};

// Settings Schema
const settingsSchema = new mongoose.Schema({
    key: { type: String, default: 'main', unique: true },
    maxBanners: { type: Number, default: 3 },
    contactFacebook: { type: String, default: '' },
    contactTiktok: { type: String, default: '' },
    contactTelegram: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactWhatsapp: { type: String, default: '' }
}, { timestamps: true });

// Banner Schema
const bannerSchema = new mongoose.Schema({
    desktopImage: { type: String, required: true },
    mobileImage: { type: String, required: true },
    link: { type: String, default: '' },
    duration: { type: Number, default: 5 },
    transition: { type: String, default: 'fade' },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
const Banner = mongoose.model('Banner', bannerSchema);

module.exports = { connectDB, Settings, Banner };
