import Link from 'next/link'
import type { Post } from '@/lib/posts'

interface Props {
  recentPosts: Post[]
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
}

const CATEGORIES: Record<string, { label: string; slug: string; count: number }> = {
  '🎰': { label: 'Sloty', slug: 'sloty', count: 1 },
  '🪟': { label: 'Live Casino', slug: 'live-casino', count: 1 },
  '🪵': { label: 'Klasyka', slug: 'klasyka', count: 1 },
  '🎨': { label: 'Strategie', slug: 'strategie', count: 1 },
  '🌿': { label: 'Promocje', slug: 'promocje', count: 1 },
  '💻': { label: 'Mobile', slug: 'mobile', count: 1 },
  '✨': { label: 'Bonusy', slug: 'bonusy', count: 2 },
  '🍳': { label: 'Recenzje', slug: 'recenzje', count: 1 },
  '💡': { label: 'Porady', slug: 'porady', count: 1 },
}

const uniqueCategories = Object.values(CATEGORIES).filter(
  (v, i, a) => a.findIndex(x => x.slug === v.slug) === i
)

export default function Sidebar({ recentPosts }: Props) {
  return (
    <aside id="secondary" className="widget-area nv-sidebar-wrap flex flex-col gap-6">

      {/* Recent posts widget */}
      <section className="widget widget_recent_entries bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow)' }}>
        <div className="widget-title bg-[var(--accent-dark)] px-5 py-3.5">
          <h3 className="font-heading text-sm font-bold text-white">Ostatnie artykuły</h3>
        </div>
        <ul className="divide-y divide-[var(--border)]">
          {recentPosts.map(post => (
            <li key={post.slug} className="flex gap-3 items-start p-4 hover:bg-[var(--bg-section)] transition-colors">
              <span className="text-2xl mt-0.5 shrink-0">{post.emoji}</span>
              <div className="min-w-0">
                <Link href={`/blog/${post.slug}/`} className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors leading-snug line-clamp-2 block">
                  {post.title}
                </Link>
                <time className="text-xs text-[var(--text-muted)] mt-0.5 block">{formatDate(post.date)}</time>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories widget */}
      <section className="widget widget_categories bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5" style={{ boxShadow: 'var(--shadow)' }}>
        <div className="widget-title mb-4 pb-2 border-b border-[var(--border)]">
          <h3 className="font-heading text-sm font-bold text-[var(--text)]">Kategorie</h3>
        </div>
        <ul className="cat-list flex flex-col gap-1">
          {uniqueCategories.map(cat => (
            <li key={cat.slug} className="cat-item cat-item-{cat.slug}">
              <Link href="/blog/" className="flex justify-between items-center text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors py-1">
                <span>{cat.label}</span>
                <span className="text-xs bg-[var(--bg-section)] px-2 py-0.5 rounded-full border border-[var(--border)]">{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Text widget / About */}
      <section className="widget widget_text bg-[var(--bg-section)] rounded-2xl border border-[var(--border)] p-5 text-center" style={{ boxShadow: 'var(--shadow)' }}>
        <div className="widget-title mb-3">
          <h3 className="font-heading text-base font-bold text-[var(--text)]">Hi-Sci</h3>
        </div>
        <div className="textwidget widget-text">
          <div className="text-4xl mb-3">🎰</div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
            Portal o kasynach online dla polskich graczy — recenzje, bonusy i strategie.
          </p>
          <Link href="/o-nas/" className="text-xs text-[var(--accent)] font-semibold hover:underline">
            Dowiedz się więcej →
          </Link>
        </div>
      </section>

    </aside>
  )
}
