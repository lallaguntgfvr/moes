/* ------------------------------------------------------------------
   moe moe kyun~ after dark
   one small script for every page. no libraries, no build step.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  /* ---------- remember display settings ---------- */

  var site = document.getElementById("site");
  var crtOverlay = document.getElementById("crt-overlay");
  var crtButton = document.getElementById("crt-toggle");
  var motionButton = document.getElementById("motion-toggle");

  function readStored(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function store(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      /* private browsing can block storage; the page still works */
    }
  }

  var crtOn = readStored("secret-room-crt", "on") !== "off";

  function applyCrt() {
    if (crtOverlay) crtOverlay.hidden = !crtOn;
    if (crtButton) {
      crtButton.setAttribute("aria-pressed", String(crtOn));
      var label = crtButton.querySelector("span:last-child");
      if (label) label.textContent = crtOn ? "on" : "off";
    }
  }

  applyCrt();

  if (crtButton) {
    crtButton.addEventListener("click", function () {
      crtOn = !crtOn;
      applyCrt();
      store("secret-room-crt", crtOn ? "on" : "off");
    });
  }

  var systemPrefersReduced = false;
  if (window.matchMedia) {
    systemPrefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }

  var savedMotion = readStored("secret-room-motion", "");
  var motionOn =
    savedMotion === "full" ? true : savedMotion === "reduced" ? false : !systemPrefersReduced;

  function applyMotion() {
    if (!site) return;
    site.classList.toggle("reduce-motion", !motionOn);
    if (motionButton) {
      motionButton.setAttribute("aria-pressed", String(motionOn));
      var icon = motionButton.querySelector("span:first-child");
      var label = motionButton.querySelector("span:last-child");
      if (icon) icon.textContent = motionOn ? "✦" : "✧";
      if (label) label.textContent = motionOn ? "on" : "off";
    }
  }

  applyMotion();

  if (motionButton) {
    motionButton.addEventListener("click", function () {
      motionOn = !motionOn;
      applyMotion();
      store("secret-room-motion", motionOn ? "full" : "reduced");
    });
  }

  /* ---------- mobile menu ---------- */

  var menu = document.getElementById("site-menu");
  var openButton = document.getElementById("menu-open");
  var closeButton = document.getElementById("menu-close");
  var backdrop = document.getElementById("sidebar-backdrop");
  var pageWrap = document.getElementById("page-wrap");
  var mobileBar = document.getElementById("mobile-bar");

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    if (openButton) openButton.setAttribute("aria-expanded", String(open));
    if (backdrop) backdrop.hidden = !open;
    if (pageWrap) pageWrap.inert = open;
    if (mobileBar) mobileBar.inert = open;
    if (open) {
      var firstLink = menu.querySelector("a[href]");
      if (firstLink) firstLink.focus();
    } else if (closeButton && document.activeElement === closeButton) {
      if (openButton) openButton.focus();
    }
  }

  if (openButton) {
    openButton.addEventListener("click", function () {
      setMenu(true);
    });
  }
  if (closeButton) {
    closeButton.addEventListener("click", function () {
      setMenu(false);
    });
  }
  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setMenu(false);
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  /* ---------- local clock + visit counter ---------- */

  var clock = document.getElementById("local-time");
  if (clock) {
    var updateClock = function () {
      var now = new Date();
      var hours = String(now.getHours()).padStart(2, "0");
      var minutes = String(now.getMinutes()).padStart(2, "0");
      clock.textContent = hours + ":" + minutes;
    };
    updateClock();
    window.setInterval(updateClock, 30000);
  }

  var visitLabel = document.getElementById("visit-count");
  if (visitLabel) {
    var visits = 1;
    try {
      var savedVisits = parseInt(localStorage.getItem("kurarin-local-visits"), 10);
      if (!isFinite(savedVisits) || savedVisits < 0) savedVisits = 0;
      if (!sessionStorage.getItem("kurarin-visit-counted")) {
        savedVisits += 1;
        localStorage.setItem("kurarin-local-visits", String(savedVisits));
        sessionStorage.setItem("kurarin-visit-counted", "yes");
      }
      visits = Math.max(1, savedVisits);
    } catch (error) {
      visits = 1;
    }
    visitLabel.textContent = String(visits).padStart(3, "0");
  }

  /* ---------- back to top ---------- */

  var topLink = document.getElementById("back-to-top");
  if (topLink) {
    topLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: motionOn ? "smooth" : "auto" });
      var main = document.getElementById("main-content");
      if (main) main.focus();
    });
  }

  /* ---------- old single-page bookmarks (index.html#about etc.) ---------- */

  var pages = {
    home: "./index.html",
    about: "./about.html",
    journal: "./journal.html",
    music: "./music.html",
    shrine: "./shrine.html",
    gallery: "./gallery.html",
    guestbook: "./guestbook.html",
    links: "./links.html"
  };
  var hash = window.location.hash.replace("#", "").split("?")[0];
  if (hash && pages[hash]) {
    var here = window.location.pathname.split("/").pop() || "index.html";
    var target = pages[hash].replace("./", "");
    if (here !== target) window.location.replace(pages[hash]);
  }
})();
