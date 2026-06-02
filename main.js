/* Pulse marketing site — motion layer.
   Scroll-reveal, count-up stats, nav condense, cursor tilt.
   Graceful no-JS / reduced-motion fallbacks throughout. */
(function () {
  "use strict";

  // Footer year (every page has #yr).
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Count-up stats ---------------------------------------------------
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  function setFinal(el) { el.textContent = el.getAttribute("data-count"); }
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (target <= 0) { el.textContent = "0"; return; }
    var dur = 1200, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Reduced motion: show everything static, fill counters with final values, stop.
  if (reduce) { counters.forEach(setFinal); return; }

  // --- Scroll progress bar + nav condense -------------------------------
  var bar = document.getElementById("scrollbar");
  var hdr = document.getElementById("hdr");
  var heroBg = document.querySelector(".hero-bg");
  function onScroll() {
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    var pct = Math.min(100, Math.max(0, (h.scrollTop / max) * 100));
    if (bar) bar.style.width = pct + "%";
    if (hdr) hdr.classList.toggle("scrolled", h.scrollTop > 8);
    // Subtle parallax: the aurora/EKG backdrop drifts slower than the page.
    if (heroBg && h.scrollTop < 1000) heroBg.style.transform = "translateY(" + (h.scrollTop * 0.18).toFixed(1) + "px)";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Scroll-reveal ----------------------------------------------------
  document.documentElement.classList.add("reveal-on");
  var selectors = [
    ".section h2", ".section .lead", ".section .eyebrow",
    ".card", ".step", ".plan", ".shot", ".stat",
    ".faq details", ".band", ".legal h2", ".legal p", ".legal .banner"
  ];
  var nodes = [];
  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { nodes.push(el); });
  });

  // Stagger siblings sharing a parent so groups cascade in.
  var seen = new Map();
  nodes.forEach(function (el) {
    el.classList.add("reveal");
    var key = el.parentNode;
    var i = seen.get(key) || 0;
    el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
    seen.set(key, i + 1);
  });

  var hasIO = "IntersectionObserver" in window;

  if (!hasIO) {
    nodes.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(setFinal);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (el) { io.observe(el); });

    // Count up each stat the first time it scrolls into view.
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // --- Cursor tilt on the hero device (mouse only) ----------------------
  var tilt = document.getElementById("tilt");
  if (tilt && window.matchMedia("(pointer: fine)").matches) {
    var dev = tilt.querySelector(".device");
    tilt.addEventListener("mousemove", function (e) {
      var r = tilt.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      if (dev) dev.style.transform = "rotateY(" + (px * 10).toFixed(2) + "deg) rotateX(" + (-py * 10).toFixed(2) + "deg)";
    }, { passive: true });
    tilt.addEventListener("mouseleave", function () { if (dev) dev.style.transform = ""; });
  }

  // Subtle 3D tilt on cards / steps / plans (mouse only) — makes the grid feel alive.
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".card, .step, .plan").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "translateY(-6px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg)";
      }, { passive: true });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }
})();


/* Mobile nav hamburger — separate IIFE so it runs even under reduced-motion. */
(function () {
  function init() {
    var btn = document.querySelector(".navtoggle");
    var menu = document.getElementById("navlinks");
    if (!btn || !menu) return;
    function setOpen(o) { menu.classList.toggle("open", o); btn.setAttribute("aria-expanded", o ? "true" : "false"); }
    btn.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!menu.classList.contains("open")); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("click", function (e) { if (menu.classList.contains("open") && !menu.contains(e.target) && !btn.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
