'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'

const navLinks = [
  { label: 'Główna', href: '/' },
  { label: 'O nas', href: '/o-nas/' },
  { label: 'Kontakt', href: '/kontakt/' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)

  return (
    <header className="site-header sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black font-heading tracking-tight text-[var(--accent)]">
          Hi<span className="text-[var(--accent-light)]">-Sci</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 nav-menu">
          <Link
            href="/"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-section)]"
          >
            Główna
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button
              type="button"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-section)] inline-flex items-center gap-1.5"
              onClick={() => setCatOpen(v => !v)}
              aria-haspopup="true"
              aria-expanded={catOpen}
            >
              Kategorie
              <span className={`text-xs transition-transform ${catOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {catOpen && (
              <div className="absolute left-0 top-full pt-2 w-72">
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-2 grid grid-cols-1 gap-0.5">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/kategoria/${cat.slug}/`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-section)] transition-colors group"
                      onClick={() => setCatOpen(false)}
                    >
                      <span className="text-xl shrink-0" role="img" aria-label={cat.label}>{cat.emoji}</span>
                      <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/o-nas/"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-section)]"
          >
            O nas
          </Link>
          <Link
            href="/kontakt/"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-section)]"
          >
            Kontakt
          </Link>
        </nav>

        <button
          className="md:hidden p-2 rounded-lg transition-colors text-[var(--text)]"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[var(--bg-card)] border-t border-[var(--border)] px-4 py-4 flex flex-col gap-1 nav-menu shadow-lg">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-section)] px-4 py-2.5 rounded-lg transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-[var(--border)]">
            <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Kategorie</div>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/kategoria/${cat.slug}/`}
                className="flex items-center gap-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-section)] px-4 py-2.5 rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span role="img" aria-label={cat.label}>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
