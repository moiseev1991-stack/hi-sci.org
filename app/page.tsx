import Link from 'next/link'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { siteConfig } from '@/lib/config'
import { CATEGORIES, postsInCategory } from '@/lib/categories'
import PostCard from '@/components/PostCard'
import type { Metadata } from 'next'


const homeTitle = 'Vulkan Vegas — Najlepsze Kasyno Online dla Polskich Graczy 2026'
const homeDescription = 'Vulkan Vegas to lider wśród kasyn online dla polskich graczy — licencja MGA, bonus 100% do 4000 PLN, błyskawiczne wypłaty BLIK i tysiące gier od topowych dostawców.'

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: { canonical: siteConfig.url + '/' },
  openGraph: { title: homeTitle, description: homeDescription, url: siteConfig.url, type: 'website' },
}

export default function HomePage() {
  const allPosts = getAllPosts()
  const featuredSlugs = siteConfig.featuredPostSlugs
  const featuredPosts = featuredSlugs
    .map(s => getPostBySlug(s))
    .filter((p): p is NonNullable<typeof p> => p !== null)
  const restPosts = allPosts.filter(p => !featuredSlugs.includes(p.slug))
  const homeFeed = [...featuredPosts, ...restPosts]

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: siteConfig.name, url: siteConfig.url, description: siteConfig.description, inLanguage: 'pl',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── KATEGORIE ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16">
        <div className="mb-8">
          <span className="section-label">Kategorie</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] fancy-heading">
            Przeglądaj według tematu
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(cat => {
            const count = postsInCategory(allPosts, cat.slug).length
            return (
              <Link
                key={cat.slug}
                href={`/kategoria/${cat.slug}/`}
                className="group flex items-center gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:bg-[var(--bg-section)] transition-all"
                style={{ boxShadow: 'var(--shadow)' }}
              >
                <span className="text-3xl shrink-0" role="img" aria-label={cat.label}>{cat.emoji}</span>
                <div className="min-w-0">
                  <div className="font-heading text-base font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{cat.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{count} {count === 1 ? 'artykuł' : count < 5 ? 'artykuły' : 'artykułów'}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── NAJNOWSZE ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <span className="section-label">Najnowsze</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] fancy-heading">
            Recenzje, bonusy i strategie
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {homeFeed.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* ── DECORATIVE DIVIDER + MONEY-PAGE CTA ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-[var(--bg-section)] rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-[var(--border)]">
          <div className="absolute inset-0 opacity-[0.03]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="diamonds" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <polygon points="15,0 30,15 15,30 0,15" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diamonds)" className="text-[var(--accent)]" />
            </svg>
          </div>
          <div className="relative text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4">🎰</div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3">
              Graj świadomie, wygrywaj mądrze
            </h3>
            <p className="text-[var(--text-muted)] mb-6">
              Odkryj nasze recenzje, porównania bonusów i strategie — wybierz licencjonowane kasyno dopasowane do Twojego stylu gry.
            </p>
            <a href={siteConfig.moneyPageUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-bold px-7 py-3.5 rounded-xl transition-colors">
              {siteConfig.moneyPageAnchor} →
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
