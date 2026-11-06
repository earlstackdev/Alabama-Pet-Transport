/* Alabama Pet Transport Services — site behaviour
   Vanilla JS, no dependencies. Progressive enhancement only:
   every page works with JavaScript disabled. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ reveals
     Done first, and in one synchronous block, so the page never paints
     with elements in their pre-reveal (offset) position.

     `.js` on <html> is what arms the reveal styles in the stylesheet; it
     is added here rather than inline in each page's <head> so no markup
     carries script of its own. Anything already on screen is marked as
     revealed in the same tick, which means no layout shift on load. */
  root.classList.add("js");

  var reveals = [].slice.call(document.querySelectorAll(".reveal"));

  if (!reveals.length) {
    /* nothing to do */
  } else if (!("IntersectionObserver" in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var pending = [];

    reveals.forEach(function (el) {
      // Already visible: reveal it now, before the first paint.
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      else pending.push(el);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    pending.forEach(function (el, i) {
      // Stagger neighbours slightly; the stylesheet owns the transition.
      el.style.setProperty("--reveal-delay", Math.min(i % 4, 3) * 60 + "ms");
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------- nav */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
    });

    // Reset the mobile menu state when we cross into desktop layout.
    var wide = window.matchMedia("(min-width: 980px)");
    var onWide = function (mq) { if (mq.matches) setNav(false); };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
  }

  /* ------------------------------------------------------ header shadow */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --------------------------------------------------------- phone input */
  var phoneInput = document.getElementById("f-phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      // Keep common phone-number formatting, but never allow letters through.
      var cleaned = phoneInput.value.replace(/[^0-9+().\s-]/g, "");
      if (cleaned !== phoneInput.value) phoneInput.value = cleaned;
    });
  }

  /* ------------------------------------------------------- section spy
     Marks the nav link for whichever section the reader is currently in.
     Scroll-driven rather than observer-driven so it is deterministic and
     stays correct after anchor jumps, resizes and back/forward restores.
     aria-current="location" is the correct value for a position within a
     page ("page" is for a separate document). */
  var spyLinks = [].slice.call(
    document.querySelectorAll('#site-nav ul a[href^="#"]')
  );

  if (spyLinks.length) {
    var targets = spyLinks
      .map(function (a) {
        var el = document.getElementById(a.getAttribute("href").slice(1));
        return el ? { link: a, el: el } : null;
      })
      .filter(Boolean);

    var spyTick = false;

    var updateSpy = function () {
      spyTick = false;
      if (!targets.length) return;

      var line = window.scrollY + window.innerHeight * 0.35;
      var current = null;

      targets.forEach(function (t) {
        if (t.el.getBoundingClientRect().top + window.scrollY <= line) current = t;
      });

      // At the very bottom, the last section is the one being read.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = targets[targets.length - 1];
      }

      targets.forEach(function (t) {
        if (t === current) t.link.setAttribute("aria-current", "location");
        else t.link.removeAttribute("aria-current");
      });
    };

    var queueSpy = function () {
      if (spyTick) return;
      spyTick = true;
      window.requestAnimationFrame(updateSpy);
    };

    window.addEventListener("scroll", queueSpy, { passive: true });
    window.addEventListener("resize", queueSpy);
    window.addEventListener("hashchange", queueSpy);
    updateSpy();
  }

  /* --------------------------------------------------------------- year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

})();
