// THE AURORA — a Luke-style glow-on-black field behind the cover, purple
// instead of his red. Near-black dominant with one luminous violet/purple
// bloom drifting through it. Mouse interaction: moving the pointer injects
// "energy" that speeds the drift up and warps (distorts) the field, decaying
// back to a slow calm when the hand goes still.
import {
  ShaderMount,
  meshGradientFragmentShader,
  getShaderColorFromString,
  defaultPatternSizing,
  ShaderFitOptions,
} from '@paper-design/shaders'
import { prefersReduced } from './env.js'

// Luke-style palette: mostly night-black, with a deep-violet body rising to a
// bright purple bloom, and one cool blue edge for depth. No teal now — this
// reads as a single purple light source on black, like his red one.
const AURORA_COLORS = [
  '#060409', // night black
  '#060409',
  '#060409',
  '#0d1130', // cool deep-blue edge
  '#3a1063', // deep violet body
  '#7c2fd6', // purple glow
  '#b06cff', // bright violet bloom
]

const BASE_SPEED = 0.16 // slow calm drift at rest
const MAX_SPEED = 1.7 // full-tilt when the mouse is flying
const BASE_DISTORTION = 0.26
const MAX_DISTORTION = 0.6
const BASE_SWIRL = 0.1
const MAX_SWIRL = 0.42

const sizingUniforms = {
  u_fit: ShaderFitOptions[defaultPatternSizing.fit],
  u_scale: defaultPatternSizing.scale,
  u_rotation: defaultPatternSizing.rotation,
  u_originX: defaultPatternSizing.originX,
  u_originY: defaultPatternSizing.originY,
  u_offsetX: defaultPatternSizing.offsetX,
  u_offsetY: defaultPatternSizing.offsetY,
  u_worldWidth: defaultPatternSizing.worldWidth,
  u_worldHeight: defaultPatternSizing.worldHeight,
}

function buildUniforms() {
  return {
    ...sizingUniforms,
    u_colors: AURORA_COLORS.map(getShaderColorFromString),
    u_colorsCount: AURORA_COLORS.length,
    u_distortion: BASE_DISTORTION,
    u_swirl: BASE_SWIRL,
    u_grainMixer: 0.03, // barely any grain — keeps the aurora glossy, not frosted
    u_grainOverlay: 0,
  }
}

export function initGradientBackground() {
  const el = document.createElement('div')
  el.className = 'gradient-bg'
  el.setAttribute('aria-hidden', 'true')
  document.body.prepend(el)

  const mount = new ShaderMount(el, meshGradientFragmentShader, buildUniforms(), undefined, BASE_SPEED)

  if (prefersReduced || !matchMedia('(pointer: fine)').matches) return mount

  // ——— mouse energy: pointer velocity → faster + more distorted drift ———
  // two-stage smoothing: fast movement bumps a *target* energy instantly,
  // but the *applied* energy only eases toward that target a little each
  // frame — so the field ramps up smoothly instead of jumping the instant
  // the mouse moves, while still settling back down gracefully when idle.
  let targetEnergy = 0
  let energy = 0
  let lastX = null
  let lastY = null
  let running = false

  window.addEventListener(
    'pointermove',
    (e) => {
      if (lastX != null) {
        const d = Math.hypot(e.clientX - lastX, e.clientY - lastY)
        // each pixel of travel adds a little energy, clamped to 1
        targetEnergy = Math.min(1, targetEnergy + d * 0.006)
      }
      lastX = e.clientX
      lastY = e.clientY
      if (!running) {
        running = true
        requestAnimationFrame(tick)
      }
    },
    { passive: true }
  )

  const lerp = (a, b, t) => a + (b - a) * t

  function tick() {
    // the target bleeds away on its own so it settles to 0 when the hand
    // stops moving; the applied energy chases it smoothly every frame
    targetEnergy *= 0.94
    energy = lerp(energy, targetEnergy, 0.12)

    mount.setSpeed(lerp(BASE_SPEED, MAX_SPEED, energy))
    mount.setUniforms({
      u_distortion: lerp(BASE_DISTORTION, MAX_DISTORTION, energy),
      u_swirl: lerp(BASE_SWIRL, MAX_SWIRL, energy),
    })
    if (energy > 0.001 || targetEnergy > 0.001) {
      requestAnimationFrame(tick)
    } else {
      // fully settle back to the calm baseline and stop the loop
      mount.setSpeed(BASE_SPEED)
      mount.setUniforms({ u_distortion: BASE_DISTORTION, u_swirl: BASE_SWIRL })
      running = false
    }
  }

  return mount
}
