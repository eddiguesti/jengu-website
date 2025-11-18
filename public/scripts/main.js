'use strict';

// Utility: Throttle function for performance
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

// Burger Menu & Sidebar Controls
document.addEventListener('DOMContentLoaded', () => {
  const burgerMenu = document.getElementById('burgerMenu');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarClose = document.getElementById('sidebarClose');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    if (burgerMenu) burgerMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    if (burgerMenu) burgerMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Event listeners for sidebar
  if (burgerMenu) {
    burgerMenu.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSidebar();
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSidebar();
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar when clicking a link
  document.querySelectorAll('.sidebar-link, .sidebar-cta').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeSidebar, 200);
    });
  });
});

// Navbar scroll effect with throttling
const navbar = document.getElementById('navbar');
let scrolled = false;

const handleScroll = throttle(() => {
  const isScrolled = window.scrollY > 50;
  if (isScrolled !== scrolled) {
    scrolled = isScrolled;
    navbar.classList.toggle('scrolled', isScrolled);
  }

  // Parallax color transition effect on mobile - smooth and optimized
  const heroHome = document.querySelector('.hero-home');
  if (heroHome && window.innerWidth <= 1024) {
    const scrollProgress = Math.min(window.scrollY / 500, 1);
    heroHome.style.setProperty('--scroll-opacity', scrollProgress);
  }
}, 100);

window.addEventListener('scroll', handleScroll, { passive: true });

// Intersection Observer for scroll animations
const animateObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animateObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.animate-on-scroll').forEach(el => animateObserver.observe(el));

// iOS video autoplay fix - aggressive approach for iPhone
const mobileVideo = document.getElementById('bg-video');
if (mobileVideo && window.innerWidth <= 1024) {
  // Force muted state (iOS requirement)
  mobileVideo.muted = true;
  mobileVideo.defaultMuted = true;
  mobileVideo.setAttribute('muted', '');
  mobileVideo.setAttribute('playsinline', '');

  // Attempt to play immediately
  const attemptPlay = () => {
    const playPromise = mobileVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Autoplay prevented, will play on user interaction
      });
    }
  };

  // Try multiple events to ensure playback
  mobileVideo.addEventListener('loadeddata', attemptPlay, { once: true });
  mobileVideo.addEventListener('canplay', attemptPlay, { once: true });

  // Force load
  mobileVideo.load();

  // Fallback: play on any user interaction
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

// ROI preview animation
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

// Smooth scroll for anchor links
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

// Feature cards stagger animation
document.querySelectorAll('.feature-card').forEach((card, index) => {
  card.style.animationDelay = `${index * 0.15}s`;
});

// Stat cards animation
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statCard = entry.target;
      statCard.style.animation = 'slideInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => {
  statObserver.observe(card);
});

// Hybrid Calculator Handler - Modal on desktop, page on mobile
function handleCalculatorClick(e) {
  if (e) e.preventDefault();

  // Mobile: redirect to dedicated page
  if (window.innerWidth <= 768) {
    window.location.href = '/calculator';
    return;
  }

  // Desktop: open modal
  openCalculatorModal();
}

// Calculator Modal Functions (Desktop only)
function openCalculatorModal() {
  const overlay = document.getElementById('calculatorModalOverlay');
  if (overlay) {
    // Set display first, then trigger animation
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
}

function closeCalculatorModal() {
  const overlay = document.getElementById('calculatorModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    // Wait for fade out animation before hiding
    setTimeout(() => {
      if (!overlay.classList.contains('active')) {
        overlay.style.display = 'none';
      }
    }, 400);
    document.body.style.overflow = 'auto';
  }
}

// Make functions global
window.handleCalculatorClick = handleCalculatorClick;
window.openCalculatorModal = openCalculatorModal;
window.closeCalculatorModal = closeCalculatorModal;

// Close on overlay click (handles both modals)
document.addEventListener('click', function(e) {
  const calcOverlay = document.getElementById('calculatorModalOverlay');
  const featureOverlay = document.getElementById('featureModalOverlay');

  if (calcOverlay && e.target === calcOverlay) {
    closeCalculatorModal();
  }
  if (featureOverlay && e.target === featureOverlay) {
    closeFeatureModal();
  }
});

// Close button handlers
document.addEventListener('DOMContentLoaded', () => {
  const calcCloseBtn = document.getElementById('calculatorModalClose');
  if (calcCloseBtn) {
    calcCloseBtn.addEventListener('click', closeCalculatorModal);
  }
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCalculatorModal();
    closeFeatureModal();
  }
});

// Feature Modal Functions
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

function closeFeatureModal() {
  const overlay = document.getElementById('featureModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

window.openFeatureModal = openFeatureModal;
window.closeFeatureModal = closeFeatureModal;
