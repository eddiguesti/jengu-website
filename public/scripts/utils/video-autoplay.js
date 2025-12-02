/**
 * Video Autoplay Module
 * Handles iOS video autoplay with aggressive fallback strategies
 */

const MOBILE_BREAKPOINT = 1024;

/**
 * Initialize video autoplay for mobile devices (iOS fix)
 */
export function initVideoAutoplay() {
  const mobileVideo = document.getElementById('bg-video');

  if (!mobileVideo || window.innerWidth > MOBILE_BREAKPOINT) {
    return;
  }

  // Force muted state (iOS requirement for autoplay)
  configureMutedState(mobileVideo);

  // Attempt immediate playback
  const attemptPlay = createPlayAttempt(mobileVideo);

  // Try multiple events to ensure playback
  mobileVideo.addEventListener('loadeddata', attemptPlay, { once: true });
  mobileVideo.addEventListener('canplay', attemptPlay, { once: true });

  // Force load
  mobileVideo.load();

  // Fallback: play on any user interaction
  setupInteractionFallback(mobileVideo);
}

/**
 * Configure video to muted state for iOS autoplay
 * @param {HTMLVideoElement} video - Video element
 */
function configureMutedState(video) {
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
}

/**
 * Create play attempt function
 * @param {HTMLVideoElement} video - Video element
 * @returns {Function} Play attempt function
 */
function createPlayAttempt(video) {
  return () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay prevented, will play on user interaction
      });
    }
  };
}

/**
 * Setup fallback to play video on user interaction
 * @param {HTMLVideoElement} video - Video element
 */
function setupInteractionFallback(video) {
  const playOnInteraction = () => {
    video.play();
    removeInteractionListeners();
  };

  const removeInteractionListeners = () => {
    document.removeEventListener('touchstart', playOnInteraction, true);
    document.removeEventListener('click', playOnInteraction, true);
    document.removeEventListener('scroll', playOnInteraction, true);
  };

  document.addEventListener('touchstart', playOnInteraction, { once: true, capture: true });
  document.addEventListener('click', playOnInteraction, { once: true, capture: true });
  document.addEventListener('scroll', playOnInteraction, { once: true, capture: true });
}
