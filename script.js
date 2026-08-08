// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

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

// Personal gallery lightbox — click a tile to enlarge the image.
(function () {
  const gallery = document.getElementById("personal-gallery");
  const lb = document.getElementById("lightbox");
  if (!gallery || !lb) return;
  const img = lb.querySelector(".lightbox__img");
  const cap = lb.querySelector(".lightbox__cap");
  const closeBtn = lb.querySelector(".lightbox__close");

  const open = (item) => {
    img.src = item.getAttribute("href");
    img.alt = item.dataset.title || "";
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
    img.src = "";
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
