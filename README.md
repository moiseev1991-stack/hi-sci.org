# Hi-Sci

Polski portal o kasynach online — recenzje, bonusy, strategie i porady dla polskich graczy. Stack: Next.js 14 (static export) + Tailwind + MDX, deploy na GitHub Pages, cotygodniowa auto-generacja artykułów przez OpenAI gpt-4o.

## Local development

```bash
npm install
npm run dev
```

Site runs at `http://localhost:3000`.

Build static output:

```bash
npm run build
```

Output goes to `out/`.

## Auto-generated weekly posts

Workflow `.github/workflows/weekly-post.yml` runs every Monday 10:00 UTC and:
1. Picks a fresh casino-related topic (slot reviews, bonus comparisons, payment guides, strategies, etc.)
2. Generates an SVG illustration
3. Writes a 1600+ word Polish article via OpenAI `gpt-4o`
4. Commits + pushes to `master`

Required GitHub secret: `OPENAI_API_KEY`. To run manually: **Actions → Weekly Post Generation → Run workflow**.

## Deployment

Workflow `.github/workflows/deploy.yml` builds on every push to `master` and publishes to the `deploy` branch. GitHub Pages serves from `deploy` branch with CNAME `hi-sci.org`.

DNS A records for the apex domain should point to:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

## Money page

Affiliate target: **[Vulkan Vegas](https://vulkankasyno.pl)** — bonus 100% do 4000 PLN + 150 free spins, MGA license, BLIK payments, 24h withdrawals. Pinned as the featured article on the homepage via `siteConfig.featuredPostSlug`.

## License

MIT.
