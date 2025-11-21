/**
 * Scroll Effects Module
 * Handles navbar scroll state, parallax effects, and smooth scrolling
 */

import { throttle } from '../utils/throttle.js';

/**
 * Initialize navbar scroll effects
 */
export function initNavbarScrollEffect() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let scrolled = false;

  const handleScroll = throttle(() => {
    const isScrolled = window.scrollY > 50;

    if (isScrolled !== scrolled) {
      scrolled = isScrolled;
      navbar.classList.toggle('scrolled', isScrolled);
    }

    // Parallax color transition on mobile
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
export function initSmoothScroll() {
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
export function initFeatureCardStagger() {
  document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.15}s`;
  });
}
