// Language Persistence System
(function() {
  'use strict';

  // Get current language from URL
  function getCurrentLanguage() {
    const path = window.location.pathname;
    if (path.startsWith('/fr/') || path === '/fr') return 'fr';
    if (path.startsWith('/es/') || path === '/es') return 'es';
    return 'en';
  }

  // Save language preference
  function saveLanguagePreference(lang) {
    localStorage.setItem('preferred_language', lang);
    document.documentElement.setAttribute('lang', lang);
  }

  // Get saved language preference
  function getSavedLanguage() {
    return localStorage.getItem('preferred_language') || 'en';
  }

  // Convert current URL to target language
  function getLocalizedUrl(targetLang) {
    const currentPath = window.location.pathname;
    const currentLang = getCurrentLanguage();

    if (currentLang === targetLang) {
      return currentPath; // No change needed
    }

    // Remove current language prefix
    let basePath = currentPath;
    if (currentPath.startsWith('/fr/')) {
      basePath = currentPath.substring(3);
    } else if (currentPath.startsWith('/es/')) {
      basePath = currentPath.substring(3);
    } else if (currentPath === '/fr' || currentPath === '/es') {
      basePath = '/';
    }

    // Ensure basePath starts with /
    if (!basePath.startsWith('/')) {
      basePath = '/' + basePath;
    }

    // Add target language prefix
    if (targetLang === 'en') {
      return basePath;
    } else if (targetLang === 'fr') {
      return basePath === '/' ? '/fr' : '/fr' + basePath;
    } else if (targetLang === 'es') {
      return basePath === '/' ? '/es' : '/es' + basePath;
    }

    return basePath;
  }

  // Initialize language persistence on page load
  function initLanguagePersistence() {
    const currentLang = getCurrentLanguage();
    const savedLang = getSavedLanguage();

    // If user explicitly navigated to a different language, save that as new preference
    if (currentLang !== savedLang) {
      saveLanguagePreference(currentLang);
    }

    // Set the lang attribute
    document.documentElement.setAttribute('lang', currentLang);

    // Add language switcher event listeners
    const languageSwitchers = document.querySelectorAll('[data-lang-switch]');

    languageSwitchers.forEach(switcher => {
      switcher.addEventListener('click', (e) => {
        e.preventDefault();
        const targetLang = switcher.getAttribute('data-lang-switch');
        const targetUrl = getLocalizedUrl(targetLang);

        // Save preference and navigate
        saveLanguagePreference(targetLang);
        window.location.href = targetUrl;
      });
    });

    // Intercept all internal navigation links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip if it's a hash link, already has language prefix, or is an API route
        if (href.startsWith('#') || href.startsWith('/fr/') || href.startsWith('/es/') || href.startsWith('/api/')) {
          return;
        }

        // If we're in a non-English language mode, convert the link
        if (currentLang !== 'en' && !href.startsWith('/' + currentLang)) {
          e.preventDefault();
          const localizedHref = href === '/' ? '/' + currentLang : '/' + currentLang + href;
          window.location.href = localizedHref;
        }
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguagePersistence);
  } else {
    initLanguagePersistence();
  }

  // Auto-redirect to preferred language on homepage
  if (window.location.pathname === '/' || window.location.pathname === '') {
    const savedLang = getSavedLanguage();
    const currentLang = getCurrentLanguage();
    if (savedLang !== 'en' && savedLang !== currentLang) {
      window.location.href = '/' + savedLang;
    }
  }
})();
