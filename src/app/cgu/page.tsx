"use client";
import { Canvas, Glass, Eyebrow } from "@decapix/sf-ui";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface Subsection {
  subtitle: string;
  content?: string[];
  list?: string[];
}
interface Section {
  id: string;
  title: string;
  content?: string[];
  list?: string[];
  subsections?: Subsection[];
}

const sections: Section[] = [
  {
    id: "1",
    title: "Oggetto",
    content: [
      "Le presenti Condizioni Generali di Utilizzo (di seguito «CGU») hanno lo scopo di definire le modalità di accesso e di utilizzo della piattaforma samples.fashion (di seguito «la Piattaforma»).",
      "Accedendo alla Piattaforma, l'utente accetta senza riserve le presenti CGU.",
    ],
  },
  {
    id: "2",
    title: "Accesso alla piattaforma",
    content: [
      "La Piattaforma è accessibile ai professionisti del settore moda, in particolare stylist, brand e uffici stampa.",
      "samples.fashion si riserva il diritto di sospendere o rifiutare l'accesso a qualsiasi utente in caso di mancato rispetto delle presenti CGU.",
    ],
  },
  {
    id: "3",
    title: "Proprietà intellettuale",
    content: [
      "Tutti gli elementi presenti sulla Piattaforma, inclusi in particolare le interfacce, le tecnologie, i database, i testi, le immagini, i loghi e i contenuti editoriali, sono di proprietà esclusiva di samples.fashion o dei suoi partner.",
      "Sono protetti dalle leggi sulla proprietà intellettuale. Qualsiasi riproduzione, diffusione o sfruttamento non autorizzato è severamente vietato.",
    ],
  },
  {
    id: "3bis",
    title: "Contenuti degli utenti e protezione contro l'estrazione dei dati",
    subsections: [
      {
        subtitle: "Contenuti pubblicati",
        content: [
          "Gli utenti (brand, stylist, uffici stampa) possono pubblicare contenuti che includono in particolare immagini, testi, collezioni, campioni, look e progetti.",
        ],
      },
      {
        subtitle: "Proprietà dei contenuti",
        content: [
          "Gli utenti restano proprietari dei contenuti che pubblicano. Tuttavia, pubblicando tali contenuti, concedono a samples.fashion una licenza mondiale, non esclusiva e gratuita, che ne consente l'hosting, la riproduzione, la rappresentazione e la diffusione, anche negli spazi pubblici della Piattaforma (in particolare Collezioni e Stylist).",
        ],
      },
      {
        subtitle: "Accesso pubblico e assenza di diritto di sfruttamento",
        content: [
          "Alcuni contenuti possono essere accessibili pubblicamente. Tale accesso non conferisce alcun diritto di riutilizzo o di sfruttamento.",
        ],
      },
      {
        subtitle: "Divieto di estrazione e di scraping",
        content: ["È severamente vietato:"],
        list: [
          "Utilizzare bot, script, crawler o qualsiasi altro processo automatizzato",
          "Estrarre, copiare o raccogliere dati in modo massivo o sistematico",
          "Costituire un database a partire dai contenuti",
          "Sfruttare i dati a fini concorrenziali o di addestramento di modelli",
        ],
      },
      {
        subtitle: "Sanzioni",
        content: [
          "Qualsiasi violazione costituisce una violazione delle CGU, una lesione dei diritti di proprietà intellettuale e una lesione del diritto sui database.",
          "samples.fashion si riserva il diritto di sospendere o bloccare l'accesso, di intraprendere azioni legali e di richiedere il risarcimento dei danni.",
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Utilizzo della piattaforma",
    content: ["L'utente si impegna a:"],
    list: [
      "Utilizzare la Piattaforma in modo conforme alla sua destinazione",
      "Non perturbarne il funzionamento",
      "Non sviare i servizi offerti",
      "Non accedere fraudolentemente ai dati",
    ],
  },
  {
    id: "5",
    title: "Abbonamenti e pagamenti",
    content: [
      "Alcune funzionalità sono accessibili tramite abbonamento. I pagamenti vengono effettuati esclusivamente sulla piattaforma samples.fashion e non tramite le applicazioni mobili.",
      "Gli abbonamenti sono dovuti per il periodo sottoscritto e non sono rimborsabili salvo diversa disposizione.",
    ],
  },
  {
    id: "6",
    title: "Risoluzione",
    content: [
      "L'utente può risolvere il proprio abbonamento secondo le modalità previste sulla Piattaforma. Qualsiasi periodo già iniziato resta dovuto.",
      "samples.fashion si riserva il diritto di sospendere o eliminare un account in caso di violazione delle CGU.",
    ],
  },
  {
    id: "7",
    title: "Responsabilità",
    content: [
      "samples.fashion agisce come piattaforma di messa in relazione e di organizzazione. In quanto tale, samples.fashion non interviene negli scambi fisici e non è responsabile per perdite, furti o danneggiamenti dei capi, anche se tracciati tramite la Piattaforma.",
    ],
    subsections: [
      {
        subtitle: "Limitazione di responsabilità",
        content: [
          "samples.fashion non potrà essere ritenuta responsabile per danni indiretti, perdite di fatturato, perdite di opportunità o danni all'immagine.",
        ],
      },
    ],
  },
  {
    id: "8",
    title: "Dati e analytics",
    content: [
      "samples.fashion può raccogliere dati di utilizzo, in particolare di navigazione, di interazioni e di eventi sulla piattaforma. Questi dati sono utilizzati per migliorare i servizi e analizzare l'utilizzo della Piattaforma.",
    ],
  },
  {
    id: "9",
    title: "Sicurezza",
    content: [
      "samples.fashion adotta misure di sicurezza ragionevoli. Tuttavia, poiché nessun sistema è totalmente sicuro, l'utente riconosce di utilizzare la Piattaforma a proprio rischio.",
    ],
  },
  {
    id: "10",
    title: "Sospensione e restrizione",
    content: [
      "samples.fashion si riserva il diritto di limitare alcune funzionalità, sospendere un account o limitare l'accesso a tutta o parte della Piattaforma.",
    ],
  },
  {
    id: "11",
    title: "Modifica delle CGU",
    content: [
      "samples.fashion può modificare le presenti CGU in qualsiasi momento. Gli utenti saranno informati degli aggiornamenti.",
    ],
  },
  {
    id: "12",
    title: "Legge applicabile e foro competente",
    content: [
      "Le presenti CGU sono regolate dalla legge italiana.",
      "Per qualsiasi controversia relativa alla loro validità, interpretazione o esecuzione sarà competente in via esclusiva il Foro di Milano (Italia), fatte salve le norme imperative a tutela del consumatore.",
    ],
  },
];

export default function CguPage() {
  return (
    <Canvas fixed className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-32 sm:px-8">
          <Eyebrow className="mb-4">samples.fashion</Eyebrow>
          <h1 className="font-display text-[clamp(3rem,9vw,5.5rem)] leading-none tracking-tight text-ink">
            CGU
          </h1>
          <div className="my-7 h-px w-16 bg-ink/20" />
          <p className="font-body text-base text-ink/55">
            Condizioni Generali di Utilizzo
          </p>
        </div>

        {/* Table of contents */}
        <div className="mx-auto max-w-5xl px-5 pb-10 sm:px-8">
          <Glass className="rounded-sf-lg p-6 sm:p-8">
            <Eyebrow className="mb-5">Sommario</Eyebrow>
            <nav className="grid gap-x-12 gap-y-3 md:grid-cols-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#article-${s.id}`}
                  className="flex gap-3 font-body text-sm text-ink/65 transition-colors hover:text-ink"
                >
                  <span className="font-medium text-ink/30">{s.id}.</span>
                  {s.title}
                </a>
              ))}
            </nav>
          </Glass>
        </div>

        {/* Sections */}
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          {sections.map((section, i) => (
            <article
              key={section.id}
              id={`article-${section.id}`}
              className={`scroll-mt-24 ${i !== 0 ? "mt-14 border-t border-white/40 pt-14" : ""}`}
            >
              <div className="mb-6 flex items-baseline gap-4">
                <span className="font-body text-[11px] uppercase tracking-[0.2em] text-ink/30">
                  Art. {section.id}
                </span>
                <h2 className="font-display text-xl text-ink md:text-2xl">{section.title}</h2>
              </div>

              {section.content?.map((p, j) => (
                <p key={j} className="mb-4 max-w-3xl font-body leading-relaxed text-ink/65">
                  {p}
                </p>
              ))}

              {section.list && (
                <ul className="mt-4 max-w-3xl space-y-2">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 font-body leading-relaxed text-ink/65">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sand-dk" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.subsections?.map((sub, k) => (
                <div key={k} className="ml-0 mt-8 md:ml-8">
                  <h3 className="mb-3 font-body text-sm uppercase tracking-[0.14em] text-ink/45">
                    {sub.subtitle}
                  </h3>
                  {sub.content?.map((p, j) => (
                    <p key={j} className="mb-4 max-w-3xl font-body leading-relaxed text-ink/65">
                      {p}
                    </p>
                  ))}
                  {sub.list && (
                    <ul className="mt-4 max-w-3xl space-y-2">
                      {sub.list.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 font-body leading-relaxed text-ink/65">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sand-dk" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </Canvas>
  );
}
