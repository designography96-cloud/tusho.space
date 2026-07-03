// THE OBJECT — a rendered-feeling 3D sculpture living on the page (aircenter energy).
// Two prototype modes for the owner to pick from:
//   ?obj=slats  — a twisted stack of thin slats (default; closest to the reference)
//   ?obj=gimbal — the logo O as a 3D instrument: two rings + the bar, gimbal rotation
// Switch live from the console: __obj('slats') / __obj('gimbal')
import * as THREE from 'three'
import { motionOK, prefersReduced } from './env.js'

const DPR = Math.min(window.devicePixelRatio || 1, 2)

function buildSlats(group) {
  const COUNT = 42
  const geo = new THREE.BoxGeometry(2.7, 0.055, 0.95)
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0,
    transparent: true,
  })
  for (let i = 0; i < COUNT; i++) {
    const m = new THREE.Mesh(geo, mat)
    const t = i / (COUNT - 1)
    m.position.y = (t - 0.5) * 3.4
    m.rotation.y = t * Math.PI * 1.9 + Math.sin(t * Math.PI) * 0.5
    const squeeze = 0.72 + 0.28 * Math.sin(t * Math.PI)
    m.scale.set(squeeze, 1, squeeze)
    group.add(m)
  }
  return mat
}

function buildGimbal(group) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0,
    transparent: true,
  })
  // the O: outer ring, inner ring, and its bar — as an instrument
  const outer = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.07, 24, 96), mat)
  const inner = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.05, 24, 96), mat)
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.07), mat)
  bar.position.y = -1.95
  outer.name = 'outer'
  inner.name = 'inner'
  group.add(outer, inner, bar)
  return mat
}

export function initObject() {
  const canvas = document.createElement('canvas')
  canvas.className = 'object-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.prepend(canvas)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  })
  renderer.setPixelRatio(DPR)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50)
  camera.position.z = 7

  // soft studio light — the sculpture reads through shading on both grounds
  const ambient = new THREE.AmbientLight(0xffffff, 1.15)
  scene.add(ambient)
  const key = new THREE.DirectionalLight(0xffffff, 1.6)
  key.position.set(-3, 4, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.5)
  rim.position.set(4, -2, 3)
  scene.add(rim)

  const group = new THREE.Group()
  scene.add(group)

  let mat = null
  let mode = new URLSearchParams(location.search).get('obj') || 'slats'

  function applyTheme() {
    const light = document.documentElement.dataset.theme === 'light'
    // must read against the ground: a soft ash form on paper, a bright form on ink
    mat.color.set(light ? 0x9a9ea2 : 0xdfe2e4)
    key.color.set(light ? 0x7d8286 : 0xffffff)
    key.intensity = light ? 1.5 : 1.4
    ambient.color.set(light ? 0xb7bbbf : 0xffffff)
  }

  function build(m) {
    mode = m
    group.clear()
    mat = m === 'gimbal' ? buildGimbal(group) : buildSlats(group)
    applyTheme()
  }
  build(mode)
  window.__obj = (m) => {
    build(m)
    frame(0)
  }

  const small = () => window.innerWidth < 768

  function layout() {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // hero placement: right third on desktop, upper-center behind type on mobile
    if (small()) {
      group.position.x = 0.4
      group.scale.setScalar(0.62)
    } else {
      group.position.x = 2.1
      group.scale.setScalar(1)
    }
  }
  layout()
  window.addEventListener('resize', layout)

  // presence: full in the hero, receding but alive down the page
  let opacity = 1
  const heroH = () => window.innerHeight * 0.9

  // cursor torque — the object leans into your movement, with mass
  let vx = 0
  let vy = 0
  let tx = 0
  let ty = 0
  if (motionOK && matchMedia('(pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 0.9
        ty = (e.clientY / window.innerHeight - 0.5) * 0.55
      },
      { passive: true }
    )
  }

  window.addEventListener('tusho:theme', applyTheme)

  function frame(t) {
    const sy = window.scrollY
    // idle rotation + scroll adds turn
    const base = t * 0.00012
    if (mode === 'gimbal') {
      const outer = group.getObjectByName('outer')
      const inner = group.getObjectByName('inner')
      if (outer) outer.rotation.x = base * 2.4 + sy * 0.0006
      if (inner) inner.rotation.y = -base * 3.1 - sy * 0.0004
      group.rotation.z = Math.sin(t * 0.00018) * 0.1
    } else {
      group.rotation.y = base + sy * 0.0007
      group.rotation.z = 0.16 + Math.sin(t * 0.0001) * 0.05
    }
    // torque with lag
    vx += (ty * 0.6 - vx) * 0.03
    vy += (tx * 0.8 - vy) * 0.03
    group.rotation.x = vx
    if (mode !== 'gimbal') group.rotation.y += vy * 0.4

    // drift up slowly as you scroll; presence fades to a quarter past the hero
    group.position.y = Math.sin(t * 0.0004) * 0.08 + sy * 0.00045
    const past = Math.min(1, Math.max(0, (sy - heroH() * 0.4) / heroH()))
    const target = 1 - past * 0.78
    opacity += (target - opacity) * 0.06
    mat.opacity = opacity

    renderer.render(scene, camera)
  }

  // paint immediately so the sculpture exists from first frame (rAF may be
  // throttled on hidden/background pages)
  frame(0)

  if (!prefersReduced) {
    let running = true
    const loop = (t) => {
      if (!running) return
      frame(t)
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
    document.addEventListener('visibilitychange', () => {
      const was = running
      running = !document.hidden
      if (running && !was) requestAnimationFrame(loop)
    })
  }

  // rebuilding (theme flip or __obj switch) must also repaint hidden pages
  window.addEventListener('tusho:theme', () => frame(0))
}
