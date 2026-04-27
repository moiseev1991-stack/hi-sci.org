#!/usr/bin/env node
// Deterministic SVG illustration generator.
// One unique 320x180 SVG per post slug, written to public/illustrations/<slug>.svg.
// No external API, no randomness — output is fully reproducible from the slug.
//
// Each illustration combines:
//   - a slug-derived linear gradient (HSL, casino-themed dark palette)
//   - a slug-derived geometric pattern (dots, lines, diamonds, circles, squares)
//   - a centred badge (chip / reel / card / arch / hexagon) chosen by emoji
//   - asymmetric corner accents at slug-derived positions
//   - a thin bottom strip in the post's accent color
//
// Run:  BACKDATE=0 node scripts/generate-svg-illustrations.mjs
// Or:   node scripts/generate-svg-illustrations.mjs

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const POSTS_DIR = path.join(ROOT, 'content', 'posts')
const OUT_DIR = path.join(ROOT, 'public', 'illustrations')

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

// xmur3 string hash → seedable PRNG (mulberry32)
function xmur3(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
}
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeRng(slug) {
  const seedFn = xmur3(slug)
  return mulberry32(seedFn())
}

const EMOJI_PALETTE = {
  '🎰': { hue: 350, hueAlt: 22,  accent: '#fbbf24' }, // sloty — wine red + amber
  '🪟': { hue: 330, hueAlt: 280, accent: '#f472b6' }, // live — magenta + violet
  '🪵': { hue: 25,  hueAlt: 8,   accent: '#d4a373' }, // klasyka — wood brown + amber
  '🎨': { hue: 270, hueAlt: 220, accent: '#a78bfa' }, // strategie — violet + indigo
  '🌿': { hue: 30,  hueAlt: 12,  accent: '#fb923c' }, // promocje — orange + red
  '💻': { hue: 245, hueAlt: 280, accent: '#60a5fa' }, // mobile — indigo + violet
  '✨': { hue: 40,  hueAlt: 22,  accent: '#fde68a' }, // bonusy — gold + amber
  '🍳': { hue: 18,  hueAlt: 350, accent: '#fb7185' }, // recenzje — terracotta + rose
  '💡': { hue: 50,  hueAlt: 30,  accent: '#facc15' }, // porady — yellow + amber
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)] }
function rand(rng, min, max) { return min + rng() * (max - min) }
function randInt(rng, min, max) { return Math.floor(rand(rng, min, max + 1)) }

function darkHsl(hue, sat, lightMin, lightMax, rng) {
  return `hsl(${hue + Math.floor(rand(rng, -10, 10))} ${sat}% ${rand(rng, lightMin, lightMax).toFixed(1)}%)`
}

function buildPattern(rng, id) {
  const kind = pick(rng, ['dots', 'lines', 'diamonds', 'circles', 'crosses'])
  const size = randInt(rng, 18, 36)
  const opacity = rand(rng, 0.06, 0.16).toFixed(2)
  switch (kind) {
    case 'dots':
      return `<pattern id="${id}" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
  <circle cx="${size / 2}" cy="${size / 2}" r="${rand(rng, 0.8, 1.6).toFixed(2)}" fill="white" fill-opacity="${opacity}"/>
</pattern>`
    case 'lines': {
      const angle = pick(rng, [0, 30, 45, 60, 90, 135])
      return `<pattern id="${id}" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">
  <line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}" stroke="white" stroke-opacity="${opacity}" stroke-width="1"/>
</pattern>`
    }
    case 'diamonds':
      return `<pattern id="${id}" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
  <polygon points="${size / 2},2 ${size - 2},${size / 2} ${size / 2},${size - 2} 2,${size / 2}" fill="none" stroke="white" stroke-opacity="${opacity}" stroke-width="0.8"/>
</pattern>`
    case 'circles':
      return `<pattern id="${id}" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 3}" fill="none" stroke="white" stroke-opacity="${opacity}" stroke-width="0.8"/>
</pattern>`
    case 'crosses':
      return `<pattern id="${id}" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
  <line x1="${size / 2}" y1="2" x2="${size / 2}" y2="${size - 2}" stroke="white" stroke-opacity="${opacity}" stroke-width="0.8"/>
  <line x1="2" y1="${size / 2}" x2="${size - 2}" y2="${size / 2}" stroke="white" stroke-opacity="${opacity}" stroke-width="0.8"/>
</pattern>`
  }
}

function buildBadge(rng, emoji, accent, cx, cy) {
  // pick badge style by emoji family
  const family = ['🎰', '✨'].includes(emoji) ? 'reel'
    : ['🪟', '🪵'].includes(emoji) ? 'card'
    : ['🎨', '💡'].includes(emoji) ? 'hex'
    : ['💻', '🌿'].includes(emoji) ? 'square'
    : 'arch'
  const r = randInt(rng, 38, 50)
  const inner = (r * rand(rng, 0.55, 0.7)).toFixed(0)
  const core = (r * rand(rng, 0.28, 0.4)).toFixed(0)
  switch (family) {
    case 'reel':
      return `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" fill-opacity="0.07" stroke="white" stroke-opacity="0.25" stroke-width="1.4"/>
  <circle cx="${cx}" cy="${cy}" r="${inner}" fill="${accent}" fill-opacity="0.55"/>
  <circle cx="${cx}" cy="${cy}" r="${core}" fill="white" fill-opacity="0.85"/>`
    case 'card':
      return `
  <rect x="${cx - r * 0.65}" y="${cy - r * 0.85}" width="${r * 1.3}" height="${r * 1.7}" rx="6" fill="white" fill-opacity="0.08" stroke="white" stroke-opacity="0.25" stroke-width="1.4"/>
  <circle cx="${cx}" cy="${cy}" r="${inner}" fill="${accent}" fill-opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${core}" fill="white" fill-opacity="0.85"/>`
    case 'hex': {
      const a = r
      const pts = [0, 60, 120, 180, 240, 300]
        .map(deg => {
          const rad = (deg * Math.PI) / 180
          return `${(cx + Math.cos(rad) * a).toFixed(1)},${(cy + Math.sin(rad) * a).toFixed(1)}`
        })
        .join(' ')
      return `
  <polygon points="${pts}" fill="white" fill-opacity="0.07" stroke="white" stroke-opacity="0.25" stroke-width="1.4"/>
  <circle cx="${cx}" cy="${cy}" r="${inner}" fill="${accent}" fill-opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${core}" fill="white" fill-opacity="0.85"/>`
    }
    case 'square':
      return `
  <rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="${r * 0.18}" fill="white" fill-opacity="0.07" stroke="white" stroke-opacity="0.25" stroke-width="1.4"/>
  <circle cx="${cx}" cy="${cy}" r="${inner}" fill="${accent}" fill-opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${core}" fill="white" fill-opacity="0.85"/>`
    case 'arch':
      return `
  <path d="M ${cx - r} ${cy + r * 0.6} L ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} L ${cx + r} ${cy + r * 0.6} Z" fill="white" fill-opacity="0.08" stroke="white" stroke-opacity="0.25" stroke-width="1.4"/>
  <circle cx="${cx}" cy="${cy}" r="${inner}" fill="${accent}" fill-opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${core}" fill="white" fill-opacity="0.85"/>`
  }
}

function buildAccents(rng, accent) {
  const count = randInt(rng, 3, 6)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = randInt(rng, 8, 312)
    const y = randInt(rng, 6, 158)
    const kind = pick(rng, ['star', 'plus', 'ring', 'tick'])
    if (kind === 'star') {
      out += `<g transform="translate(${x} ${y})" stroke="white" stroke-opacity="0.45" stroke-linecap="round" stroke-width="1.2">
  <line x1="-4" y1="0" x2="4" y2="0"/><line x1="0" y1="-4" x2="0" y2="4"/>
</g>`
    } else if (kind === 'plus') {
      out += `<g transform="translate(${x} ${y})" stroke="${accent}" stroke-opacity="0.55" stroke-linecap="round" stroke-width="1.4">
  <line x1="-3" y1="0" x2="3" y2="0"/><line x1="0" y1="-3" x2="0" y2="3"/>
</g>`
    } else if (kind === 'ring') {
      const r = randInt(rng, 4, 9)
      out += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="white" stroke-opacity="0.25" stroke-width="0.8"/>`
    } else if (kind === 'tick') {
      out += `<circle cx="${x}" cy="${y}" r="2" fill="${accent}" fill-opacity="0.7"/>`
    }
  }
  return out
}

function buildSvg(slug, emoji) {
  const rng = makeRng(slug)
  const palette = EMOJI_PALETTE[emoji] || EMOJI_PALETTE['🎰']
  const c1 = darkHsl(palette.hue, randInt(rng, 50, 80), 7, 14, rng)
  const c2 = darkHsl(palette.hueAlt, randInt(rng, 45, 75), 14, 24, rng)
  const angle = randInt(rng, 100, 170)
  const accent = palette.accent
  const patternId = `pat-${Math.abs(xmur3(slug + 'p')()).toString(36).slice(0, 5)}`
  const gradId = `bg-${Math.abs(xmur3(slug + 'g')()).toString(36).slice(0, 5)}`
  const cx = randInt(rng, 130, 195)
  const cy = randInt(rng, 70, 105)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="${gradId}" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    ${buildPattern(rng, patternId)}
  </defs>
  <rect width="320" height="180" fill="url(#${gradId})"/>
  <rect width="320" height="180" fill="url(#${patternId})"/>
  ${buildAccents(rng, accent)}
  ${buildBadge(rng, emoji, accent, cx, cy)}
  <rect x="0" y="170" width="320" height="10" fill="black" fill-opacity="0.3"/>
  <rect x="${randInt(rng, 60, 140)}" y="173" width="${randInt(rng, 60, 140)}" height="4" rx="2" fill="${accent}" fill-opacity="0.75"/>
</svg>`
}

function readFrontmatter(file) {
  const raw = fs.readFileSync(file, 'utf-8')
  const slug = (raw.match(/^slug:\s*"([^"]+)"/m) || [])[1]
  const emoji = (raw.match(/^emoji:\s*"([^"]+)"/m) || [])[1]
  return { slug, emoji }
}

function main() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'))
  let written = 0
  for (const f of files) {
    const { slug, emoji } = readFrontmatter(path.join(POSTS_DIR, f))
    if (!slug || !emoji) {
      console.warn(`  skip ${f} — missing slug/emoji`)
      continue
    }
    const svg = buildSvg(slug, emoji)
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.svg`), svg, 'utf-8')
    written++
  }
  console.log(`✓ Wrote ${written} unique SVG illustrations to public/illustrations/`)
}

main()
