/**
 * Modal Manager Module
 * Centralized modal event handling (overlay clicks, escape key, etc.)
 */

import { closeCalculatorModal } from './calculator-modal.js';
import { closeFeatureModal } from './feature-modal.js';

/**
 * Initialize global modal event listeners
 */
export function initModalManager() {
  // Close modals on overlay click
  document.addEventListener('click', handleOverlayClick);

  // Close modals on Escape key
  document.addEventListener('keydown', handleEscapeKey);
}

/**
 * Handle overlay click events for all modals
 * @param {MouseEvent} e - Click event
 */
function handleOverlayClick(e) {
  const calcOverlay = document.getElementById('calculatorModalOverlay');
  const featureOverlay = document.getElementById('featureModalOverlay');
  const bookingOverlay = document.getElementById('bookingModalOverlay');

  if (calcOverlay && e.target === calcOverlay) {
    closeCalculatorModal();
  }

  if (featureOverlay && e.target === featureOverlay) {
    closeFeatureModal();
  }

  if (bookingOverlay && e.target === bookingOverlay && window.closeBookingModal) {
    window.closeBookingModal();
  }
}

/**
 * Handle Escape key to close all modals
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeCalculatorModal();
    closeFeatureModal();
    if (window.closeBookingModal) {
      window.closeBookingModal();
    }
  }
}
