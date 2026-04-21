// ========================================
// Language System - EN/VI (JSON-based)
// ========================================

let translations = {};
let currentLang = localStorage.getItem('lang') || 'en';

// Get base path for locales
function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        return '../locales/';
    }
    return 'locales/';
}

// Load translations from JSON
async function loadTranslations(lang) {
    try {
        const basePath = getBasePath();
        const response = await fetch(`${basePath}${lang}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        translations = await response.json();
        applyLanguage();
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback: try to load English
        if (lang !== 'en') {
            loadTranslations('en');
        }
    }
}

// Apply translations to DOM
function applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            // Use innerHTML if translation contains HTML tags
            if (translations[key].includes('<')) {
                el.innerHTML = translations[key];
            } else {
                el.textContent = translations[key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    document.documentElement.lang = currentLang;

    // Dispatch event for indicator recalculation after text changes
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('languageChanged'));
    }, 50);
}

// Toggle language
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'vi' : 'en';
    localStorage.setItem('lang', currentLang);
    loadTranslations(currentLang);

    updateSwitchState();
}

function updateSwitchState() {
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
        if (currentLang === 'vi') {
            langSwitch.classList.remove('en');
            langSwitch.classList.add('vi');
        } else {
            langSwitch.classList.remove('vi');
            langSwitch.classList.add('en');
        }
    }
}

// Initialize language system
function initLanguage() {
    const langSwitch = document.getElementById('langSwitch');

    if (langSwitch) {
        updateSwitchState();
        langSwitch.onclick = toggleLanguage;
    }

    // Load current language
    loadTranslations(currentLang);
}

// Export for use
window.initLanguage = initLanguage;
window.toggleLanguage = toggleLanguage;
