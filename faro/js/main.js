(function () {
  "use strict";

  /* ---------- page entrance fade ---------- */
  document.documentElement.style.visibility = "visible";
  requestAnimationFrame(() => document.body.classList.add("page-ready"));

  /* ---------- nav: active link ---------- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav .nav-links a[data-page]").forEach((a) => {
    if (a.dataset.page === path) a.classList.add("active");
  });

  /* ---------- nav: dim on scroll ---------- */
  const nav = document.querySelector(".site-nav");
  if (nav) {
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY && y > 80) {
          nav.classList.add("nav-dim");
        } else {
          nav.classList.remove("nav-dim");
        }
        lastY = y;
        ticking = false;
      });
    });
  }

  /* ---------- page transition veil for internal nav links ---------- */
  const veil = document.createElement("div");
  veil.className = "page-veil";
  document.body.appendChild(veil);

  document.querySelectorAll("a[data-transition]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank") return;
      e.preventDefault();
      veil.classList.add("veil-in");
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });

  /* ---------- works page: card stagger ---------- */
  const cards = document.querySelectorAll(".work-card");
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 100}ms`;
  });

  /* ---------- works page: flag landscape artworks ----------
     detected from each image's real natural dimensions, not hardcoded
     per file, so any future landscape piece is handled automatically */
  cards.forEach((card) => {
    const img = card.querySelector("img");
    if (!img) return;
    const flagIfLandscape = () => {
      if (img.naturalWidth > img.naturalHeight) {
        card.classList.add("landscape");
      }
    };
    if (img.complete && img.naturalWidth) {
      flagIfLandscape();
    } else {
      img.addEventListener("load", flagIfLandscape, { once: true });
    }
  });

  /* ---------- contact page: copy email ---------- */
  const emailBtn = document.getElementById("contact-email");
  if (emailBtn) {
    const copiedMsg = document.getElementById("copied-msg");
    emailBtn.addEventListener("click", async () => {
      const email = emailBtn.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        /* clipboard unavailable — silently ignore */
      }
      if (copiedMsg) {
        copiedMsg.classList.add("show");
        setTimeout(() => copiedMsg.classList.remove("show"), 2000);
      }
    });
  }

  /* ---------- commissions: notify form ---------- */
  const notifyForm = document.getElementById("notify-form");
  if (notifyForm) {
    notifyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = notifyForm.querySelector(".notify-btn");
      const original = btn.textContent;
      btn.textContent = i18n.current === "fr" ? "merci." : "thank you.";
      notifyForm.querySelector("input").value = "";
      setTimeout(() => {
        btn.textContent = original;
      }, 2500);
    });
  }
})();
