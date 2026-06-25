import { en } from "./en"

// Italian dictionary. Spreads the English base and overrides the user-facing
// UI strings; deeper legacy copy falls back to English until fully translated.
export const it: typeof en = {
  ...en,
  nav: {
    ...en.nav,
    discover: "Stylist",
    runway: "Collezioni",
    platform: "La Piattaforma",
    about: "Chi siamo",
    contact: "Contatti",
    bookDemo: "Prova la piattaforma",
  },
  login: {
    ...en.login,
    button: "Accedi",
  },
  contact: {
    ...en.contact,
    title: "Contatti",
    firstName: "Nome",
    lastName: "Cognome",
    email: "Email",
    position: "Ruolo",
    socialMedia: "Social",
    message: "Messaggio",
    submit: "Invia",
    success: "Messaggio inviato. Ti ricontatteremo a breve.",
    error: "Si è verificato un errore. Riprova.",
    eyebrow: "Mettiti in contatto",
    errorRequired: "Questo campo è obbligatorio.",
    errorEmail: "Inserisci un indirizzo email valido.",
    formLabel: "Modulo di contatto",
    sending: "Invio in corso…",
    requiredNote: "Campi obbligatori",
    imageCaption: "Studio · Milano",
  },
}
