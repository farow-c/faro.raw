const translations = {
  en: {
    enter: "enter ?",
    nav_works: "works",
    nav_about: "about",
    nav_contact: "contact",
    nav_commissions: "commissions",
    nav_shop: "shop",
    works_header: "works.",
    about_title: "faro.raw",
    about_p1: "faro is a traditional artist working in graphite and shadow.",
    about_p2: "Her work lives in the space between horror and tenderness — where the body becomes a language, and every wound a word. She draws what cannot be said: limerence, body horror, dark love, the medieval weight of grief, the quiet violence of feeling too much.",
    about_p3: "Black and white, mostly. Occasionally, red.",
    about_p4: "She is not interested in decoration. She is interested in what happens when something breaks open.",
    contact_header: "contact.",
    commissions_header: "commissions.",
    commissions_status: "Commissions are currently closed.",
    commissions_body: "faro takes on a limited number of private commissions when available. Each piece is original — traditional media, graphite on paper.",
    commissions_notify: "To be notified when commissions open:",
    notify_btn: "notify me",
    notify_placeholder: "your email",
    copied: "copied.",
    medium: "graphite on paper",
    back_to_works: "← works",
    move_to_explore: "— move your torch to explore —",
    move_to_explore_mobile: "— tilt or drag to explore —",
  },
  fr: {
    enter: "entrer ?",
    nav_works: "œuvres",
    nav_about: "à propos",
    nav_contact: "contact",
    nav_commissions: "commandes",
    nav_shop: "boutique",
    works_header: "œuvres.",
    about_title: "faro.raw",
    about_p1: "faro est une artiste traditionnelle. Elle travaille au graphite et dans l'ombre.",
    about_p2: "Son œuvre vit dans l'espace entre l'horreur et la tendresse — là où le corps devient un langage, et chaque blessure un mot. Elle dessine ce qui ne peut pas se dire : la limerence, le body horror, l'amour sombre, le poids médiéval du deuil, la violence silencieuse de ressentir trop.",
    about_p3: "Noir et blanc, principalement. Parfois, du rouge.",
    about_p4: "Elle ne s'intéresse pas à la décoration. Elle s'intéresse à ce qui se passe quand quelque chose s'ouvre.",
    contact_header: "contact.",
    commissions_header: "commandes.",
    commissions_status: "Les commandes sont actuellement fermées.",
    commissions_body: "faro accepte un nombre limité de commandes privées selon les disponibilités. Chaque pièce est originale — techniques traditionnelles, graphite sur papier.",
    commissions_notify: "Pour être notifié·e à la réouverture :",
    notify_btn: "me notifier",
    notify_placeholder: "votre email",
    copied: "copié.",
    medium: "graphite sur papier",
    back_to_works: "← œuvres",
    move_to_explore: "— déplacez votre torche pour explorer —",
    move_to_explore_mobile: "— inclinez ou glissez pour explorer —",
  }
};

const i18n = {
  current: localStorage.getItem("faro_lang") || "en",

  t(key) {
    return (translations[this.current] && translations[this.current][key]) || translations.en[key] || key;
  },

  setLang(lang) {
    if (!translations[lang]) return;
    this.current = lang;
    localStorage.setItem("faro_lang", lang);
    this.apply();
  },

  apply() {
    document.documentElement.setAttribute("lang", this.current);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", this.t(key));
    });
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === this.current);
    });
  },

  init() {
    this.apply();
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => this.setLang(btn.dataset.lang));
    });
  }
};

document.addEventListener("DOMContentLoaded", () => i18n.init());
