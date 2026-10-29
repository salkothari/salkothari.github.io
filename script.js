// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Hero entrance — type the intro statement out on arrival (keeps the accent
// word orange as it's typed). Falls back to the full text when motion is
// reduced.
(function () {
  const hero = document.querySelector(".intro__statement");
  const revealAll = () => document.documentElement.classList.remove("hero-intro-active");
  if (!hero) {
    revealAll();
    return;
  }

  // Read the existing markup into typed segments (text + whether accented).
  const segments = [];
  hero.childNodes.forEach((node) => {
    if (node.nodeType === 3) segments.push({ text: node.textContent, accent: false });
    else if (node.nodeType === 1)
      segments.push({ text: node.textContent, accent: node.classList.contains("accent") });
  });
  segments.forEach((s) => (s.text = s.text.replace(/\s+/g, " ")));
  if (segments.length) {
    segments[0].text = segments[0].text.replace(/^\s+/, "");
    segments[segments.length - 1].text = segments[segments.length - 1].text.replace(/\s+$/, "");
  }
  const full = segments.map((s) => s.text).join("");
  hero.setAttribute("aria-label", full);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealAll();
    return;
  }

  // Reserve the final height so lines filling in don't shift the page.
  hero.style.minHeight = hero.offsetHeight + "px";

  // Flatten a list of {text, accent} segments into per-character entries.
  const toChars = (segs) => {
    const out = [];
    segs.forEach((s) => {
      for (const ch of s.text) out.push({ ch, accent: s.accent });
    });
    return out;
  };
  const heroChars = toChars(segments);
  const greetingChars = toChars([
    { text: "Hi, I'm ", accent: false },
    { text: "Saloni!", accent: true },
  ]);

  hero.textContent = "";
  const caret = document.createElement("span");
  caret.className = "hero-caret";
  caret.setAttribute("aria-hidden", "true");
  hero.appendChild(caret);

  // Type one list of characters, then call done().
  function typeChars(list, done) {
    let i = 0;
    let span = null;
    let spanAccent = null;
    (function step() {
      if (i >= list.length) return done();
      const { ch, accent } = list[i];
      if (accent !== spanAccent) {
        span = document.createElement("span");
        if (accent) span.className = "accent";
        hero.insertBefore(span, caret);
        spanAccent = accent;
      }
      span.appendChild(document.createTextNode(ch));
      i++;
      let delay = 30 + Math.random() * 32;
      if (ch === " ") delay = 24;
      else if (ch === ",") delay = 200;
      else if (ch === "!") delay = 260;
      else if (ch === ".") delay = 360;
      setTimeout(step, delay);
    })();
  }

  // Backspace everything currently typed, then call done().
  function erase(done) {
    const last = caret.previousElementSibling;
    if (!last) return done();
    const t = last.lastChild;
    if (t && t.nodeType === 3 && t.data.length > 1) t.data = t.data.slice(0, -1);
    else last.remove();
    setTimeout(() => erase(done), 18);
  }

  function finish() {
    revealAll(); // fade the rest of the page in
    setTimeout(() => {
      caret.classList.add("hero-caret--done");
      setTimeout(() => caret.remove(), 450);
    }, 1500);
  }

  // Sequence: greet → hold → erase → type the hero line → reveal.
  setTimeout(() => {
    typeChars(greetingChars, () => {
      setTimeout(() => {
        erase(() => {
          setTimeout(() => typeChars(heroChars, finish), 160);
        });
      }, 750);
    });
  }, 350);
})();

// Theme toggle with localStorage persistence
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("theme");

  if (saved) root.setAttribute("data-theme", saved);

  toggle.addEventListener("click", function () {
    // Default (no attribute) is light, so absence counts as light.
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();

// Work nav dropdown — hover opens it on desktop (CSS); this adds click/touch
// toggle, and closes it on outside-click, Escape, or choosing an item.
(function () {
  const item = document.querySelector(".nav-item--dropdown");
  if (!item) return;
  const trigger = item.querySelector("[data-dropdown-trigger]");

  const close = () => {
    item.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.blur(); // drop focus so :focus-within doesn't keep it open
  };

  trigger.addEventListener("click", function () {
    const open = item.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(open));
    if (!open) trigger.blur();
  });

  item.querySelectorAll(".nav-dropdown a").forEach((a) =>
    a.addEventListener("click", close)
  );
  document.addEventListener("click", (e) => {
    if (!item.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

// Personal gallery "See more" — reveal tiles beyond the first 8.
(function () {
  const g = document.getElementById("personal-gallery");
  const btn = document.getElementById("gallery-more");
  if (!g || !btn) return;
  if (g.querySelectorAll(".gallery__item").length <= 8) {
    btn.parentElement.style.display = "none";
    return;
  }
  btn.addEventListener("click", function () {
    const expanded = g.classList.toggle("is-expanded");
    btn.setAttribute("aria-expanded", String(expanded));
    btn.textContent = expanded ? "Show less" : "See more";
  });
})();

// Personal gallery lightbox — click a tile to enlarge the image.
(function () {
  const gallery = document.getElementById("personal-gallery");
  const lb = document.getElementById("lightbox");
  if (!gallery || !lb) return;
  const imgsWrap = lb.querySelector(".lightbox__imgs");
  const cap = lb.querySelector(".lightbox__cap");
  const closeBtn = lb.querySelector(".lightbox__close");

  const open = (item) => {
    const list = (item.dataset.images || item.getAttribute("href") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    imgsWrap.innerHTML = "";
    list.forEach((src) => {
      const im = document.createElement("img");
      im.src = src;
      im.alt = item.dataset.title || "";
      imgsWrap.appendChild(im);
    });
    const bits = [item.dataset.title, item.dataset.medium, item.dataset.date].filter(
      (b) => b && b !== "—"
    );
    cap.textContent = bits.join("  ·  ");
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    imgsWrap.innerHTML = "";
    document.body.style.overflow = "";
  };

  gallery.querySelectorAll(".gallery__item").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(a);
    })
  );
  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

// Scrollspy — highlight the nav link for the section in view (Lupi-style
// orange active state).
(function () {
  const links = [...document.querySelectorAll("[data-nav]")];
  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    if (section) map.set(section, a);
  });
  if (!map.size) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.remove("is-active"));
          const active = map.get(entry.target);
          if (active) active.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  map.forEach((_, section) => observer.observe(section));
})();
