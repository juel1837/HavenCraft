// script.js
// Vanilla JavaScript - No frameworks

// Mobile Hamburger
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Animate hamburger lines
    if (hamburger.classList.contains('active')) {
        hamburger.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        hamburger.children[1].style.opacity = '0';
        hamburger.children[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        hamburger.children[0].style.transform = 'none';
        hamburger.children[1].style.opacity = '1';
        hamburger.children[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking links
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#hero' && this.getAttribute('href') !== '#') {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Copy IP Function
function copyIP() {
    const ip = "hvn.bd:25666";
    navigator.clipboard.writeText(ip).then(() => {
        const tooltip = document.getElementById('tooltip');
        tooltip.textContent = "✅ Copied!";
        tooltip.style.opacity = '1';
        
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.textContent = "Copied!";
            }, 300);
        }, 1800);
    });
}

// Minecraft Server Status API (mcsrvstat.us - reliable & CORS friendly)
const SERVER_ADDRESS = "hvn.bd:25666";
const API_URL = `https://api.mcsrvstat.us/2/${SERVER_ADDRESS}`;

async function fetchServerStatus() {
    const loading = document.getElementById('status-loading');
    const content = document.getElementById('status-content');
    
    loading.style.display = 'block';
    content.style.display = 'none';
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        loading.style.display = 'none';
        content.style.display = 'block';
        
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const playersCount = document.getElementById('players-count');
        const motdContainer = document.getElementById('motd-display');
        
        if (data.online) {
            indicator.style.color = '#22c55e';
            statusText.textContent = 'Online';
            indicator.querySelector('.dot').style.background = '#22c55e';
            indicator.querySelector('.dot').style.boxShadow = '0 0 25px #22c55e';
            
            const online = data.players?.online || 0;
            const max = data.players?.max || 100;
            playersCount.textContent = `${online} / ${max}`;
            
            // MOTD
            motdContainer.innerHTML = '';
            if (data.motd && data.motd.clean) {
                const motdText = data.motd.clean.join('<br>');
                const p = document.createElement('p');
                p.innerHTML = motdText;
                p.style.fontStyle = 'italic';
                p.style.opacity = '0.9';
                motdContainer.appendChild(p);
            }
        } else {
            indicator.style.color = '#ef4444';
            statusText.textContent = 'Offline';
            indicator.querySelector('.dot').style.background = '#ef4444';
            playersCount.textContent = '0 / 0';
            motdContainer.innerHTML = '<p style="color:#ef4444">Server is currently offline</p>';
        }
        
    } catch (error) {
        console.error("Status fetch error:", error);
        loading.style.display = 'none';
        content.style.display = 'block';
        
        const motdContainer = document.getElementById('motd-display');
        motdContainer.innerHTML = `
            <p style="color:#f59e0b">Unable to fetch status right now.<br>
            <small>Please try again later</small></p>`;
    }
}

// Refresh button
function refreshStatus() {
    fetchServerStatus();
}

// Lightbox
let currentImageIndex = 0;
const galleryImages = [
    "https://picsum.photos/id/1015/1200/800",
    "https://picsum.photos/id/160/1200/800",
    "https://picsum.photos/id/201/1200/800",
    "https://picsum.photos/id/251/1200/800"
];

function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    
    lightboxImg.src = galleryImages[index];
    lightbox.style.display = 'flex';
    
    // Close on escape
    document.addEventListener('keydown', handleEsc);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.removeEventListener('keydown', handleEsc);
}

function handleEsc(e) {
    if (e.key === 'Escape') closeLightbox();
}

// Click outside lightbox to close
document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target.id === 'lightbox') closeLightbox();
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Fetch server status on load
    fetchServerStatus();
    
    // Optional: auto refresh every 60 seconds
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            fetchServerStatus();
        }
    }, 60000);
    
    // Keyboard support for copy
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault();
            copyIP();
        }
    });
    
    console.log('%c✅ HavenCraft website loaded successfully!', 'color:#4ade80; font-size:14px; font-weight:bold');
});
