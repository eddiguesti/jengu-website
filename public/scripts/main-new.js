/**
 * Main Application Entry Point
 * Orchestrates all interactive features and animations
 */

'use strict';

import { initBurgerMenu } from './animations/burger-menu.js';
import {
  initNavbarScrollEffect,
  initSmoothScroll,
  initFeatureCardStagger
} from './animations/scroll-effects.js';
import {
  createScrollAnimationObserver,
  createStatCardObserver,
  createROIObserver,
  observeElements
} from './utils/observers.js';
import { initVideoAutoplay } from './utils/video-autoplay.js';
import {
  initCalculatorModal
} from './modals/calculator-modal.js';
import { initFeatureModal } from './modals/feature-modal.js';
import { initModalManager } from './modals/modal-manager.js';

/**
 * Initialize all scroll-based animations
 */
function initScrollAnimations() {
  // Generic scroll animations
  const scrollObserver = createScrollAnimationObserver();
  observeElements('.animate-on-scroll', scrollObserver);

  // Stat card animations
  const statObserver = createStatCardObserver();
  observeElements('.stat-card', statObserver);

  // ROI preview animation
  const roiPreview = document.getElementById('roiPreview');
  if (roiPreview) {
    createROIObserver(roiPreview, (target) => {
      target.classList.add('animate');
    });
  }
}

/**
 * Initialize all application features
 */
function init() {
  // Animation systems
  initBurgerMenu();
  initNavbarScrollEffect();
  initSmoothScroll();
  initFeatureCardStagger();
  initScrollAnimations();

  // Video autoplay (iOS fix)
  initVideoAutoplay();

  // Modal systems
  initCalculatorModal();
  initFeatureModal();
  initModalManager();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
