/* Pulse marketing site — micro-interactions.
   Scroll-reveal with graceful no-JS / reduced-motion fallbacks. */
(function () {
  "use strict";

  // Current year in the footer (every page has #yr).
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // If the user prefers reduced motion, leave everything fully visible.
  if (reduce) return;

  // Scroll-progress bar: fill a thin top line as the page scrolls.
  var bar = document.getElementById("scrollbar");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      var pct = Math.min(100, Math.max(0, (h.scrollTop / max) * 100));
      bar.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Opt the page into reveal styling (CSS hides .reveal only under .reveal-on).
  document.documentElement.classList.add("reveal-on");

  // Elements to animate in as they enter the viewport.
  var selectors = [
    ".section h2", ".section .lead",
    ".card", ".step", ".plan", ".shot",
    ".faq details", ".band", ".legal h2", ".legal p", ".legal .banner"
  ];

  var nodes = [];
  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { nodes.push(el); });
  });

  // Stagger siblings that share a parent so groups cascade in.
  var seen = new Map();
  nodes.forEach(function (el) {
    el.classList.add("reveal");
    var key = el.parentNode;
    var i = seen.get(key) || 0;
    el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
    seen.set(key, i + 1);
  });

  if (!("IntersectionObserver" in window)) {
    // Old browser: just show everything.
    nodes.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  nodes.forEach(function (el) { io.observe(el); });
})();
