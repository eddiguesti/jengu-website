/**
 * Calculator Modal Module
 * Handles calculator modal behavior - modal on desktop, redirect on mobile
 */

const MOBILE_BREAKPOINT = 768;
const MODAL_TRANSITION_DURATION = 400;

/**
 * Handle calculator click - modal on desktop, page on mobile
 * @param {Event} e - Click event
 */
export function handleCalculatorClick(e) {
  if (e) e.preventDefault();

  // Mobile: redirect to dedicated page
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    window.location.href = '/calculator';
    return;
  }

  // Desktop: open modal
  openCalculatorModal();
}

/**
 * Open calculator modal (desktop only)
 */
export function openCalculatorModal() {
  const overlay = document.getElementById('calculatorModalOverlay');
  if (!overlay) return;

  // Set display first, then trigger animation in next frame
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

/**
 * Close calculator modal
 */
export function closeCalculatorModal() {
  const overlay = document.getElementById('calculatorModalOverlay');
  if (!overlay) return;

  overlay.classList.remove('active');

  // Wait for fade out animation before hiding
  setTimeout(() => {
    if (!overlay.classList.contains('active')) {
      overlay.style.display = 'none';
    }
  }, MODAL_TRANSITION_DURATION);

  document.body.style.overflow = 'auto';
}

/**
 * Initialize calculator modal event listeners
 */
export function initCalculatorModal() {
  // Close button handler
  const calcCloseBtn = document.getElementById('calculatorModalClose');
  if (calcCloseBtn) {
    calcCloseBtn.addEventListener('click', closeCalculatorModal);
  }

  // Make functions globally accessible
  window.handleCalculatorClick = handleCalculatorClick;
  window.openCalculatorModal = openCalculatorModal;
  window.closeCalculatorModal = closeCalculatorModal;
}
