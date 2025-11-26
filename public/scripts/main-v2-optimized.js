/**
 * MAIN-THREAD OPTIMIZED ENTRY POINT v2.0
 * Jengu AI Website - Performance Engineering Edition
 *
 * Architecture:
 * - ZERO synchronous work on DOMContentLoaded (critical path only)
 * - Scheduler-based task yielding to prevent long tasks (>50ms)
 * - requestIdleCallback for all non-critical work
 * - Batched DOM operations with DocumentFragment
 * - Lazy event listener attachment
 * - GSAP loaded only on interaction (deferred ~48KB)
 *
 * Target: Reduce TBT from 24,240ms to <500ms
 */

'use strict';

// ============================================================================
// SCHEDULER - Yields to browser every 4ms to prevent blocking
// ============================================================================

const scheduler = {
  /**
   * Check if we should yield to let browser paint/respond
   * Chrome's rendering budget is ~16ms, we yield at 4ms for safety
   */
  shouldYield: (() => {
    // Use scheduler.yield() if available (Chrome 115+)
    if ('scheduler' in window && 'yield' in window.scheduler) {
      return () => false; // Will use native yield
    }
    let lastYield = performance.now();
    return () => (performance.now() - lastYield) > 4;
  })(),

  /**
   * Yield to browser - allows paint, input, etc.
   */
  yieldToMain: (() => {
    // Modern: scheduler.yield() (Chrome 115+)
    if ('scheduler' in window && 'yield' in window.scheduler) {
      return () => window.scheduler.yield();
    }
    // Fallback: setTimeout 0 (forces macrotask queue flush)
    return () => new Promise(r => setTimeout(r, 0));
  })(),

  /**
   * Run a task, yielding periodically to prevent long tasks
   * @param {Function} task - Task to run
   * @param {string} name - Task name for debugging
   */
  async runTask(task, name = 'anonymous') {
    const start = performance.now();
    try {
      await task();
    } catch (e) {
      console.error(`[Scheduler] Task "${name}" failed:`, e);
    }
    const duration = performance.now() - start;
    if (duration > 50) {
      console.warn(`[Scheduler] Long task "${name}": ${duration.toFixed(1)}ms`);
    }
  },

  /**
   * Process array items with yielding (prevents blocking loops)
   * @param {Array} items - Items to process
   * @param {Function} processor - Function to call on each item
   * @param {number} chunkSize - Items per chunk before yield
   */
  async processWithYielding(items, processor, chunkSize = 5) {
    for (let i = 0; i < items.length; i++) {
      processor(items[i], i);
      if ((i + 1) % chunkSize === 0 && scheduler.shouldYield()) {
        await scheduler.yieldToMain();
      }
    }
  }
};

// ============================================================================
// UTILITIES - Optimized for V8
// ============================================================================

/**
 * Throttle with RAF (smoother than setTimeout)
 */
const throttleRAF = (fn) => {
  let rafId = null;
  return (...args) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
};

/**
 * Throttle with time limit
 */
const throttle = (fn, limit = 100) => {
  let lastRun = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      lastRun = now;
      fn(...args);
    }
  };
};

/**
 * DOM query cache - prevents repeated querySelector calls
 */
const domCache = new Map();
const $ = (selector) => {
  if (!domCache.has(selector)) {
    domCache.set(selector, document.querySelector(selector));
  }
  return domCache.get(selector);
};

const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Clear DOM cache (call after dynamic content changes)
 */
const clearDOMCache = () => domCache.clear();

// ============================================================================
// CRITICAL PATH - Runs synchronously, must be <16ms total
// ============================================================================

/**
 * Critical: Navbar scroll effect (affects perceived LCP)
 * Budget: <5ms
 */
function initNavbarCritical() {
  const navbar = $('#navbar');
  if (!navbar) return;

  let isScrolled = false;

  // Use passive listener + RAF throttle for smooth 60fps
  const handleScroll = throttleRAF(() => {
    const shouldBeScrolled = window.scrollY > 50;
    if (shouldBeScrolled !== isScrolled) {
      isScrolled = shouldBeScrolled;
      navbar.classList.toggle('scrolled', isScrolled);
    }
  });

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Critical: Expose global functions immediately for onclick handlers
 * Budget: <1ms
 */
function exposeGlobals() {
  // These must exist immediately for onclick attributes in HTML
  window.openBookingModal = window.openBookingModal || (() => {
    // Will be replaced by actual implementation when loaded
    console.log('Booking modal loading...');
  });

  window.handleCalculatorClick = (e) => {
    if (e) e.preventDefault();
    if (window.innerWidth <= 768) {
      window.location.href = '/calculator';
    } else {
      openCalculatorModal();
    }
  };

  window.openCalculatorModal = () => {
    const overlay = $('#calculatorModalOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  };

  window.closeCalculatorModal = () => {
    const overlay = $('#calculatorModalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    setTimeout(() => {
      if (!overlay.classList.contains('active')) {
        overlay.style.display = 'none';
      }
    }, 400);
    document.body.style.overflow = '';
  };

  window.openFeatureModal = () => {}; // Lazy loaded
  window.closeFeatureModal = () => {
    const overlay = $('#featureModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
}

// ============================================================================
// DEFERRED INITIALIZATION - Runs during idle time
// ============================================================================

/**
 * Initialize scroll animations using IntersectionObserver
 * Runs in idle time, processes elements in chunks
 */
async function initScrollAnimationsDeferred() {
  const elements = $$('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    // Batch DOM writes in RAF for smoothness
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('animate-hidden');
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Process with yielding to prevent long task
  await scheduler.processWithYielding(
    Array.from(elements),
    (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top >= window.innerHeight) {
        el.classList.add('animate-hidden');
      }
      observer.observe(el);
    },
    10
  );
}

/**
 * Initialize stat card animations
 */
function initStatCardsDeferred() {
  const observer = new IntersectionObserver((entries) => {
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'slideInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
          observer.unobserve(entry.target);
        }
      });
    });
  }, { threshold: 0.5 });

  $$('.stat-card').forEach(el => observer.observe(el));
}

/**
 * Initialize feature card stagger delays
 */
function initFeatureCardStagger() {
  $$('.feature-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.15}s`;
  });
}

/**
 * Initialize ROI preview animation
 */
function initROIPreview() {
  const roiPreview = $('#roiPreview');
  if (!roiPreview) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      entries[0].target.classList.add('animate');
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(roiPreview);
}

/**
 * Initialize smooth scroll for anchor links
 */
function initSmoothScroll() {
  // Use event delegation instead of per-element listeners
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, { passive: false });
}

/**
 * Initialize modal close handlers using event delegation
 */
function initModalHandlers() {
  // Single click handler for all modal overlays
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Close calculator modal on overlay click
    if (target.id === 'calculatorModalOverlay') {
      window.closeCalculatorModal();
    }
    // Close feature modal on overlay click
    if (target.id === 'featureModalOverlay') {
      window.closeFeatureModal();
    }
    // Close booking modal on overlay click
    if (target.id === 'bookingModalOverlay' && window.closeBookingModal) {
      window.closeBookingModal();
    }
    // Calculator close button
    if (target.id === 'calculatorModalClose' || target.closest('#calculatorModalClose')) {
      window.closeCalculatorModal();
    }
  });

  // Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeCalculatorModal();
      window.closeFeatureModal();
      if (window.closeBookingModal) window.closeBookingModal();
    }
  });
}

/**
 * Initialize video autoplay (mobile only)
 */
function initVideoAutoplay() {
  const video = $('#bg-video');
  if (!video || window.innerWidth > 1024) return;

  video.muted = true;
  video.playsInline = true;

  const play = () => {
    video.play().catch(() => {});
  };

  video.addEventListener('loadeddata', play, { once: true });
  video.addEventListener('canplay', play, { once: true });

  // Play on first interaction
  const playOnce = () => {
    video.play();
    document.removeEventListener('touchstart', playOnce, true);
    document.removeEventListener('click', playOnce, true);
  };
  document.addEventListener('touchstart', playOnce, { once: true, capture: true, passive: true });
  document.addEventListener('click', playOnce, { once: true, capture: true });
}

/**
 * Initialize mobile hero parallax (only on mobile)
 */
function initMobileHeroParallax() {
  if (window.innerWidth > 1024) return;

  const heroHome = $('.hero-home');
  if (!heroHome) return;

  const handleScroll = throttle(() => {
    const progress = Math.min(window.scrollY / 500, 1);
    heroHome.style.setProperty('--scroll-opacity', progress);
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });
}

// ============================================================================
// GSAP BURGER MENU - Lazy loaded on first interaction
// ============================================================================

let gsapLoaded = false;
let gsapLoading = false;

/**
 * Load GSAP dynamically only when needed
 */
function loadGSAP() {
  if (gsapLoaded || gsapLoading) {
    return gsapLoaded ? Promise.resolve() : new Promise(r => {
      const check = setInterval(() => {
        if (gsapLoaded) { clearInterval(check); r(); }
      }, 50);
    });
  }

  gsapLoading = true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    script.onload = () => {
      gsapLoaded = true;
      gsapLoading = false;
      resolve();
    };
    script.onerror = () => {
      gsapLoading = false;
      resolve(); // Continue without GSAP
    };
    document.head.appendChild(script);
  });
}

/**
 * Initialize burger menu with CSS fallback
 */
function initBurgerMenu() {
  const burger = $('#burgerMenu');
  const dropdown = $('#burgerDropdown');
  const navRight = $('#navRight');

  if (!burger || !dropdown || !navRight) return;

  let isAnimating = false;
  const MOBILE_BP = 768;
  const SLIDE_DIST = -280;

  // CSS-only toggle (instant, no GSAP)
  const toggleCSS = (open) => {
    burger.classList.toggle('active', open);
    dropdown.classList.toggle('active', open);
    navRight.classList.toggle('dropdown-active', open);
    dropdown.style.display = open ? 'flex' : 'none';
  };

  // GSAP-powered toggle (smooth animations)
  const openGSAP = async () => {
    if (isAnimating || typeof gsap === 'undefined') return;
    isAnimating = true;

    const links = dropdown.querySelectorAll('a');
    const isMobile = window.innerWidth <= MOBILE_BP;

    burger.classList.add('active');
    dropdown.classList.add('active');
    navRight.classList.add('dropdown-active');

    gsap.set(dropdown, { display: 'flex', opacity: 0, y: -20 });
    gsap.set(links, { opacity: 0, x: -20 });

    const tl = gsap.timeline({ onComplete: () => { isAnimating = false; } });

    if (!isMobile) {
      tl.to(navRight, { x: SLIDE_DIST, duration: 0.35, ease: 'power2.out' }, 0);
    }
    tl.to(dropdown, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.2)' }, 0.08);
    tl.to(links, { opacity: 1, x: 0, duration: 0.25, stagger: 0.015, ease: 'power2.out' }, 0.12);
  };

  const closeGSAP = async () => {
    if (isAnimating || typeof gsap === 'undefined') return;
    isAnimating = true;

    const links = dropdown.querySelectorAll('a');
    const isMobile = window.innerWidth <= MOBILE_BP;

    const tl = gsap.timeline({
      onComplete: () => {
        burger.classList.remove('active');
        dropdown.classList.remove('active');
        navRight.classList.remove('dropdown-active');
        gsap.set(dropdown, { display: 'none' });
        isAnimating = false;
      }
    });

    tl.to(links, { opacity: 0, x: -10, duration: 0.2, stagger: 0.02, ease: 'power2.in' }, 0);
    tl.to(dropdown, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' }, 0.1);
    if (!isMobile) {
      tl.to(navRight, { x: 0, duration: 0.4, ease: 'power2.inOut' }, 0.15);
    }
  };

  // Click handler
  burger.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isActive = burger.classList.contains('active');

    if (!gsapLoaded) {
      // Use CSS fallback immediately, load GSAP in background
      toggleCSS(!isActive);
      loadGSAP(); // Don't await - let it load in background
    } else {
      // GSAP is ready
      if (isActive) {
        closeGSAP();
      } else {
        openGSAP();
      }
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!burger.classList.contains('active')) return;
    if (dropdown.contains(e.target) || burger.contains(e.target)) return;

    if (gsapLoaded && typeof gsap !== 'undefined') {
      closeGSAP();
    } else {
      toggleCSS(false);
    }
  });

  // Close on link click
  dropdown.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      setTimeout(() => {
        if (gsapLoaded && typeof gsap !== 'undefined') {
          closeGSAP();
        } else {
          toggleCSS(false);
        }
      }, 100);
    }
  });
}

// ============================================================================
// INITIALIZATION ORCHESTRATOR
// ============================================================================

/**
 * Run critical initialization synchronously (must be <16ms)
 */
function runCriticalInit() {
  const start = performance.now();

  exposeGlobals();      // <1ms
  initNavbarCritical(); // <5ms

  const duration = performance.now() - start;
  if (duration > 16) {
    console.warn(`[Perf] Critical init took ${duration.toFixed(1)}ms (budget: 16ms)`);
  }
}

/**
 * Run deferred initialization in idle time
 */
async function runDeferredInit() {
  // Priority 1: User interaction handlers (needed soon)
  await scheduler.runTask(initBurgerMenu, 'burger-menu');
  await scheduler.yieldToMain();

  await scheduler.runTask(initSmoothScroll, 'smooth-scroll');
  await scheduler.yieldToMain();

  await scheduler.runTask(initModalHandlers, 'modal-handlers');
  await scheduler.yieldToMain();

  // Priority 2: Visual enhancements (can wait)
  await scheduler.runTask(initScrollAnimationsDeferred, 'scroll-animations');
  await scheduler.yieldToMain();

  await scheduler.runTask(initStatCardsDeferred, 'stat-cards');
  await scheduler.yieldToMain();

  await scheduler.runTask(initFeatureCardStagger, 'feature-stagger');
  await scheduler.yieldToMain();

  await scheduler.runTask(initROIPreview, 'roi-preview');
  await scheduler.yieldToMain();

  // Priority 3: Optional enhancements
  await scheduler.runTask(initVideoAutoplay, 'video-autoplay');
  await scheduler.runTask(initMobileHeroParallax, 'hero-parallax');
}

/**
 * Schedule deferred work during idle time
 */
function scheduleDeferred(callback) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    // Fallback: run after a frame
    requestAnimationFrame(() => setTimeout(callback, 0));
  }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

// Run critical init immediately when script executes
// (script should have defer attribute, so DOM is ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    runCriticalInit();
    scheduleDeferred(runDeferredInit);
  });
} else {
  // DOM already loaded
  runCriticalInit();
  scheduleDeferred(runDeferredInit);
}
