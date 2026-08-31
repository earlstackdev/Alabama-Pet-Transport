/* Alabama Pet Transport Services — site behaviour
   Vanilla JS, no dependencies. Progressive enhancement only:
   every page works with JavaScript disabled. */
(function () {
  "use strict";

  var BUSINESS_SMS = "+12057535659";

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

  /* ------------------------------------------------------------ reveals */
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reveals.length && "IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
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

  /* --------------------------------------------------------------- form
     Leads are delivered by text message, so the quote form composes a
     ready-to-send SMS rather than posting to a server. If the device
     cannot open an SMS link, the summary is shown so it can be copied. */
  var form = document.getElementById("quote-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var fallback = document.getElementById("form-fallback");
  var fallbackText = document.getElementById("form-fallback-text");
  var copyBtn = document.getElementById("form-copy");

  // Each field carries a short data-sms-label used in the composed message,
  // falling back to its visible label with any hint text stripped out.
  var label = function (el) {
    if (el.getAttribute("data-sms-label")) return el.getAttribute("data-sms-label");
    var lbl = form.querySelector('label[for="' + el.id + '"]');
    if (!lbl) return el.name;
    var copy = lbl.cloneNode(true);
    copy.querySelectorAll(".hint, .req").forEach(function (n) { n.remove(); });
    return copy.textContent.replace(/\s+/g, " ").replace(/[:*]+$/, "").trim();
  };

  var compose = function () {
    var lines = ["Pet transport quote request", ""];
    ["name", "phone", "pickup", "dropoff", "pet", "timing", "details"].forEach(function (key) {
      var el = form.elements[key];
      if (!el) return;
      var value = String(el.value || "").trim();
      if (value) lines.push(label(el) + ": " + value);
    });
    return lines.join("\n");
  };

  // Encode form fields for Netlify's forms endpoint (application/x-www-form-urlencoded).
  var encodeFormData = function (data) {
    return Object.keys(data)
      .map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      })
      .join("&");
  };

  // Submit a copy of the lead to Netlify Forms so it is captured even if the
  // visitor's device does not open the SMS link (e.g. desktop browsers).
  var submitToNetlify = function () {
    var data = { "form-name": "quote-form" };
    ["name", "phone", "pickup", "dropoff", "pet", "timing", "details"].forEach(function (key) {
      var el = form.elements[key];
      if (el) data[key] = el.value || "";
    });
    var honeypot = form.elements["bot-field"];
    data["bot-field"] = honeypot ? honeypot.value || "" : "";

    return fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeFormData(data)
    });
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var body = compose();
    if (fallbackText) fallbackText.value = body;

    if (status) {
      status.hidden = false;
      status.textContent =
        "Opening your messaging app with the details filled in — press send to reach Kristi and Rod.";
    }
    if (fallback) fallback.hidden = false;

    submitToNetlify().catch(function () { /* SMS is the primary path; ignore network errors */ });

    window.location.href =
      "sms:" + BUSINESS_SMS + "?&body=" + encodeURIComponent(body);
  });

  if (copyBtn && fallbackText) {
    copyBtn.addEventListener("click", function () {
      var done = function () {
        var original = copyBtn.getAttribute("data-label") || copyBtn.textContent;
        copyBtn.setAttribute("data-label", original);
        copyBtn.textContent = "Copied";
        window.setTimeout(function () { copyBtn.textContent = original; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fallbackText.value).then(done, function () {
          fallbackText.select();
        });
      } else {
        fallbackText.select();
        try { document.execCommand("copy"); done(); } catch (err) { /* no-op */ }
      }
    });
  }
})();
