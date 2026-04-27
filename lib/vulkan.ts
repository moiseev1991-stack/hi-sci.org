import type { Post } from '@/lib/posts'

export const VULKAN_SLUGS = [
  'najlepsze-kasyna-online-2026',
  'recenzja-vulkan-vegas-2026',
  'vulkan-vegas-bonus-powitalny-4000-pln',
  'vulkan-vegas-blik-wplaty-i-wyplaty',
  'vulkan-vegas-program-vip-i-cashback',
  'vulkan-vegas-aplikacja-mobilna-android-ios',
  'vulkan-vegas-turnieje-i-promocje-cotygodniowe',
] as const

export function isVulkanSlug(slug: string): boolean {
  return (VULKAN_SLUGS as readonly string[]).includes(slug)
}

// Sorted-list assignment → exact 8/8/8/9/9/9/9 distribution over 60 non-Vulkan posts.
// (60 / 7 = 8 remainder 4 → first 4 Vulkan slugs receive 9 inbound links, last 3 receive 8.)
export function pickVulkanTargetForSlug(slug: string, allPosts: Post[]): string | null {
  if (isVulkanSlug(slug)) return null
  const nonVulkanSlugs = allPosts
    .map(p => p.slug)
    .filter(s => !isVulkanSlug(s))
    .sort()
  const idx = nonVulkanSlugs.indexOf(slug)
  if (idx < 0) return null
  return VULKAN_SLUGS[idx % VULKAN_SLUGS.length]
}
