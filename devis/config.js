/* Hypnum · Assistant de devis — réglages des tatoueurs.
   Chaque tatoueur a sa propre fiche. Tant qu'une fiche n'est pas complète, le formulaire reste fermé.
   Remplir avec la page /devis/reglages.html, puis coller ici le résultat (bouton « 复制设置 »).
   HQ_ENDPOINT : adresse du script Google (vide = mode démo, rien n'est envoyé). */
window.HQ_ENDPOINT = "https://script.google.com/macros/s/AKfycbznPgXKwpIQt_Pu5epX7UaCpF4OdcaZwCYEdjOHwv4wQd_iQZYe6QBfNim7OzjLuD0O/exec";
window.HQ_OPEN = true;   /* true = ouvert aux clients (après un essai réussi avec ?preview=1&send=1) */
window.HQ_ACTIVE = "hypnum";
window.HQ_ARTISTS = {
  hypnum: {
    id: "hypnum", version: 1, mode: 1,
    A: {
      name: "Hypnum Paris", mailLang: "zh", years: 1.5, instagram: "hypnum.paris",
      work: "desk", cost: {}, location: "Paris", daysPerMonth: 8, maxSession: 6,
      reply: {n: 24, unit: "h"},
      styles: ["fine", "black", "mini", "letter", "realbw"], styleOther: "",
      refuse: ["coverup", "intimate", "hate"], refuseOther: "",
      languages: ["fr", "en", "zh"],
      designFee: {pct: 35},
      retouch: {free: 2, months: 5},
      payment: ["cash", "card", "transfer", "online"], payOther: ""
    },
    M2: null,
    B: {
      min: 60, hourly: 100,
      sizes: {xs: [60, 90], s: [80, 180], m: [180, 320], l: [250, 550]},
      large: {half: [9, 13], full: [18, 26], back: [22, 35]},
      colorPct: 20, tiers: {n: 0, d: 10}, placeTier: {}, coverPct: 30,
      tech: {line: 0, shade: 15, fill: 30}, stylePct: {}, cxPct: {simple: 0, medium: 10, complex: 25},
      deposit: {type: "pct", pct: 30, min: 30, amount: null, refundable: false, deducted: true},
      flashDiscount: 0
    }
  }
};
