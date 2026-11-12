/* Hypnum · Assistant de devis — réglages des tatoueurs.
   Chaque tatoueur a sa propre fiche. Tant qu'une fiche n'est pas complète, le formulaire reste fermé.
   Remplir avec la page /devis/reglages.html, puis coller ici le résultat (bouton « 复制设置 »).
   HQ_ENDPOINT : adresse du script Google (vide = mode démo, rien n'est envoyé). */
window.HQ_ENDPOINT = "";
window.HQ_ACTIVE = "hypnum";
window.HQ_ARTISTS = {
  hypnum: {
    id: "hypnum",
    version: 1,
    mode: null,
    A: {
      name: "Hypnum Paris",
      years: 1.5,
      instagram: "hypnum.paris",
      work: "",
      cost: {},
      location: "Paris",
      daysPerMonth: null,
      maxSession: null,
      reply: {n: 24, unit: "h"},
      styles: [],
      styleOther: "",
      refuse: [],
      refuseOther: "",
      languages: ["fr", "en", "zh"],
      designFee: null,
      retouch: null,
      payment: [],
      payOther: ""
    },
    M2: null,
    B: null
  }
};
