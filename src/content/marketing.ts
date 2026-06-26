"use client";
import { useLang } from "@/context/lang-context";

// Copy for the redesigned marketing pages (home, platform, about, pricing) and
// the nav, in English and Italian.

const en = {
  nav: {
    collections: "Collections",
    stylists: "Stylists",
    platform: "The Platform",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
    tryPlatform: "Try the Platform",
    login: "Log in",
  },
  home: {
    heroEyebrow: "samples.fashion",
    heroStatement: "Two interfaces, designed for stylists and for brands & press offices.",
    stylist: {
      tag: "For stylists",
      title: "Your work, organised.",
      points: [
        "No more Excel sheets and endless emails.",
        "Samples makes organisation simple and efficient.",
        "Showcase your work to a community of brands and press offices.",
      ],
      cta: "Discover Brand Collections",
    },
    brand: {
      tag: "For brands & press offices",
      title: "Your samples, under control.",
      points: [
        "No more sorting through thousands of emails.",
        "No more lost pieces or disorganised sample management.",
        "With Samples, everything becomes structured and easy to manage.",
        "Easily discover stylists that match your brand.",
      ],
      cta: "Discover Stylists on the Platform",
    },
    stylistSection: {
      eyebrow: "For stylists",
      title: "From scattered to streamlined.",
      problemsTitle: "Today",
      problems: [
        "Requests live in emails, DMs and spreadsheets.",
        "No clear view of what's available or already booked.",
        "Returns and deadlines are easy to lose track of.",
        "Your work is hard to showcase in one place.",
      ],
      solutionsTitle: "With Samples",
      solutions: [
        "Browse brand collections and request samples in a click.",
        "Track every piece from request to return.",
        "Deadlines and logistics handled in one workspace.",
        "A public profile that shows your work to the industry.",
      ],
    },
    brandSection: {
      eyebrow: "For brands & press offices",
      title: "Your press room, finally structured.",
      problemsTitle: "Today",
      problems: [
        "Thousands of emails to sort through.",
        "Pieces get lost; nobody knows who has what.",
        "Sample management is manual and disorganised.",
        "Finding the right stylists takes endless back-and-forth.",
      ],
      solutionsTitle: "With Samples",
      solutions: [
        "A real-time inventory of every piece and its status.",
        "Approve or decline requests with a full audit trail.",
        "Structured loans, from call-in to return.",
        "Discover stylists that match your brand.",
      ],
    },
    finalCta: {
      eyebrow: "Get started",
      title: "Bring your samples online.",
      description: "Talk to us, or try the platform during the launch phase.",
      contact: "Contact us",
      tryPlatform: "Try the Platform",
    },
  },
  platform: {
    heroEyebrow: "The Platform",
    heroTitle: "How Samples works.",
    heroDescription:
      "One workspace that connects stylists with brands and press offices — and keeps every sample loan traceable from request to return.",
    howTitle: "From request to return",
    steps: [
      { label: "Request", desc: "A stylist browses collections and requests samples." },
      { label: "Approve", desc: "The brand or press office approves or declines, with a full trail." },
      { label: "Ship", desc: "Logistics and tracking are linked to each loan." },
      { label: "Track", desc: "Everyone sees the live status of every piece." },
      { label: "Return", desc: "Items are marked returned; inventory updates instantly." },
    ],
    stylist: {
      tag: "For stylists",
      title: "Everything in one place",
      needs: [
        "Find the right pieces fast.",
        "Keep requests, deadlines and returns organised.",
        "Build a portfolio brands can discover.",
      ],
    },
    brand: {
      tag: "For brands & press offices",
      title: "Control without the chaos",
      needs: [
        "Know where every sample is, in real time.",
        "Replace email threads with structured requests.",
        "Reach the stylists who fit your brand.",
      ],
    },
    cta: "Try the Platform",
  },
  about: {
    heroEyebrow: "About",
    heroTitle: "Samples started with a real problem.",
    paragraphs: [
      "Samples was born from a problem we saw first-hand in the fashion industry: sample loans between stylists, brands and press offices still run on emails, spreadsheets and guesswork.",
      "Our goal is to modernise and simplify that relationship — to give stylists, brands and press offices a single, traceable place to work together.",
    ],
    milanTitle: "Built in Milan",
    milanBody:
      "Milan, Italy is the perfect place to build this — one of the historical capitals of fashion, where the industry's relationships are made every day.",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Free during the launch phase.",
    intro: "Pick the profile that fits you. During launch, Samples is free — and you can tell us what you'd consider a fair price.",
    free: "Free during launch phase",
    suggest: "You can suggest what you think is a fair price for this service.",
    tiers: [
      { key: "stylists", title: "Stylists", desc: "Request samples, track loans and showcase your work." },
      { key: "brands", title: "Brands", desc: "Manage your press room and discover the right stylists." },
      { key: "press", title: "Press Offices", desc: "Run sample logistics for the brands you represent." },
    ],
    form: {
      email: "Work email",
      price: "Your fair price (optional)",
      pricePlaceholder: "e.g. €29 / month",
      message: "Anything else?",
      submit: "Send",
      success: "Thanks — we'll be in touch.",
    },
  },
  unavailable: {
    eyebrow: "Coming soon",
    title: "The platform isn't available yet.",
    body: "We're putting the final touches on samples.fashion. It will be available very soon — in the meantime, get in touch and we'll keep you posted.",
    contact: "Contact us",
    home: "Back to home",
  },
} as const;

type MarketingDict = typeof en;

const it: MarketingDict = {
  nav: {
    collections: "Collezioni",
    stylists: "Stylist",
    platform: "La Piattaforma",
    pricing: "Prezzi",
    about: "Chi siamo",
    contact: "Contatti",
    tryPlatform: "Prova la piattaforma",
    login: "Accedi",
  },
  home: {
    heroEyebrow: "samples.fashion",
    heroStatement: "Due interfacce, pensate per stylist e per brand e uffici stampa.",
    stylist: {
      tag: "Per gli stylist",
      title: "Il tuo lavoro, organizzato.",
      points: [
        "Basta fogli Excel ed email infinite.",
        "Samples rende l'organizzazione semplice ed efficiente.",
        "Mostra il tuo lavoro a una community di brand e uffici stampa.",
      ],
      cta: "Scopri le collezioni dei brand",
    },
    brand: {
      tag: "Per brand e uffici stampa",
      title: "I tuoi campioni, sotto controllo.",
      points: [
        "Basta smistare migliaia di email.",
        "Niente più capi persi o gestione disordinata dei campioni.",
        "Con Samples tutto diventa strutturato e facile da gestire.",
        "Scopri facilmente gli stylist giusti per il tuo brand.",
      ],
      cta: "Scopri gli stylist sulla piattaforma",
    },
    stylistSection: {
      eyebrow: "Per gli stylist",
      title: "Dal disordine al flusso.",
      problemsTitle: "Oggi",
      problems: [
        "Le richieste vivono tra email, DM e fogli di calcolo.",
        "Nessuna visione chiara di ciò che è disponibile o già prenotato.",
        "Resi e scadenze facili da perdere di vista.",
        "Difficile mostrare il tuo lavoro in un unico posto.",
      ],
      solutionsTitle: "Con Samples",
      solutions: [
        "Sfoglia le collezioni dei brand e richiedi i campioni con un clic.",
        "Traccia ogni capo, dalla richiesta al reso.",
        "Scadenze e logistica gestite in un unico spazio.",
        "Un profilo pubblico che mostra il tuo lavoro al settore.",
      ],
    },
    brandSection: {
      eyebrow: "Per brand e uffici stampa",
      title: "Il tuo showroom, finalmente strutturato.",
      problemsTitle: "Oggi",
      problems: [
        "Migliaia di email da smistare.",
        "I capi si perdono; nessuno sa chi ha cosa.",
        "La gestione dei campioni è manuale e disordinata.",
        "Trovare gli stylist giusti richiede infiniti scambi.",
      ],
      solutionsTitle: "Con Samples",
      solutions: [
        "Un inventario in tempo reale di ogni capo e del suo stato.",
        "Approva o rifiuta le richieste con tracciabilità completa.",
        "Prestiti strutturati, dalla richiesta al reso.",
        "Scopri gli stylist adatti al tuo brand.",
      ],
    },
    finalCta: {
      eyebrow: "Inizia",
      title: "Porta online i tuoi campioni.",
      description: "Parla con noi o prova la piattaforma durante la fase di lancio.",
      contact: "Contattaci",
      tryPlatform: "Prova la piattaforma",
    },
  },
  platform: {
    heroEyebrow: "La Piattaforma",
    heroTitle: "Come funziona Samples.",
    heroDescription:
      "Un unico spazio che collega gli stylist con brand e uffici stampa — e rende ogni prestito di campioni tracciabile dalla richiesta al reso.",
    howTitle: "Dalla richiesta al reso",
    steps: [
      { label: "Richiesta", desc: "Lo stylist sfoglia le collezioni e richiede i campioni." },
      { label: "Approvazione", desc: "Il brand o l'ufficio stampa approva o rifiuta, con tracciabilità." },
      { label: "Spedizione", desc: "Logistica e tracking collegati a ogni prestito." },
      { label: "Tracciamento", desc: "Tutti vedono lo stato live di ogni capo." },
      { label: "Reso", desc: "I capi vengono segnati come resi; l'inventario si aggiorna subito." },
    ],
    stylist: {
      tag: "Per gli stylist",
      title: "Tutto in un unico posto",
      needs: [
        "Trova velocemente i capi giusti.",
        "Tieni richieste, scadenze e resi in ordine.",
        "Costruisci un portfolio che i brand possono scoprire.",
      ],
    },
    brand: {
      tag: "Per brand e uffici stampa",
      title: "Controllo senza il caos",
      needs: [
        "Sai dov'è ogni campione, in tempo reale.",
        "Sostituisci i thread di email con richieste strutturate.",
        "Raggiungi gli stylist adatti al tuo brand.",
      ],
    },
    cta: "Prova la piattaforma",
  },
  about: {
    heroEyebrow: "Chi siamo",
    heroTitle: "Samples nasce da un problema reale.",
    paragraphs: [
      "Samples nasce da un problema vissuto in prima persona nel settore moda: i prestiti di campioni tra stylist, brand e uffici stampa si gestiscono ancora con email, fogli di calcolo e improvvisazione.",
      "Il nostro obiettivo è modernizzare e semplificare questa relazione — dare a stylist, brand e uffici stampa un unico spazio tracciabile in cui lavorare insieme.",
    ],
    milanTitle: "Costruito a Milano",
    milanBody:
      "Milano, in Italia, è il posto perfetto per costruirlo — una delle capitali storiche della moda, dove le relazioni del settore si creano ogni giorno.",
  },
  pricing: {
    eyebrow: "Prezzi",
    title: "Gratis durante la fase di lancio.",
    intro: "Scegli il profilo adatto a te. Durante il lancio, Samples è gratuito — e puoi dirci quale prezzo riterresti giusto.",
    free: "Gratis durante la fase di lancio",
    suggest: "Puoi suggerire il prezzo che ritieni giusto per questo servizio.",
    tiers: [
      { key: "stylists", title: "Stylist", desc: "Richiedi campioni, traccia i prestiti e mostra il tuo lavoro." },
      { key: "brands", title: "Brand", desc: "Gestisci il tuo showroom e scopri gli stylist giusti." },
      { key: "press", title: "Uffici stampa", desc: "Gestisci la logistica dei campioni per i brand che rappresenti." },
    ],
    form: {
      email: "Email di lavoro",
      price: "Il tuo prezzo giusto (facoltativo)",
      pricePlaceholder: "es. 29 € / mese",
      message: "Altro?",
      submit: "Invia",
      success: "Grazie — ti contatteremo.",
    },
  },
  unavailable: {
    eyebrow: "Presto disponibile",
    title: "La piattaforma non è ancora disponibile.",
    body: "Stiamo mettendo a punto gli ultimi dettagli di samples.fashion. Sarà disponibile molto presto — nel frattempo, contattaci e ti terremo aggiornato.",
    contact: "Contattaci",
    home: "Torna alla home",
  },
};

export const marketing = { en, it };

/** Marketing copy for the current language. */
export function useMarketing() {
  const { lang } = useLang();
  return marketing[lang];
}
