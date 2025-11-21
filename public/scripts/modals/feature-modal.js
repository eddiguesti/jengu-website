/**
 * Feature Modal Module
 * Handles feature detail modal with dynamic content rendering
 */

/**
 * Open feature modal with dynamic content
 * @param {string} featureId - Feature identifier
 */
export function openFeatureModal(featureId) {
  const overlay = document.getElementById('featureModalOverlay');
  if (!overlay) return;

  const featureData = window.featureData || {};
  const data = featureData[featureId];
  if (!data) return;

  // Update modal content
  updateModalIcon(data.icon);
  updateModalTitle(data.title);
  updateModalSubtitle(data.subtitle);
  updateModalBenefits(data.benefits);
  updateModalStats(data.stats);

  // Show modal
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close feature modal
 */
export function closeFeatureModal() {
  const overlay = document.getElementById('featureModalOverlay');
  if (!overlay) return;

  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

/**
 * Update modal icon
 * @param {string} iconClass - Font Awesome icon class
 */
function updateModalIcon(iconClass) {
  const modalIcon = document.getElementById('modalIcon');
  if (modalIcon) {
    modalIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
  }
}

/**
 * Update modal title
 * @param {string} title - Modal title
 */
function updateModalTitle(title) {
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) {
    modalTitle.textContent = title;
  }
}

/**
 * Update modal subtitle
 * @param {string} subtitle - Modal subtitle
 */
function updateModalSubtitle(subtitle) {
  const modalSubtitle = document.getElementById('modalSubtitle');
  if (modalSubtitle) {
    modalSubtitle.textContent = subtitle;
  }
}

/**
 * Update modal benefits list
 * @param {Array} benefits - Array of benefit objects
 */
function updateModalBenefits(benefits) {
  const modalBenefits = document.getElementById('modalBenefits');
  if (!modalBenefits || !benefits) return;

  modalBenefits.innerHTML = benefits.map(benefit => `
    <div class="feature-benefit-item">
      <div class="feature-benefit-icon">${benefit.icon}</div>
      <div class="feature-benefit-text">
        <strong>${benefit.title}</strong>
        <p>${benefit.desc}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Update modal stats
 * @param {Array} stats - Array of stat objects
 */
function updateModalStats(stats) {
  const modalStats = document.getElementById('modalStats');
  if (!modalStats || !stats) return;

  modalStats.innerHTML = stats.map(stat => `
    <div class="feature-stat">
      <span class="feature-stat-value">${stat.value}</span>
      <span class="feature-stat-label">${stat.label}</span>
    </div>
  `).join('');
}

/**
 * Initialize feature modal (make functions globally accessible)
 */
export function initFeatureModal() {
  window.openFeatureModal = openFeatureModal;
  window.closeFeatureModal = closeFeatureModal;
}
