// THE FIELD — ambient seamless gradient backdrop, replacing the earlier tick
// field and 3D sculpture experiments (see object3d.js, kept but unused).
// Built on the real @paper-design/shaders engine (the same one getlayers.ai
// uses for its own background) so the quality is the genuine article — but
// every color is one of ours. One fixed full-viewport canvas sits behind the
// whole scrollable page (z-index 0, main sits at z-index 1), so there is no
// per-section seam: it drifts continuously under every section, exactly like
// the reference site's single persistent canvas.
import {
  ShaderMount,
  meshGradientFragmentShader,
  getShaderColorFromString,
  defaultPatternSizing,
  ShaderFitOptions,
} from '@paper-design/shaders'
import { prefersReduced } from './env.js'

// Monochrome-only palette, per brand rule — no invented accent hue.
// Dark leans harder toward Ink now (4:1) so the shell reads properly dark;
// light stays the earlier balanced 3:2 with Ash. Dark never drifts past
// Charcoal, light never drifts past Ash — no Smoke/opposite-end tone in
// the mix either way.
const PALETTES = {
  dark: { colors: ['#191a1b', '#191a1b', '#191a1b', '#191a1b', '#38393a'] },
  light: { colors: ['#fafbfc', '#fafbfc', '#fafbfc', '#cdd0d2', '#cdd0d2'] },
}

// ShaderSizingParams uses friendly names (fit, offsetX, worldWidth...); the
// raw ShaderMount uniforms need the u_-prefixed GLSL names instead.
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

function buildUniforms(theme) {
  const p = PALETTES[theme] || PALETTES.dark
  return {
    ...sizingUniforms,
    u_colors: p.colors.map(getShaderColorFromString),
    u_colorsCount: p.colors.length,
    u_distortion: 0.22, // gentle organic warping between spots, stays calm
    u_swirl: 0.08, // faint vortex — enough to feel alive, not spiral-y
    u_grainMixer: 0.15, // soft grain blended into the shape edges
    u_grainOverlay: 0.05, // faint post-noise texture, avoids flat/plasticky banding
  }
}

export function initGradientBackground() {
  const el = document.createElement('div')
  el.className = 'gradient-bg'
  el.setAttribute('aria-hidden', 'true')
  document.body.prepend(el)

  const theme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  const speed = prefersReduced ? 0 : 0.25 // slow, ambient — never a distraction

  const mount = new ShaderMount(el, meshGradientFragmentShader, buildUniforms(theme()), undefined, speed)

  window.addEventListener('tusho:theme', () => {
    mount.setUniforms(buildUniforms(theme()))
  })

  return mount
}
