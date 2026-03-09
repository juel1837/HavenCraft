/* ============================================
   HavenCraft — JavaScript
   API, Dark Mode, Copy IP, Mobile Menu,
   Gametag Login, Animations
   ============================================ */

const API_URL = 'https://api.mcsrvstat.us/3/hvn.bd';
const SERVER_IP = 'hvn.bd';
const REFRESH_INTERVAL = 30000;
const MC_HEAD_URL = 'https://mc-heads.net/avatar/';

// DOM Elements
const DOM = {
    playerCount: document.getElementById('playerCount'),
    playerMax: document.getElementById('playerMax'),
    playerCountLarge: document.getElementById('playerCountLarge'),
    statusBadge: document.getElementById('statusBadge'),
    statusText: document.getElementById('statusText'),
    statPlayers: document.getElementById('statPlayers'),
    statStatus: document.getElementById('statStatus'),
    statusIndicator: document.getElementById('statusIndicator'),
    themeToggle: document.getElementById('themeToggle'),
    hamburger: document.getElementById('hamburger'),
    navLinks: document.getElementById('navLinks'),
    navbar: document.getElementById('navbar'),
    toast: document.getElementById('toast'),
    // User / Gametag
    userBtn: document.getElementById('userBtn'),
    userDropdown: document.getElementById('userDropdown'),
    userHead: document.getElementById('userHead'),
    userIconDefault: document.getElementById('userIconDefault'),
    gametagInput: document.getElementById('gametagInput'),
    gametagSubmit: document.getElementById('gametagSubmit'),
    userLoggedIn: document.getElementById('userLoggedIn'),
    userDropdownAvatar: document.getElementById('userDropdownAvatar'),
    userDropdownName: document.getElementById('userDropdownName'),
    userLogout: document.getElementById('userLogout'),
    userMenuWrapper: document.getElementById('userMenuWrapper'),
};

/* ============================================
   SERVER API
   ============================================ */
async function fetchServerStatus() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();

        if (data.online) {
            const online = data.players?.online || 0;
            const max = data.players?.max || 0;
            updateUI(true, online, max);
        } else {
            updateUI(false, 0, 0);
        }
    } catch (error) {
        console.warn('Failed to fetch server status:', error);
        updateUI(false, 0, 0);
    }
}

function updateUI(isOnline, online, max) {
    if (!DOM.playerCount) return;

    if (isOnline) {
        DOM.playerCount.textContent = online;
        DOM.playerMax.textContent = max;
        DOM.playerCountLarge.innerHTML = `${online} <span>/ ${max}</span>`;
        DOM.statusBadge.className = 'status-badge';
        DOM.statusText.textContent = `Server Online • ${online} / ${max} Players`;

        DOM.statPlayers.textContent = `${online}+`;
        DOM.statStatus.innerHTML = '<span class="status-indicator status-indicator-lg"><span class="dot"></span> Online</span>';
        if (DOM.statusIndicator) DOM.statusIndicator.className = 'status-indicator status-indicator-lg';
    } else {
        DOM.playerCount.textContent = '—';
        DOM.playerMax.textContent = '—';
        DOM.playerCountLarge.innerHTML = `<span style="font-size:1.6rem">Server Offline</span>`;
        DOM.statusBadge.className = 'status-badge offline';
        DOM.statusText.textContent = 'Server Offline';

        DOM.statPlayers.textContent = '—';
        DOM.statStatus.innerHTML = '<span class="status-indicator status-indicator-lg offline"><span class="dot"></span> Offline</span>';
        if (DOM.statusIndicator) DOM.statusIndicator.className = 'status-indicator status-indicator-lg offline';
    }
}

fetchServerStatus();
setInterval(fetchServerStatus, REFRESH_INTERVAL);

/* ============================================
   COPY IP
   ============================================ */
function copyIP(element) {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
        showToast('✓ Server IP copied to clipboard!');

        if (element) {
            element.classList.add('copied');
            const textEl = element.querySelector('.copy-btn-text');
            const originalText = textEl ? textEl.textContent : '';

            if (textEl) textEl.textContent = 'Copied!';

            setTimeout(() => {
                element.classList.remove('copied');
                if (textEl) textEl.textContent = originalText;
            }, 2000);
        }
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = SERVER_IP;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✓ Server IP copied!');
    });
}

/* ============================================
   TOAST NOTIFICATION
   ============================================ */
function showToast(message) {
    DOM.toast.textContent = message;
    DOM.toast.classList.add('show');
    setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 2500);
}

/* ============================================
   DARK MODE
   ============================================ */
function initTheme() {
    const saved = localStorage.getItem('havencraft-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('havencraft-theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const icon = DOM.themeToggle.querySelector('.theme-icon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun theme-icon' : 'fa-solid fa-moon theme-icon';
    }
}

DOM.themeToggle.addEventListener('click', toggleTheme);
initTheme();

/* ============================================
   MOBILE MENU
   ============================================ */
DOM.hamburger.addEventListener('click', () => {
    DOM.hamburger.classList.toggle('active');
    DOM.navLinks.classList.toggle('open');
    document.body.style.overflow = DOM.navLinks.classList.contains('open') ? 'hidden' : '';
});

DOM.navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        DOM.hamburger.classList.remove('active');
        DOM.navLinks.classList.remove('open');
        document.body.style.overflow = '';
    });
});

/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */
window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
        DOM.navbar.classList.add('scrolled');
    } else {
        DOM.navbar.classList.remove('scrolled');
    }
}, { passive: true });

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
        observer.observe(el);
    });
}

initScrollReveal();

/* ============================================
   ACTIVE NAV LINK HIGHLIGHT
   ============================================ */
// Note: Handled statically on each page with class="active" in the HTML.

/* ============================================
   GAMETAG LOGIN SYSTEM
   ============================================ */
function initGametagLogin() {
    if (!DOM.userBtn || !DOM.gametagSubmit) return;

    // Toggle dropdown
    DOM.userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.userDropdown.classList.toggle('open');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!DOM.userMenuWrapper.contains(e.target)) {
            DOM.userDropdown.classList.remove('open');
        }
    });

    // Submit gametag
    DOM.gametagSubmit.addEventListener('click', () => {
        loginWithGametag();
    });

    DOM.gametagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginWithGametag();
    });

    // Logout
    DOM.userLogout.addEventListener('click', () => {
        logoutGametag();
    });

    // Check for stored gametag
    const stored = localStorage.getItem('havencraft-gametag');
    if (stored) {
        applyLogin(stored);
    }
}

function loginWithGametag() {
    const gametag = DOM.gametagInput.value.trim();
    if (!gametag || gametag.length < 3 || gametag.length > 16) {
        showToast('Please enter a valid Minecraft username (3-16 chars)');
        return;
    }

    localStorage.setItem('havencraft-gametag', gametag);
    applyLogin(gametag);
    showToast(`Welcome, ${gametag}!`);
}

function applyLogin(gametag) {
    const headUrl = MC_HEAD_URL + encodeURIComponent(gametag) + '/40';

    // Show head in navbar
    DOM.userHead.src = headUrl;
    DOM.userHead.alt = gametag;
    DOM.userHead.style.display = 'block';
    DOM.userIconDefault.style.display = 'none';

    // Update dropdown
    DOM.userDropdownAvatar.src = MC_HEAD_URL + encodeURIComponent(gametag) + '/80';
    DOM.userDropdownName.textContent = gametag;
    DOM.userLoggedIn.style.display = 'flex';
    DOM.gametagInput.parentElement.style.display = 'none';
    DOM.userDropdown.querySelector('.user-dropdown-header').textContent = 'Your Profile';
}

function logoutGametag() {
    localStorage.removeItem('havencraft-gametag');

    DOM.userHead.style.display = 'none';
    DOM.userIconDefault.style.display = 'block';

    DOM.userLoggedIn.style.display = 'none';
    DOM.gametagInput.parentElement.style.display = 'flex';
    DOM.gametagInput.value = '';
    DOM.userDropdown.querySelector('.user-dropdown-header').textContent = 'Login with Gametag';

    showToast('Logged out successfully');
    DOM.userDropdown.classList.remove('open');
}

initGametagLogin();
