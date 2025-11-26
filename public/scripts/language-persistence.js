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
    let currentPath = window.location.pathname;
    const currentLang = getCurrentLanguage();

    if (currentLang === targetLang) {
      return currentPath; // No change needed
    }

    // Normalize path - remove trailing slash unless it's root
    if (currentPath !== '/' && currentPath.endsWith('/')) {
      currentPath = currentPath.slice(0, -1);
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

    // Remove trailing slash from basePath unless it's root
    if (basePath !== '/' && basePath.endsWith('/')) {
      basePath = basePath.slice(0, -1);
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

    // Use event delegation for all link handling (single listener instead of per-link)
    // This reduces memory and prevents "keeps loading" feeling from many listener attachments
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Handle language switcher clicks
      const langSwitch = link.getAttribute('data-lang-switch');
      if (langSwitch) {
        e.preventDefault();
        const targetUrl = getLocalizedUrl(langSwitch);
        saveLanguagePreference(langSwitch);
        window.location.href = targetUrl;
        return;
      }

      // Handle internal navigation links
      if (!href.startsWith('/')) return;

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
