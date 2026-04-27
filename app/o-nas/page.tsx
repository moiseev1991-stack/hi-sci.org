import Breadcrumbs from '@/components/Breadcrumbs'
import { siteConfig } from '@/lib/config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O nas',
  description: 'Dowiedz się więcej o redakcji Hi-Sci – portalu o kasynach online dla polskich graczy.',
  alternates: { canonical: `${siteConfig.url}/o-nas/` },
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: 'O nas', href: '/o-nas/' }]} />
      <h1 className="font-heading text-4xl font-bold text-[var(--text)] mb-6">O nas</h1>

      <div className="prose prose-lg max-w-none prose-headings:font-heading">
        <p>
          <strong>Hi-Sci</strong> to polski portal o kasynach online. Tworzymy go z pasji do gier i analitycznego podejścia do wyboru bezpiecznych, licencjonowanych operatorów dla polskich graczy.
        </p>

        <h2>Nasza misja</h2>
        <p>
          Wierzymy, że dobry wybór kasyna zaczyna się od rzetelnej informacji. Naszą misją jest dostarczanie obiektywnych recenzji, jasnych porównań bonusów i praktycznych strategii, które pomagają polskim graczom grać świadomie i odpowiedzialnie.
        </p>

        <h2>Co znajdziesz na naszych stronach?</h2>
        <ul>
          <li>Recenzje licencjonowanych kasyn online dla polskich graczy</li>
          <li>Porównania bonusów powitalnych, free spins i programów lojalnościowych</li>
          <li>Przewodniki po metodach płatności (BLIK, karty, e-portfele)</li>
          <li>Wskazówki dotyczące slotów, gier stołowych i live casino</li>
          <li>Strategie i porady dla graczy początkujących i zaawansowanych</li>
        </ul>

        <h2>Redakcja</h2>
        <p>
          Nasz zespół tworzą pasjonaci gier hazardowych i analitycy, którzy na co dzień śledzą rynek kasyn online w Polsce i Europie. Każda recenzja powstaje w oparciu o testy, analizę regulaminów i doświadczenie z realnymi wypłatami.
        </p>

        <p className="text-sm text-[var(--text-muted)]">
          <strong>Pamiętaj:</strong> hazard jest dozwolony wyłącznie dla osób, które ukończyły 18 lat. Hazard może uzależniać. Graj odpowiedzialnie i w granicach swoich możliwości finansowych.
        </p>

        <p>
          Zapraszamy do lektury. Jeśli masz pytania lub sugestie, skontaktuj się z nami przez stronę <a href="/kontakt/">Kontakt</a>.
        </p>
      </div>
    </div>
  )
}
