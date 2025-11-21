/**
 * Main Application Entry Point
 * Jengu AI Website - Refactored and Modularized
 *
 * @author Claude Code Refactor
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Throttle utility for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, delay) => {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

// ============================================================================
// INTERSECTION OBSERVERS
// ============================================================================

/**
 * Creates an observer for generic scroll animations
 * @returns {IntersectionObserver}
 */
function createScrollAnimationObserver() {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target._observer?.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
}

/**
 * Creates an observer for stat card animations
 * @returns {IntersectionObserver}
 */
function createStatCardObserver() {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        entry.target._observer?.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
}

/**
 * Observe elements with a given observer
 * @param {string} selector - CSS selector for elements
 * @param {IntersectionObserver} observer - Observer instance
 */
function observeElements(selector, observer) {
  document.querySelectorAll(selector).forEach(el => {
    el._observer = observer;
    observer.observe(el);
  });
}

// ============================================================================
// BURGER MENU ANIMATION (GSAP)
// ============================================================================

const MOBILE_BREAKPOINT = 768;
const DESKTOP_SLIDE_DISTANCE = -280;

/**
 * Initialize burger menu animations
 */
function initBurgerMenu() {
  const burgerMenu = document.getElementById('burgerMenu');
  const burgerDropdown = document.getElementById('burgerDropdown');
  const navRight = document.getElementById('navRight');

  if (!burgerMenu || !burgerDropdown || !navRight) {
    console.error('Burger menu elements not found');
    return;
  }

  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded - burger menu animations disabled');
    return;
  }

  const dropdownLinks = burgerDropdown.querySelectorAll('a');
  let isAnimating = false;

  function openBurgerDropdown() {
    if (isAnimating) return;
    isAnimating = true;

    burgerMenu.classList.add('active');
    burgerDropdown.classList.add('active');
    navRight.classList.add('dropdown-active');

    gsap.set(burgerDropdown, { display: 'flex', opacity: 0, y: -20 });
    gsap.set(dropdownLinks, { opacity: 0, x: -20 });

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const slideDistance = isMobile ? 0 : DESKTOP_SLIDE_DISTANCE;

    const tl = gsap.timeline({
      onComplete: () => { isAnimating = false; }
    });

    if (!isMobile) {
      tl.to(navRight, { x: slideDistance, duration: 0.35, ease: 'power2.out' }, 0);
    }

    tl.to(burgerDropdown, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.2)' }, 0.08);
    tl.to(dropdownLinks, { opacity: 1, x: 0, duration: 0.25, stagger: 0.015, ease: 'power2.out' }, 0.12);
  }

  function closeBurgerDropdown() {
    if (isAnimating) return;
    isAnimating = true;

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    const tl = gsap.timeline({
      onComplete: () => {
        burgerMenu.classList.remove('active');
        burgerDropdown.classList.remove('active');
        navRight.classList.remove('dropdown-active');
        gsap.set(burgerDropdown, { display: 'none' });
        isAnimating = false;
      }
    });

    tl.to(dropdownLinks, { opacity: 0, x: -10, duration: 0.2, stagger: 0.02, ease: 'power2.in' }, 0);
    tl.to(burgerDropdown, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' }, 0.1);

    if (!isMobile) {
      tl.to(navRight, { x: 0, duration: 0.4, ease: 'power2.inOut' }, 0.15);
    }
  }

  burgerMenu.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    burgerMenu.classList.contains('active') ? closeBurgerDropdown() : openBurgerDropdown();
  });

  document.addEventListener('click', (e) => {
    if (burgerDropdown && !burgerDropdown.contains(e.target) && !burgerMenu.contains(e.target)) {
      closeBurgerDropdown();
    }
  });

  dropdownLinks.forEach(link => {
    link.addEventListener('click', () => setTimeout(closeBurgerDropdown, 100));
  });
}

// ============================================================================
// SCROLL EFFECTS
// ============================================================================

/**
 * Initialize navbar scroll effects
 */
function initNavbarScrollEffect() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let scrolled = false;

  const handleScroll = throttle(() => {
    const isScrolled = window.scrollY > 50;

    if (isScrolled !== scrolled) {
      scrolled = isScrolled;
      navbar.classList.toggle('scrolled', isScrolled);
    }

    const heroHome = document.querySelector('.hero-home');
    if (heroHome && window.innerWidth <= 1024) {
      const scrollProgress = Math.min(window.scrollY / 500, 1);
      heroHome.style.setProperty('--scroll-opacity', scrollProgress);
    }
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Initialize smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Initialize stagger animation delays for feature cards
 */
function initFeatureCardStagger() {
  document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.15}s`;
  });
}

// ============================================================================
// VIDEO AUTOPLAY (iOS Fix)
// ============================================================================

/**
 * Initialize video autoplay for mobile devices
 */
function initVideoAutoplay() {
  const mobileVideo = document.getElementById('bg-video');
  if (!mobileVideo || window.innerWidth > 1024) return;

  mobileVideo.muted = true;
  mobileVideo.defaultMuted = true;
  mobileVideo.setAttribute('muted', '');
  mobileVideo.setAttribute('playsinline', '');

  const attemptPlay = () => {
    const playPromise = mobileVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  };

  mobileVideo.addEventListener('loadeddata', attemptPlay, { once: true });
  mobileVideo.addEventListener('canplay', attemptPlay, { once: true });
  mobileVideo.load();

  const playOnInteraction = () => {
    mobileVideo.play();
    document.removeEventListener('touchstart', playOnInteraction, true);
    document.removeEventListener('click', playOnInteraction, true);
    document.removeEventListener('scroll', playOnInteraction, true);
  };

  document.addEventListener('touchstart', playOnInteraction, { once: true, capture: true });
  document.addEventListener('click', playOnInteraction, { once: true, capture: true });
  document.addEventListener('scroll', playOnInteraction, { once: true, capture: true });
}

// ============================================================================
// CALCULATOR MODAL
// ============================================================================

const MODAL_TRANSITION_DURATION = 400;

/**
 * Handle calculator click - modal on desktop, page on mobile
 */
function handleCalculatorClick(e) {
  if (e) e.preventDefault();

  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    window.location.href = '/calculator';
    return;
  }

  openCalculatorModal();
}

/**
 * Open calculator modal
 */
function openCalculatorModal() {
  const overlay = document.getElementById('calculatorModalOverlay');
  if (!overlay) return;

  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

/**
 * Close calculator modal
 */
function closeCalculatorModal() {
  const overlay = document.getElementById('calculatorModalOverlay');
  if (!overlay) return;

  overlay.classList.remove('active');
  setTimeout(() => {
    if (!overlay.classList.contains('active')) {
      overlay.style.display = 'none';
    }
  }, MODAL_TRANSITION_DURATION);
  document.body.style.overflow = 'auto';
}

// Make globally accessible
window.handleCalculatorClick = handleCalculatorClick;
window.openCalculatorModal = openCalculatorModal;
window.closeCalculatorModal = closeCalculatorModal;

// ============================================================================
// FEATURE MODAL
// ============================================================================

/**
 * Open feature modal with dynamic content
 */
function openFeatureModal(featureId) {
  const overlay = document.getElementById('featureModalOverlay');
  if (!overlay) return;

  const featureData = window.featureData || {};
  const data = featureData[featureId];
  if (!data) return;

  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalBenefits = document.getElementById('modalBenefits');
  const modalStats = document.getElementById('modalStats');

  if (modalIcon) modalIcon.innerHTML = `<i class="fas ${data.icon}"></i>`;
  if (modalTitle) modalTitle.textContent = data.title;
  if (modalSubtitle) modalSubtitle.textContent = data.subtitle;

  if (modalBenefits) {
    modalBenefits.innerHTML = data.benefits.map(benefit => `
      <div class="feature-benefit-item">
        <div class="feature-benefit-icon">${benefit.icon}</div>
        <div class="feature-benefit-text">
          <strong>${benefit.title}</strong>
          <p>${benefit.desc}</p>
        </div>
      </div>
    `).join('');
  }

  if (modalStats) {
    modalStats.innerHTML = data.stats.map(stat => `
      <div class="feature-stat">
        <span class="feature-stat-value">${stat.value}</span>
        <span class="feature-stat-label">${stat.label}</span>
      </div>
    `).join('');
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close feature modal
 */
function closeFeatureModal() {
  const overlay = document.getElementById('featureModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Make globally accessible
window.openFeatureModal = openFeatureModal;
window.closeFeatureModal = closeFeatureModal;

// ============================================================================
// MODAL MANAGER (Centralized Event Handling)
// ============================================================================

/**
 * Initialize global modal event listeners
 */
function initModalManager() {
  // Close modals on overlay click
  document.addEventListener('click', (e) => {
    const calcOverlay = document.getElementById('calculatorModalOverlay');
    const featureOverlay = document.getElementById('featureModalOverlay');
    const bookingOverlay = document.getElementById('bookingModalOverlay');

    if (calcOverlay && e.target === calcOverlay) closeCalculatorModal();
    if (featureOverlay && e.target === featureOverlay) closeFeatureModal();
    if (bookingOverlay && e.target === bookingOverlay && window.closeBookingModal) {
      window.closeBookingModal();
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCalculatorModal();
      closeFeatureModal();
      if (window.closeBookingModal) window.closeBookingModal();
    }
  });
}

/**
 * Initialize calculator modal close button
 */
function initCalculatorModalButton() {
  const calcCloseBtn = document.getElementById('calculatorModalClose');
  if (calcCloseBtn) {
    calcCloseBtn.addEventListener('click', closeCalculatorModal);
  }
}

// ============================================================================
// SCROLL ANIMATIONS INITIALIZATION
// ============================================================================

/**
 * Initialize all scroll-based animations
 */
function initScrollAnimations() {
  const scrollObserver = createScrollAnimationObserver();
  observeElements('.animate-on-scroll', scrollObserver);

  const statObserver = createStatCardObserver();
  observeElements('.stat-card', statObserver);

  const roiPreview = document.getElementById('roiPreview');
  if (roiPreview) {
    const roiObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        entries[0].target.classList.add('animate');
        roiObserver.disconnect();
      }
    }, { threshold: 0.5 });
    roiObserver.observe(roiPreview);
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize all application features
 */
function init() {
  initBurgerMenu();
  initNavbarScrollEffect();
  initSmoothScroll();
  initFeatureCardStagger();
  initScrollAnimations();
  initVideoAutoplay();
  initCalculatorModalButton();
  initModalManager();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Booking Modal Functions are defined in BookingModal.astro component
