// Banner Slideshow
let slideIndex = 0;
let slideTimer;
let banners = [];

async function loadBanners() {
    const container = document.querySelector('.banner-slideshow');
    if (!container) return;
    
    // Load from cache FIRST (instant!)
    const cached = localStorage.getItem('frontendBanners');
    if (cached) {
        try {
            banners = JSON.parse(cached);
            if (banners.length > 0) {
                renderBanners();
                showSlides();
                console.log('✅ Loaded banners from cache');
            }
        } catch (e) {}
    }
    
    // Then load from server and update
    try {
        const res = await fetch('/api/banners');
        banners = await res.json();
        localStorage.setItem('frontendBanners', JSON.stringify(banners)); // Cache it
        
        if (banners.length > 0) {
            clearTimeout(slideTimer);
            slideIndex = 0;
            renderBanners();
            showSlides();
        } else {
            container.innerHTML = '<div style="width:100%; height:400px; background:#000; display:flex; align-items:center; justify-content:center; color:#666;"><p>No banners available</p></div>';
        }
    } catch (e) {
        console.error('Error loading banners:', e);
        if (!cached) {
            container.innerHTML = '<div style="width:100%; height:400px; background:#000;"></div>';
        }
    }
}

function renderBanners() {
    const container = document.querySelector('.banner-slideshow');
    if (!container || banners.length === 0) return;

    const isMobile = window.innerWidth <= 768;
    
    container.innerHTML = banners.map((b, i) => `
        <div class="banner-slide ${i === 0 ? 'active' : ''}" data-transition="${b.transition}">
            ${b.link ? `<a href="${b.link}" target="_blank">` : ''}
                <img src="${isMobile ? b.mobileImage : b.desktopImage}" alt="Banner ${i + 1}">
            ${b.link ? '</a>' : ''}
        </div>
    `).join('') + `
        <div class="banner-dots">
            ${banners.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="currentSlide(${i + 1})"></span>`).join('')}
        </div>
    `;
}

function showSlides() {
    if (banners.length === 0) return;
    
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;
    
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].classList.add('active');
        dots[slideIndex - 1].classList.add('active');
    }
    
    const duration = banners[slideIndex - 1]?.duration || 5;
    slideTimer = setTimeout(showSlides, duration * 1000);
}

function currentSlide(n) {
    clearTimeout(slideTimer);
    slideIndex = n - 1;
    showSlides();
}

// Load contact info
async function loadContactInfo() {
    const contactDiv = document.getElementById('contactInfo');
    if (!contactDiv) return;
    
    // Load from cache FIRST (instant!)
    const cached = localStorage.getItem('frontendSettings');
    if (cached) {
        try {
            const settings = JSON.parse(cached);
            displayContactInfo(settings, contactDiv);
            console.log('✅ Loaded contact info from cache');
        } catch (e) {}
    }
    
    // Then load from server and update
    try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        localStorage.setItem('frontendSettings', JSON.stringify(settings)); // Cache it
        displayContactInfo(settings, contactDiv);
    } catch (e) {
        console.error('Error loading contact info:', e);
    }
}

function displayContactInfo(settings, contactDiv) {
    let contactHTML = '';
    if (settings.contactEmail) {
        contactHTML += `<a href="mailto:${settings.contactEmail}" class="contact-btn"><i class="fas fa-envelope"></i> Email</a>`;
    }
    if (settings.contactFacebook) {
        contactHTML += `<a href="${settings.contactFacebook}" target="_blank" class="contact-btn"><i class="fab fa-facebook"></i> Facebook</a>`;
    }
    if (settings.contactTiktok) {
        contactHTML += `<a href="${settings.contactTiktok}" target="_blank" class="contact-btn"><i class="fab fa-tiktok"></i> TikTok</a>`;
    }
    if (settings.contactTelegram) {
        contactHTML += `<a href="${settings.contactTelegram}" target="_blank" class="contact-btn"><i class="fab fa-telegram"></i> Telegram</a>`;
    }
    if (settings.contactWhatsapp) {
        contactHTML += `<a href="https://wa.me/${settings.contactWhatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="contact-btn"><i class="fab fa-whatsapp"></i> WhatsApp</a>`;
    }
    if (settings.contactPhone) {
        contactHTML += `<a href="tel:${settings.contactPhone}" class="contact-btn"><i class="fas fa-phone"></i> ${settings.contactPhone}</a>`;
    }

    if (contactHTML) {
        contactDiv.innerHTML = contactHTML;
    }
}

// Load banners and contact info on page load
loadBanners();
loadContactInfo();

// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const downloadBtn = document.getElementById('downloadBtn');
const loadingModal = document.getElementById('loadingModal');
const resultModal = document.getElementById('resultModal');
const resultContent = document.getElementById('resultContent');
const closeBtn = document.querySelector('.close');

// Event Listeners
downloadBtn.addEventListener('click', handleDownload);
videoUrlInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleDownload());
closeBtn.addEventListener('click', () => resultModal.style.display = 'none');
window.addEventListener('click', (e) => e.target === resultModal && (resultModal.style.display = 'none'));

// Check if URL is valid
function isValidVideoUrl(url) {
    return /youtube|youtu\.be|tiktok|facebook|fb\.watch|instagram|twitter|x\.com/.test(url);
}

// Main download handler
async function handleDownload() {
    const url = videoUrlInput.value.trim();
    
    if (!url) return showError('Please enter a video URL');
    if (!isValidVideoUrl(url)) return showError('Please enter a valid URL');

    showLoading();
    updateLoadingMessage('Fetching video info...');
    
    try {
        const res = await fetch('/api/video-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        hideLoading();
        showOptions(url, data);
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// Show download options
function showOptions(url, data) {
    const buttons = data.formats.map(f => `
        <button class="quality-btn" onclick="startDownload('${url}', '${f.quality}', event)">
            <i class="fas fa-${f.quality.includes('MP3') ? 'music' : 'download'}"></i>
            ${f.quality}
        </button>
    `).join('');

    resultContent.innerHTML = `
        <div class="result-success">
            <div id="progress" style="display:none; margin-bottom:1.5rem; padding:1rem; background:rgba(0,0,0,0.3); border-radius:10px;">
                <div style="width:100%; height:40px; background:rgba(255,255,255,0.1); border-radius:20px; overflow:hidden; margin-bottom:0.5rem;">
                    <div id="progress-bar" style="height:100%; width:0%; background:linear-gradient(45deg, rgb(var(--primary-rgb)), rgb(var(--secondary-rgb))); transition:width 0.3s; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:1.1rem;"></div>
                </div>
                <p id="progress-text" style="text-align:center; color:var(--text-primary); font-weight:600; margin:0;"></p>
            </div>
            <div class="result-header">
                <i class="fas fa-video" style="color: rgb(var(--secondary-rgb)); font-size: 2rem;"></i>
                <h3>${data.title}</h3>
            </div>
            <div class="download-options">
                <h4>Choose Quality:</h4>
                <div class="quality-buttons">${buttons}</div>
            </div>
        </div>
    `;
    resultModal.style.display = 'block';
}

// Start download
async function startDownload(url, quality, event) {
    const btn = event.target.closest('.quality-btn');
    const originalText = btn.innerHTML;
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
        btn.disabled = true;
        if (progress) progress.style.display = 'block';

        const res = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, quality })
        });

        if (!res.ok) throw new Error((await res.json()).error);

        const total = parseInt(res.headers.get('Content-Length'));
        const reader = res.body.getReader();
        const chunks = [];
        let loaded = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            chunks.push(value);
            loaded += value.length;
            
            if (total) {
                const percent = Math.round((loaded / total) * 100);
                if (progressBar) {
                    progressBar.style.width = percent + '%';
                    progressBar.textContent = percent + '%';
                }
                if (progressText) progressText.textContent = `Downloading... ${(loaded / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB`;
                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${percent}%`;
            }
        }

        const blob = new Blob(chunks);
        const filename = res.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'video.mp4';
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);

        btn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
        btn.style.background = 'linear-gradient(45deg, #00ff00, #00cc00)';
        if (progressText) progressText.textContent = 'Complete!';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
            if (progress) progress.style.display = 'none';
        }, 3000);
    } catch (error) {
        btn.innerHTML = '<i class="fas fa-times"></i> Failed';
        btn.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
        if (progressText) progressText.textContent = 'Failed: ' + error.message;
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
        }, 3000);
    }
}

// Show loading
function showLoading() {
    loadingModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hide loading
function hideLoading() {
    loadingModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Update loading message
function updateLoadingMessage(msg) {
    const p = loadingModal.querySelector('p');
    if (p) p.textContent = msg;
}

// Show error
function showError(msg) {
    hideLoading();
    resultContent.innerHTML = `
        <div class="result-error">
            <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <h3>Error</h3>
            <p>${msg}</p>
            <button class="retry-btn" onclick="resultModal.style.display='none'">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
    resultModal.style.display = 'block';
}

// Color cycling
let colorIndex = 0;
const colors = ['255, 0, 150', '0, 255, 255', '255, 255, 0', '150, 0, 255', '255, 100, 0', '0, 255, 150'];
setInterval(() => {
    document.documentElement.style.setProperty('--primary-rgb', colors[colorIndex]);
    colorIndex = (colorIndex + 1) % colors.length;
}, 3000);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    });
});

// Add CSS for error/success styles
const style = document.createElement('style');
style.textContent = `
    .result-error { text-align: center; }
    .error-icon { font-size: 3rem; color: #ff4444; margin-bottom: 1rem; }
    .result-error h3 { color: var(--text-primary); margin-bottom: 1rem; }
    .result-error p { color: var(--text-secondary); margin-bottom: 2rem; }
    .retry-btn { padding: 0.8rem 2rem; background: linear-gradient(45deg, #ff4444, #ff6666); border: none; border-radius: 25px; color: white; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin: 0 auto; }
    .retry-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 68, 68, 0.4); }
    .quality-btn { width: 100%; padding: 1rem; background: linear-gradient(45deg, rgb(var(--primary-rgb)), rgb(var(--secondary-rgb))); border: none; border-radius: 25px; color: white; cursor: pointer; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s; }
    .quality-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(var(--primary-rgb), 0.4); }
    .quality-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`;
document.head.appendChild(style);

// Load contact info with social icons
async function loadContactInfo() {
    try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        const socialDiv = document.getElementById('socialIcons');
        if (!socialDiv) return;

        let socialHTML = '';
        
        if (settings.contactFacebook) {
            socialHTML += `
                <a href="${settings.contactFacebook}" target="_blank" class="social-icon">
                    <div class="social-icon-circle"><i class="fab fa-facebook-f"></i></div>
                    <span class="social-icon-label">Facebook</span>
                </a>`;
        }
        if (settings.contactTiktok) {
            socialHTML += `
                <a href="${settings.contactTiktok}" target="_blank" class="social-icon">
                    <div class="social-icon-circle"><i class="fab fa-tiktok"></i></div>
                    <span class="social-icon-label">TikTok</span>
                </a>`;
        }
        if (settings.contactTelegram) {
            socialHTML += `
                <a href="${settings.contactTelegram}" target="_blank" class="social-icon">
                    <div class="social-icon-circle"><i class="fab fa-telegram-plane"></i></div>
                    <span class="social-icon-label">Telegram</span>
                </a>`;
        }
        if (settings.contactWhatsapp) {
            socialHTML += `
                <a href="https://wa.me/${settings.contactWhatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="social-icon">
                    <div class="social-icon-circle"><i class="fab fa-whatsapp"></i></div>
                    <span class="social-icon-label">WhatsApp</span>
                </a>`;
        }
        if (settings.contactPhone) {
            socialHTML += `
                <a href="tel:${settings.contactPhone}" class="social-icon">
                    <div class="social-icon-circle"><i class="fas fa-phone"></i></div>
                    <span class="social-icon-label">Phone</span>
                </a>`;
        }
        if (settings.contactEmail) {
            socialHTML += `
                <a href="mailto:${settings.contactEmail}" class="social-icon">
                    <div class="social-icon-circle"><i class="fas fa-envelope"></i></div>
                    <span class="social-icon-label">Email</span>
                </a>`;
        }

        if (socialHTML) {
            socialDiv.innerHTML = socialHTML;
        } else {
            socialDiv.innerHTML = '<p style="color: var(--text-secondary);">No contact information available yet.</p>';
        }
    } catch (e) {
        console.error('Error loading contact info:', e);
    }
}

// Load contact info on page load
loadContactInfo();
