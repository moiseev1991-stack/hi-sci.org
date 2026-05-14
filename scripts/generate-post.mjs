#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set')
  process.exit(1)
}

const ROOT = process.cwd()
const POSTS_DIR = path.join(ROOT, 'content', 'posts')
const ILLUSTRATIONS_DIR = path.join(ROOT, 'public', 'illustrations')

const MONEY_PAGE_URL = 'https://vulkankasyno.pl'
const MONEY_PAGE_ANCHOR = 'Vulkan Vegas'
const MONEY_PAGE_BONUS = 'bonus 100% do 4000 PLN'

const ALLOWED_EMOJIS = ['🎰', '🪟', '🪵', '🎨', '🌿', '💻', '✨', '🍳', '💡']

const TOPIC_CATEGORIES = [
  'recenzje konkretnych kasyn online dla polskich graczy',
  'porównania bonusów powitalnych i kodów promocyjnych',
  'sloty online — recenzje, RTP, mechaniki, dostawcy (Pragmatic, NetEnt, Play\'n GO, BGaming)',
  'live casino — blackjack, ruletka, baccarat na żywo z polskimi krupierami',
  'metody płatności — BLIK, karty, e-portfele (Skrill, Neteller), kryptowaluty',
  'bezpieczeństwo gry — licencje (MGA, Curacao), KYC, RNG, fair play',
  'mobilne kasyna — aplikacje iOS/Android, kasyna w przeglądarce mobilnej',
  'strategie i porady dla graczy — bankroll, zarządzanie limitami, gry z niskim house edge',
  'programy lojalnościowe i VIP w kasynach online',
  'odpowiedzialna gra — limity, samowykluczenie, narzędzia ochrony graczy',
  'porównania operatorów — Vulkan Vegas vs konkurencja',
  'gry stołowe — blackjack, poker, ruletka — zasady i odmiany',
]

if (!fs.existsSync(ILLUSTRATIONS_DIR)) fs.mkdirSync(ILLUSTRATIONS_DIR, { recursive: true })
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true })

function readExistingPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'))
  const slugs = []
  const titles = []
  for (const f of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')
    const slugMatch = raw.match(/^slug:\s*"([^"]+)"/m)
    const titleMatch = raw.match(/^title:\s*"([^"]+)"/m)
    if (slugMatch) slugs.push(slugMatch[1])
    if (titleMatch) titles.push(titleMatch[1])
  }
  return { slugs, titles }
}

const BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
const IS_OPENROUTER = /openrouter\.ai/i.test(BASE_URL)
const DEFAULT_MODEL = IS_OPENROUTER ? 'openai/gpt-4o-mini' : 'gpt-4o-mini'

async function callOpenAI({ messages, jsonMode = false, maxTokens = 6000 }) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  }
  if (IS_OPENROUTER) {
    headers['HTTP-Referer'] = 'https://hi-sci.org'
    headers['X-Title'] = 'Hi-Sci'
  }
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${errText}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

async function pickTopic({ existingSlugs, existingTitles }) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a content strategist for Hi-Sci, a Polish online casino affiliate blog (hi-sci.org). The blog covers ONLY online casino topics for Polish players: reviews, bonuses, slots, live casino, payments, strategies, responsible gambling. You always respond with strict JSON.',
    },
    {
      role: 'user',
      content: `Pick a fresh topic for a new SEO-optimized blog post in Polish. The post must NOT duplicate any of the existing posts.

Existing slugs:
${existingSlugs.map(s => `- ${s}`).join('\n')}

Existing titles:
${existingTitles.map(t => `- ${t}`).join('\n')}

Good topic categories (all casino-related, Polish market):
${TOPIC_CATEGORIES.map(c => `- ${c}`).join('\n')}

Pick ONE allowed emoji from this list that best fits the casino subtopic: ${ALLOWED_EMOJIS.join(' ')}.
Emoji guide (casino taxonomy):
- 🎰 = sloty (slot machines, RTP, jackpots)
- 🪟 = live casino (live blackjack, ruletka na żywo)
- 🪵 = klasyka (classic table games — blackjack, poker, baccarat)
- 🎨 = strategie (betting strategies, bankroll management)
- 🌿 = promocje (cashback, weekly promos, tournaments)
- 💻 = mobile (iOS/Android apps, mobile-first casinos)
- ✨ = bonusy (welcome bonuses, free spins, no-deposit)
- 🍳 = recenzje (full operator reviews)
- 💡 = porady (general player tips, FAQs, beginner guides)

Return strict JSON:
{
  "slug": "lowercase-kebab-case-without-polish-diacritics-max-50-chars",
  "title": "Polish title, attention-grabbing, max 70 chars, Title Case, with em dash if useful",
  "description": "SEO meta description in Polish, max 155 chars, must mention concrete value (bonus amount, casino name, RTP, etc.)",
  "emoji": "one of: ${ALLOWED_EMOJIS.join(' ')}"
}`,
    },
  ]
  const raw = await callOpenAI({ messages, jsonMode: true, maxTokens: 500 })
  const parsed = JSON.parse(raw)
  if (!parsed.slug || !parsed.title || !parsed.description || !parsed.emoji) {
    throw new Error(`Topic JSON missing fields: ${raw}`)
  }
  if (existingSlugs.includes(parsed.slug)) {
    throw new Error(`Topic duplicates existing slug: ${parsed.slug}`)
  }
  if (!ALLOWED_EMOJIS.includes(parsed.emoji)) {
    parsed.emoji = '🎰'
  }
  return parsed
}

async function generateSvg({ slug, title, emoji }) {
  const messages = [
    {
      role: 'system',
      content:
        'You are an SVG illustrator. You return only raw SVG markup, no explanation, no markdown.',
    },
    {
      role: 'user',
      content: `Generate a clean, modern decorative SVG illustration (320x180 viewBox) for a Polish online casino blog post.

Topic: "${title}"
Emoji theme: ${emoji}

Style requirements:
- viewBox="0 0 320 180", width="320" height="180"
- dark gradient background fitting a casino theme (deep greens, dark golds, navy — never white)
- a centered circular badge / focal element (chip, slot reel, or card-like shape)
- subtle decorative accents (stars, dots, lines) in corners
- a thin bottom strip / label area
- use semi-transparent whites and one accent color (gold, neon green, or red — casino-appropriate)
- no text, no emoji, no raster images, no external fonts
- clean, minimal, suitable as a thumbnail
- self-contained, valid SVG

Return ONLY the SVG markup starting with <svg ...> and ending with </svg>.`,
    },
  ]
  let svg = ''
  try {
    const raw = await callOpenAI({ messages, jsonMode: false, maxTokens: 2000 })
    svg = raw.trim()
    svg = svg.replace(/^```(?:svg|xml)?\s*/i, '').replace(/```\s*$/i, '').trim()
    if (!svg.startsWith('<svg')) {
      console.warn('  SVG response invalid, falling back to placeholder')
      svg = ''
    }
  } catch (err) {
    console.warn('  SVG generation failed, falling back to placeholder:', err.message)
  }
  if (!svg) {
    svg = buildFallbackSvg({ slug, emoji })
  }
  const outPath = path.join(ILLUSTRATIONS_DIR, `${slug}.svg`)
  fs.writeFileSync(outPath, svg, 'utf-8')
  return `/illustrations/${slug}.svg`
}

function buildFallbackSvg({ slug, emoji }) {
  const palette = {
    '🎰': ['#1b4332', '#2d6a4f', '#ffd166'],
    '🪟': ['#134e4a', '#0f766e', '#5eead4'],
    '🪵': ['#1b4332', '#2d6a4f', '#d4a373'],
    '🎨': ['#312e81', '#4338ca', '#fbbf24'],
    '🌿': ['#14532d', '#15803d', '#86efac'],
    '💻': ['#1e3a5f', '#1d4ed8', '#60a5fa'],
    '✨': ['#78350f', '#d97706', '#fde68a'],
    '🍳': ['#7c2d12', '#c2410c', '#fdba74'],
    '💡': ['#365314', '#4d7c0f', '#fef08a'],
  }
  const [c1, c2, accent] = palette[emoji] ?? ['#1e293b', '#334155', '#94a3b8']
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  const cx = 160
  const cy = 80
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <defs>
    <linearGradient id="bg-${hash}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="dots-${hash}" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="1" fill="white" fill-opacity="0.15"/>
    </pattern>
  </defs>
  <rect width="320" height="180" fill="url(#bg-${hash})"/>
  <rect width="320" height="180" fill="url(#dots-${hash})"/>
  <circle cx="${cx}" cy="${cy}" r="44" fill="white" fill-opacity="0.08" stroke="white" stroke-opacity="0.25" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${cy}" r="28" fill="${accent}" fill-opacity="0.55"/>
  <circle cx="${cx}" cy="${cy}" r="14" fill="white" fill-opacity="0.7"/>
  <g stroke="white" stroke-opacity="0.4" stroke-linecap="round" stroke-width="1.5">
    <line x1="24" y1="24" x2="32" y2="24"/><line x1="28" y1="20" x2="28" y2="28"/>
    <line x1="296" y1="24" x2="304" y2="24"/><line x1="300" y1="20" x2="300" y2="28"/>
    <line x1="24" y1="156" x2="32" y2="156"/><line x1="28" y1="152" x2="28" y2="160"/>
    <line x1="296" y1="156" x2="304" y2="156"/><line x1="300" y1="152" x2="300" y2="160"/>
  </g>
  <rect x="0" y="160" width="320" height="20" fill="black" fill-opacity="0.25"/>
  <rect x="120" y="167" width="80" height="6" rx="3" fill="${accent}" fill-opacity="0.7"/>
</svg>`
}

async function generateOutline({ title, description }) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a senior content editor writing in Polish for an online casino affiliate blog. You always respond with strict JSON.',
    },
    {
      role: 'user',
      content: `Plan a 1600+ word SEO blog post in Polish on an online casino topic.

Title: "${title}"
Description: "${description}"

Return strict JSON:
{
  "intro_points": ["3 concrete points to cover in the intro, in Polish — hook + value proposition + what reader will learn"],
  "sections": [
    { "title": "## 1. Section title in Polish", "key_points": ["point1", "point2", "point3", "point4"] },
    ... exactly 8 sections numbered 1 to 8
  ]
}

Make sections specific, practical, non-overlapping. Cover concrete details: bonus amounts, RTP percentages, payment methods (BLIK, e-wallets), license info (MGA/Curacao), real game names from major providers (Pragmatic Play, NetEnt, Play'n GO, BGaming, Evolution). Use Polish.`,
    },
  ]
  const raw = await callOpenAI({ messages, jsonMode: true, maxTokens: 2000 })
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed.sections) || parsed.sections.length !== 8) {
    throw new Error(`Outline must have 8 sections, got ${parsed.sections?.length}`)
  }
  return parsed
}

async function generateBody({ title, description, outline, emoji }) {
  const moneyBlock = `After the 8 sections, add a section "## Polecane kasyno — ${MONEY_PAGE_ANCHOR}" (2-3 paragraphs) that naturally recommends [${MONEY_PAGE_ANCHOR}](${MONEY_PAGE_URL}) — mention ${MONEY_PAGE_BONUS}, MGA license, BLIK payments, fast 24h withdrawals, and over 2000 games. Frame it as the editor's pick relevant to the article topic, not a hard sell.`

  const messages = [
    {
      role: 'system',
      content:
        'You write long-form SEO articles in fluent, natural Polish for an online casino affiliate blog targeting Polish players. No fluff, no filler. Concrete, practical, useful. Always include responsible-gambling framing for any betting/playing advice.',
    },
    {
      role: 'user',
      content: `Write the full article body in Polish based on this outline.

Title: "${title}"
Description: "${description}"

Intro must cover:
${outline.intro_points.map(p => `- ${p}`).join('\n')}

Sections (write each section as ## heading + 200+ words of dense, useful Polish prose, with **bold** key terms and concrete numbers — RTP %, bonus amounts in PLN, withdrawal times, license numbers if relevant):
${outline.sections.map(s => `${s.title}\n  Key points: ${s.key_points.join('; ')}`).join('\n\n')}

${moneyBlock}

End with a single italic disclaimer line in Polish about responsible gambling and 18+ (e.g. "*Hazard dozwolony tylko dla osób pełnoletnich (18+). Hazard może uzależniać. Graj odpowiedzialnie i w granicach swoich możliwości finansowych.*").

Constraints:
- Total length: at least 1600 words.
- Use markdown headings (##), bold (**term**), and occasional bullet lists.
- No H1, no frontmatter, no images, no code blocks.
- Do NOT include the article title as a heading — start directly with the intro paragraphs.
- Polish only.
- Mention concrete operators, game names, providers, and payment methods relevant to the Polish casino market.

Return only the markdown body.`,
    },
  ]
  const body = await callOpenAI({ messages, jsonMode: false, maxTokens: 6000 })
  return body.trim()
}

function getPostDate() {
  if (process.env.BACKDATE === '1') {
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000
    const offset = Math.floor(Math.random() * sixMonthsMs)
    return new Date(Date.now() - offset).toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

function buildMdx({ title, slug, description, emoji, image, body }) {
  const today = getPostDate()
  const fm = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `slug: "${slug}"`,
    `date: "${today}"`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    `emoji: "${emoji}"`,
    `featured: false`,
    `image: "${image}"`,
    '---',
    '',
    body,
    '',
  ].join('\n')
  return fm
}

async function main() {
  console.log('→ Reading existing posts')
  const { slugs, titles } = readExistingPosts()
  console.log(`  ${slugs.length} existing posts`)

  console.log('→ Picking topic')
  const topic = await pickTopic({ existingSlugs: slugs, existingTitles: titles })
  console.log(`  topic: ${topic.slug} | ${topic.emoji} | ${topic.title}`)

  console.log('→ Generating SVG illustration')
  const image = await generateSvg({ slug: topic.slug, title: topic.title, emoji: topic.emoji })
  console.log(`  saved ${image}`)

  console.log('→ Generating outline')
  const outline = await generateOutline({ title: topic.title, description: topic.description })

  console.log('→ Generating body')
  const body = await generateBody({
    title: topic.title,
    description: topic.description,
    outline,
    emoji: topic.emoji,
  })
  const wordCount = body.split(/\s+/).filter(Boolean).length
  console.log(`  ${wordCount} words`)

  const mdx = buildMdx({ ...topic, image, body })
  const outFile = path.join(POSTS_DIR, `${topic.slug}.mdx`)
  fs.writeFileSync(outFile, mdx, 'utf-8')
  console.log(`✓ Wrote ${outFile}`)
}

const COUNT = Math.max(1, parseInt(process.env.COUNT || '1', 10))

async function runBatch() {
  let ok = 0, fail = 0
  for (let i = 1; i <= COUNT; i++) {
    console.log(`\n========== Article ${i}/${COUNT} ==========`)
    try {
      await main()
      ok++
    } catch (err) {
      fail++
      console.error(`FAILED article ${i}:`, err.message || err)
    }
    if (i < COUNT) await new Promise(r => setTimeout(r, 1500))
  }
  console.log(`\n==========================================`)
  console.log(`Batch done: ${ok} ok, ${fail} failed (of ${COUNT})`)
}

runBatch().catch(err => {
  console.error('BATCH FAILED:', err)
  process.exit(1)
})
