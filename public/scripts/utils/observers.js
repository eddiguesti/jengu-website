/**
 * Intersection Observer utilities for scroll animations
 */

/**
 * Creates an observer for generic scroll animations
 * @returns {IntersectionObserver}
 */
export function createScrollAnimationObserver() {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after animating to improve performance
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
export function createStatCardObserver() {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statCard = entry.target;
        statCard.style.animation = 'slideInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        entry.target._observer?.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
}

/**
 * Creates an observer for ROI preview animation
 * @param {HTMLElement} element - Element to observe
 * @param {Function} callback - Callback when element intersects
 */
export function createROIObserver(element, callback) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      callback(entries[0].target);
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(element);
  return observer;
}

/**
 * Observe elements with a given observer
 * @param {string} selector - CSS selector for elements
 * @param {IntersectionObserver} observer - Observer instance
 */
export function observeElements(selector, observer) {
  document.querySelectorAll(selector).forEach(el => {
    el._observer = observer;
    observer.observe(el);
  });
}
