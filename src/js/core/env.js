// Capability gates — reduced-motion is a first-class variant, not a fallback.
export const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const lowTier =
  (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)

export const motionOK = !prefersReduced

// heavy = pins, scrubs, drift. Weak devices get the mobile choreography at any width.
export const heavy = motionOK && !lowTier && window.innerWidth >= 768

// Optional flags (brief: custom cursor OFF by default, sound toggle for videos)
export const FLAGS = {
  customCursor: false,
  soundToggle: false, // placeholder loops are silent; enable when real reels land
}
