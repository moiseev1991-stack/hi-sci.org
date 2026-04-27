import type { Post } from '@/lib/posts'

export interface Category {
  slug: string
  label: string
  emoji: string
  description: string
}

export const CATEGORIES: Category[] = [
  { slug: 'sloty',       label: 'Sloty',       emoji: '🎰', description: 'Recenzje slotów online, RTP, mechaniki i topowi dostawcy gier dla polskich graczy.' },
  { slug: 'live-casino', label: 'Live Casino', emoji: '🪟', description: 'Gry na żywo z prawdziwymi krupierami — blackjack, ruletka, baccarat i game shows.' },
  { slug: 'klasyka',     label: 'Gry stołowe', emoji: '🪵', description: 'Klasyczne gry stołowe — blackjack, poker, baccarat, ruletka, craps. Zasady i odmiany.' },
  { slug: 'strategie',   label: 'Strategie',   emoji: '🎨', description: 'Sprawdzone strategie i systemy gry — Martingale, Paroli, d\'Alembert, zarządzanie bankrollem.' },
  { slug: 'promocje',    label: 'Promocje',    emoji: '🌿', description: 'Cashbacki, turnieje, freespiny weekendowe i promocje cykliczne w kasynach online.' },
  { slug: 'mobile',      label: 'Mobile',      emoji: '💻', description: 'Mobilne kasyna online — aplikacje Android i iOS, PWA, BLIK z poziomu telefonu.' },
  { slug: 'bonusy',      label: 'Bonusy',      emoji: '✨', description: 'Bonusy powitalne, bez depozytu, reload i programy VIP — porównania i analiza warunków.' },
  { slug: 'recenzje',    label: 'Recenzje',    emoji: '🍳', description: 'Pełne recenzje konkretnych kasyn online dla polskich graczy — Vulkan Vegas, Betsson, 22Bet i inne.' },
  { slug: 'porady',      label: 'Porady',      emoji: '💡', description: 'Praktyczne porady — KYC, BLIK, samowykluczenie, licencje, odpowiedzialna gra i FAQ.' },
]

export const EMOJI_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.emoji, c.slug])
)

export const CATEGORY_BY_SLUG: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map(c => [c.slug, c])
)

export function postsInCategory(allPosts: Post[], categorySlug: string): Post[] {
  return allPosts.filter(p => EMOJI_TO_CATEGORY[p.emoji] === categorySlug)
}
