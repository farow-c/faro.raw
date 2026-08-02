(function () {
  "use strict";

  /* ============================================================
     WORKS DATA — all 18 pieces
     Canvas is 4x viewport width, 3x viewport height.
     ============================================================ */
  const CAVE_WORKS = [
    { file: "pretty-headed.jpg", title: "pretty headed", slug: "pretty-headed" },
    { file: "lying-on-whats-left-of-a-side.jpg", title: "lying on what's left of a side", slug: "lying-on-whats-left-of-a-side" },
    { file: "cafard.jpg", title: "cafard", slug: "cafard" },
    { file: "prey.jpg", title: "prey", slug: "prey" },
    { file: "scratching-the-right-spot.jpg", title: "scratching the right spot", slug: "scratching-the-right-spot" },
    { file: "see-for-me.jpg", title: "see for me", slug: "see-for-me" },
    { file: "shattering-with-her-world.jpg", title: "shattering with her world", slug: "shattering-with-her-world" },
    { file: "le-coeur-sur-la-main.jpg", title: "le cœur sur la main", slug: "le-coeur-sur-la-main" },
    { file: "was-it-you.jpg", title: "was it you ?", slug: "was-it-you" },
    { file: "eye-contact.jpg", title: "eye contact", slug: "eye-contact" },
    { file: "friend.jpg", title: "friend", slug: "friend" },
    { file: "stoic-grace.jpg", title: "stoic grace", slug: "stoic-grace" },
    { file: "knights-best-friend.jpg", title: "knight's best friend", slug: "knights-best-friend" },
    { file: "ryo.jpg", title: "ryo", slug: "ryo" },
    { file: "knight.jpg", title: "knight", slug: "knight" },
    { file: "as-one.jpg", title: "as one", slug: "as-one" },
    { file: "une-belle-brochette.jpg", title: "une belle brochette", slug: "une-belle-brochette" },
    { file: "portrait.jpg", title: "portrait", slug: "portrait" }
  ];

  // 6x3 = 18 zones, one per artwork — grid divides the canvas evenly,
  // guaranteeing no two pieces ever land in the same region
  const GRID_COLS = 6;
  const GRID_ROWS = 3;

  const caveContent = document.getElementById("cave-content");
  const caveViewportEl = document.getElementById("cave-viewport");
  let CAVE_WIDTH = 0;
  let CAVE_HEIGHT = 0;
  let caveBuilt = false;

  /* ---------- shared page-transition veil (same fade as main.js) ---------- */
  function transitionTo(href) {
    let veil = document.querySelector(".page-veil");
    if (!veil) {
      veil = document.createElement("div");
      veil.className = "page-veil";
      document.body.appendChild(veil);
    }
    veil.classList.add("veil-in");
    setTimeout(() => {
      window.location.href = href;
    }, 300);
  }

  document.querySelectorAll("#cave-nav a[href]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      transitionTo(a.getAttribute("href"));
    });
  });

  // built lazily (on first cave entry) so window dimensions are
  // guaranteed to be real by then, never 0 from an early script eval
  function buildCave() {
    if (caveBuilt || !caveContent) return;
    caveBuilt = true;

    const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    CAVE_WIDTH = Math.round(vw * 4);
    CAVE_HEIGHT = Math.round(vh * 3);

    caveContent.style.width = CAVE_WIDTH + "px";
    caveContent.style.height = CAVE_HEIGHT + "px";

    // node footprint (220px frame + label line)
    const NODE_W = 220;
    const NODE_H = 320;
    const PAD = 20; // minimum clearance from the canvas edge
    const MARGIN = 30; // minimum clearance from a zone's own edge, so two
    // nodes in adjacent zones both pushed toward their shared border are
    // still guaranteed MARGIN + MARGIN = 60px apart at minimum
    const JITTER = 30; // max random offset from zone center, in px

    const usableW = CAVE_WIDTH - PAD * 2;
    const usableH = CAVE_HEIGHT - PAD * 2;
    const zoneW = usableW / GRID_COLS;
    const zoneH = usableH / GRID_ROWS;

    CAVE_WORKS.forEach((work, i) => {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const zoneX = PAD + col * zoneW;
      const zoneY = PAD + row * zoneH;
      const centerX = zoneX + zoneW / 2;
      const centerY = zoneY + zoneH / 2;

      const jitterX = (Math.random() * 2 - 1) * JITTER;
      const jitterY = (Math.random() * 2 - 1) * JITTER;

      const minLeft = zoneX + MARGIN;
      const maxLeft = zoneX + zoneW - NODE_W - MARGIN;
      const minTop = zoneY + MARGIN;
      const maxTop = zoneY + zoneH - NODE_H - MARGIN;

      let left = centerX + jitterX - NODE_W / 2;
      let top = centerY + jitterY - NODE_H / 2;
      // clamp — if a zone is too small for the full margin (very narrow
      // viewport), fall back to the zone's own bounds rather than break
      left = Math.max(minLeft, Math.min(left, Math.max(minLeft, maxLeft)));
      top = Math.max(minTop, Math.min(top, Math.max(minTop, maxTop)));

      const node = document.createElement("a");
      node.className = "work-node";
      node.href = `work-${work.slug}.html`;
      node.style.top = Math.round(top) + "px";
      node.style.left = Math.round(left) + "px";

      const frame = document.createElement("div");
      frame.className = "frame";
      frame.style.backgroundImage = `url("assets/works/${work.file}")`;

      const label = document.createElement("div");
      label.className = "label";
      label.textContent = work.title;

      node.appendChild(frame);
      node.appendChild(label);
      node.addEventListener("click", (e) => {
        e.preventDefault();
        transitionTo(node.getAttribute("href"));
      });
      caveContent.appendChild(node);
    });
  }

  function centerCaveScroll() {
    if (!caveViewportEl) return;
    caveViewportEl.scrollLeft = (CAVE_WIDTH - window.innerWidth) / 2;
    caveViewportEl.scrollTop = (CAVE_HEIGHT - window.innerHeight) / 2;
  }

  /* ============================================================
     HEARTBEAT — Web Audio API
     ============================================================ */
  const Heartbeat = {
    ctx: null,
    master: null,
    schedulerId: null,
    nextBeatTime: 0,
    visualStartTime: null, // performance.now() anchor, drives the ambient heart visual
    cycleLength: 1.035, // ~58 BPM
    dubOffset: 0.25,

    start() {
      this.visualStartTime = this.visualStartTime || performance.now();
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.07;
      this.master.connect(this.ctx.destination);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.05;
      lfo.type = "sine";
      const lfoDepth = this.ctx.createGain();
      lfoDepth.gain.value = 0.02;
      lfo.connect(lfoDepth);
      lfoDepth.connect(this.master.gain);
      lfo.start();

      this.nextBeatTime = this.ctx.currentTime + 0.1;
      this.schedulerId = setInterval(() => this._schedule(), 200);
    },

    _thud(time, peakGain) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(55, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(peakGain, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);

      osc.connect(gain);
      gain.connect(this.master);
      osc.start(time);
      osc.stop(time + 0.25);
    },

    _schedule() {
      while (this.nextBeatTime < this.ctx.currentTime + 0.5) {
        this._thud(this.nextBeatTime, 1.0);
        this._thud(this.nextBeatTime + this.dubOffset, 0.7);
        this.nextBeatTime += this.cycleLength;
      }
    },

    // 0..1 envelope value driving the ambient heart's scale/opacity,
    // built from the same lub-dub timing as the audio so they read as
    // one pulse — derived from wall-clock, not the audio graph itself
    getVisualPulse(nowMs) {
      if (!this.visualStartTime) return 0;
      const t = ((nowMs - this.visualStartTime) / 1000) % this.cycleLength;
      const lub = pulseEnvelope(t, 0);
      const dub = pulseEnvelope(t, this.dubOffset) * 0.7;
      return Math.max(lub, dub);
    }
  };

  function pulseEnvelope(t, onset) {
    const dt = t - onset;
    if (dt < 0 || dt > 0.4) return 0;
    if (dt < 0.02) return dt / 0.02;
    return Math.max(0, 1 - (dt - 0.02) / 0.35);
  }

  /* ============================================================
     TORCH CANVAS
     ============================================================ */
  const canvas = document.getElementById("torch-canvas");
  const caveViewport = document.getElementById("cave-viewport");
  let ctx, dpr;
  let torchX = window.innerWidth / 2;
  let torchY = window.innerHeight / 2;
  let baseRadius = 170;
  let lastPointerTime = 0;
  let running = false;
  let startTime = 0;

  // parallax pan — the whole cave layer drifts opposite the torch as it
  // moves away from center, smoothly lerped for a subtle depth effect.
  // Follows the torch's effective position (including auto-wander), so
  // the cave keeps gently breathing even when the mouse sits still.
  const PARALLAX_FACTOR = 0.3;
  const PARALLAX_LERP = 0.08;
  let parallaxX = 0;
  let parallaxY = 0;

  // ambient heart — a real cut-out photograph, fixed and centered behind
  // the cave, pulsing in sync with the audio heartbeat. Pure CSS transform
  // driven every frame off the same envelope the audio scheduler uses.
  const caveHeart = document.getElementById("cave-heart");

  function updateAmbientHeart(now) {
    if (!caveHeart) return;
    const pulse = Heartbeat.getVisualPulse(now); // 0..1
    const pulseScale = 1 + pulse * 0.04; // 1.0 → 1.04
    caveHeart.style.transform = `translate(-50%, -50%) scale(${pulseScale.toFixed(4)})`;
  }

  function resizeCanvas() {
    if (!canvas) return;
    dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function autoWanderPosition(t) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const rx = w * 0.28;
    const ry = h * 0.22;
    const angle = t * 0.00025;
    return {
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle * 1.3) * ry
    };
  }

  // closest-point distance from the torch to a node's bounding box,
  // so illumination reads correctly against the larger 220px frames
  function distToRect(px, py, rect) {
    const cx = Math.max(rect.left, Math.min(px, rect.right));
    const cy = Math.max(rect.top, Math.min(py, rect.bottom));
    return Math.hypot(px - cx, py - cy);
  }

  function drawFrame(now) {
    if (!running) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    updateAmbientHeart(now);

    const idleFor = now - lastPointerTime;
    let px = torchX;
    let py = torchY;
    if (idleFor > 2000) {
      const pos = autoWanderPosition(now - startTime);
      px = pos.x;
      py = pos.y;
    }

    // parallax: content shifts opposite the torch's offset from center,
    // lerped toward its target each frame — never snaps, always smooth
    if (caveContent) {
      const targetX = -(px - w / 2) * PARALLAX_FACTOR;
      const targetY = -(py - h / 2) * PARALLAX_FACTOR;
      parallaxX += (targetX - parallaxX) * PARALLAX_LERP;
      parallaxY += (targetY - parallaxY) * PARALLAX_LERP;
      caveContent.style.transform = `translate(${parallaxX.toFixed(2)}px, ${parallaxY.toFixed(2)}px)`;
    }

    const flicker = Math.sin(now * 0.006) * 8 + Math.sin(now * 0.013) * 4;
    const radius = baseRadius + flicker;

    ctx.clearRect(0, 0, w, h);

    // darkness layer — fully opaque, or bright artwork pixels (near-white
    // highlights) bleed through as faint rectangular ghosts everywhere,
    // not just under the torch. Only the hole below should reveal anything.
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgb(8,8,8)";
    ctx.fillRect(0, 0, w, h);

    // punch the torch hole
    ctx.globalCompositeOperation = "destination-out";
    const holeGrad = ctx.createRadialGradient(px, py, 0, px, py, radius);
    holeGrad.addColorStop(0, "rgba(0,0,0,1)");
    holeGrad.addColorStop(0.35, "rgba(0,0,0,0.9)");
    holeGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = holeGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    // warm ambient glow
    ctx.globalCompositeOperation = "lighter";
    const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, radius * 0.8);
    glowGrad.addColorStop(0, "rgba(255,200,130,0.10)");
    glowGrad.addColorStop(1, "rgba(255,200,130,0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";

    // light the work nodes near the torch, and only show the
    // pointer cursor where the torch actually reveals a piece
    document.querySelectorAll(".work-node").forEach((node) => {
      const rect = node.getBoundingClientRect();
      const dist = distToRect(px, py, rect);
      const frame = node.querySelector(".frame");
      const label = node.querySelector(".label");
      const lit = dist < radius * 1.1;
      if (lit) {
        frame.style.boxShadow = "0 0 22px 4px rgba(255,190,120,0.35)";
        frame.style.borderColor = "rgba(255,200,130,0.45)";
        label.style.opacity = "0.9";
        node.style.cursor = "pointer";
      } else {
        frame.style.boxShadow = "none";
        frame.style.borderColor = "rgba(232,221,208,0.1)";
        label.style.opacity = "0.4";
        node.style.cursor = "none";
      }
    });

    requestAnimationFrame(drawFrame);
  }

  function startTorch() {
    if (running) return;
    running = true;
    startTime = performance.now();
    lastPointerTime = performance.now() - 2001; // start in auto-wander
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    window.addEventListener("mousemove", (e) => {
      torchX = e.clientX;
      torchY = e.clientY;
      lastPointerTime = performance.now();
    });

    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length) {
          torchX = e.touches[0].clientX;
          torchY = e.touches[0].clientY;
          lastPointerTime = performance.now();
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length) {
          torchX = e.touches[0].clientX;
          torchY = e.touches[0].clientY;
          lastPointerTime = performance.now();
        }
      },
      { passive: true }
    );

    requestAnimationFrame(drawFrame);
  }

  /* ============================================================
     ENTRY SEQUENCE — the image tears open, hands pulling flesh
     apart, revealing the void that swallows the screen
     ============================================================ */
  const entryScreen = document.getElementById("entry-screen");
  const caveNav = document.getElementById("cave-nav");
  const caveHint = document.getElementById("cave-hint");
  const caveCompass = document.getElementById("cave-compass");

  // fires once per session — a fresh page load or a return trip via
  // the nav's "skip entry" path will not show it again once dismissed
  function showCaveHintOnce() {
    if (!caveHint) return;
    if (sessionStorage.getItem("faro_hint_shown") === "1") return;
    sessionStorage.setItem("faro_hint_shown", "1");
    caveHint.classList.add("playing");
  }

  function startCavePhase() {
    buildCave();
    document.body.classList.add("cave-active");
    if (caveViewport) caveViewport.style.display = "block";
    if (canvas) canvas.style.display = "block";
    if (caveHeart) caveHeart.style.display = "block";
    if (caveCompass) caveCompass.style.display = "block";
    centerCaveScroll();
    startTorch();
    showCaveHintOnce();
    // the cave is now visible — this is the moment the heartbeat begins,
    // never earlier, so nothing plays during the entry screen or tear
    try {
      Heartbeat.start();
    } catch (err) {
      /* autoplay blocked without a fresh gesture — silently skip */
    }
  }

  // returning to the cave via nav — skip the entry ritual
  if (entryScreen && sessionStorage.getItem("faro_entered") === "1") {
    entryScreen.style.display = "none";
    startCavePhase();
    if (caveNav) caveNav.classList.add("visible");
  }

  function enterCave() {
    sessionStorage.setItem("faro_entered", "1");
    if (!entryScreen) return;

    // heartbeat is intentionally NOT started here — it must stay silent
    // through the entire entry screen and tear, and only begin once the
    // cave itself is visible. See startCavePhase().
    entryScreen.classList.add("tearing");

    setTimeout(() => {
      entryScreen.classList.add("exiting");
      startCavePhase();
      setTimeout(() => {
        entryScreen.style.display = "none";
      }, 800);
      setTimeout(() => {
        if (caveNav) caveNav.classList.add("visible");
      }, 2400);
    }, 1200);
  }

  if (entryScreen) {
    entryScreen.addEventListener("click", enterCave, { once: true });
    entryScreen.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        enterCave();
      },
      { once: true }
    );
  }
})();
