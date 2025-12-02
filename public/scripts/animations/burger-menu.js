/**
 * Burger Menu GSAP Animation Module
 * Handles the animated burger dropdown menu with desktop/mobile responsive behavior
 */

const MOBILE_BREAKPOINT = 768;
const DESKTOP_SLIDE_DISTANCE = -280;

/**
 * Initialize burger menu animations
 */
export function initBurgerMenu() {
  const burgerMenu = document.getElementById('burgerMenu');
  const burgerDropdown = document.getElementById('burgerDropdown');
  const navRight = document.getElementById('navRight');

  if (!burgerMenu || !burgerDropdown || !navRight) {
    console.error('Burger menu elements not found');
    return;
  }

  // Check if GSAP is loaded
  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded - burger menu animations disabled');
    return;
  }

  const dropdownLinks = burgerDropdown.querySelectorAll('a');
  let isAnimating = false;

  /**
   * Open burger dropdown with GSAP animation
   */
  function openBurgerDropdown() {
    if (isAnimating) return;
    isAnimating = true;

    // Add active state classes
    burgerMenu.classList.add('active');
    burgerDropdown.classList.add('active');
    navRight.classList.add('dropdown-active');

    // Set initial animation state
    gsap.set(burgerDropdown, {
      display: 'flex',
      opacity: 0,
      y: -20
    });
    gsap.set(dropdownLinks, {
      opacity: 0,
      x: -20
    });

    // Responsive behavior: no slide on mobile, slide on desktop
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const slideDistance = isMobile ? 0 : DESKTOP_SLIDE_DISTANCE;

    // Create animation timeline
    const tl = gsap.timeline({
      onComplete: () => { isAnimating = false; }
    });

    // Desktop only: Animate pill sliding left
    if (!isMobile) {
      tl.to(navRight, {
        x: slideDistance,
        duration: 0.35,
        ease: 'power2.out'
      }, 0);
    }

    // Animate dropdown appearance with elastic ease
    tl.to(burgerDropdown, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: 'back.out(1.2)'
    }, 0.08);

    // Stagger animate links
    tl.to(dropdownLinks, {
      opacity: 1,
      x: 0,
      duration: 0.25,
      stagger: 0.015,
      ease: 'power2.out'
    }, 0.12);
  }

  /**
   * Close burger dropdown with GSAP animation
   */
  function closeBurgerDropdown() {
    if (isAnimating) return;
    isAnimating = true;

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    // Create close animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        burgerMenu.classList.remove('active');
        burgerDropdown.classList.remove('active');
        navRight.classList.remove('dropdown-active');
        gsap.set(burgerDropdown, { display: 'none' });
        isAnimating = false;
      }
    });

    // Fade out links with stagger
    tl.to(dropdownLinks, {
      opacity: 0,
      x: -10,
      duration: 0.2,
      stagger: 0.02,
      ease: 'power2.in'
    }, 0);

    // Fade and slide up dropdown
    tl.to(burgerDropdown, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in'
    }, 0.1);

    // Desktop only: Slide pill back
    if (!isMobile) {
      tl.to(navRight, {
        x: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      }, 0.15);
    }
  }

  // Toggle on burger button click
  burgerMenu.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isActive = burgerMenu.classList.contains('active');
    isActive ? closeBurgerDropdown() : openBurgerDropdown();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (burgerDropdown && !burgerDropdown.contains(e.target) && !burgerMenu.contains(e.target)) {
      closeBurgerDropdown();
    }
  });

  // Close when clicking a link
  dropdownLinks.forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeBurgerDropdown, 100);
    });
  });
}
