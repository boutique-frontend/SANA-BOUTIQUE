/* =========================================================
   SANA BOUTIQUE — About Page
   Vanilla JS only. No backend, no external runtime deps.
========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1) HEADER: back button + wishlist toggle
  --------------------------------------------------------- */
  var backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "../../index.html";
      }
    });
  }

  var wishBtn = document.getElementById("wishBtn");
  if (wishBtn) {
    wishBtn.addEventListener("click", function () {
      var active = wishBtn.getAttribute("aria-pressed") === "true";
      wishBtn.setAttribute("aria-pressed", String(!active));
    });
  }

  /* ---------------------------------------------------------
     2) SMOOTH SCROLL for in-page anchors
  --------------------------------------------------------- */
  document.querySelectorAll("[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return; // let real page links navigate normally
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  var scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var story = document.getElementById("story");
      if (story) story.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  /* ---------------------------------------------------------
     3) SCROLL-REVEAL via IntersectionObserver
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var delay = (i % 4) * 90;
            entry.target.style.transitionDelay = reduceMotion ? "0ms" : delay + "ms";
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     4) RIPPLE + magnetic-tap feedback on buttons
  --------------------------------------------------------- */
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (reduceMotion) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.2;
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      var x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
      var y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      btn.appendChild(ripple);
      window.setTimeout(function () { ripple.remove(); }, 700);
    });
  });

  /* ---------------------------------------------------------
     5) PLAY / PAUSE toggles for the ambient fabric scenes
  --------------------------------------------------------- */
  function wirePlayToggle(buttonId) {
    var btn = document.getElementById(buttonId);
    if (!btn) return;
    var frame = btn.closest(".mission-frame");
    var iconPause = btn.querySelector(".icon-pause");
    var iconPlay = btn.querySelector(".icon-play");

    btn.addEventListener("click", function () {
      var playing = btn.getAttribute("aria-pressed") === "true";
      var next = !playing;
      btn.setAttribute("aria-pressed", String(next));
      if (frame) frame.classList.toggle("is-paused", !next);
      if (iconPause && iconPlay) {
        iconPause.hidden = !next;
        iconPlay.hidden = next;
      }
      btn.setAttribute("aria-label", next ? "Pause motion" : "Play motion");
    });
  }
  wirePlayToggle("playToggle");
  wirePlayToggle("playToggle2");

  /* ---------------------------------------------------------
     6) VALUES CAROUSEL (horizontal snap, arrows + dots sync)
  --------------------------------------------------------- */
  (function initValuesCarousel() {
    var track = document.getElementById("valuesTrack");
    var prev = document.getElementById("valuesPrev");
    var next = document.getElementById("valuesNext");
    var dotsWrap = document.getElementById("valuesDots");
    if (!track) return;

    var cards = Array.prototype.slice.call(track.children);
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function cardStep() {
      var card = cards[0];
      if (!card) return 0;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || "14");
      return card.getBoundingClientRect().width + gap;
    }

    function scrollByCards(dir) {
      track.scrollBy({ left: dir * cardStep(), behavior: reduceMotion ? "auto" : "smooth" });
    }

    if (prev) prev.addEventListener("click", function () { scrollByCards(-1); });
    if (next) next.addEventListener("click", function () { scrollByCards(1); });

    if (dots.length && "IntersectionObserver" in window) {
      var dotObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var idx = cards.indexOf(entry.target);
            if (idx === -1) return;
            if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
              dots.forEach(function (d) { d.classList.remove("is-active"); });
              if (dots[idx]) dots[idx].classList.add("is-active");
            }
          });
        },
        { root: track, threshold: [0.6] }
      );
      cards.forEach(function (c) { dotObserver.observe(c); });
    }
  })();

  /* ---------------------------------------------------------
     7) HERO PARTICLES — canvas gold-dust field
     Lightweight, pauses off-screen / hidden tab / reduced motion.
  --------------------------------------------------------- */
  (function initParticles() {
    var canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var hero = document.getElementById("hero");
    var particles = [];
    var raf = null;
    var running = false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;

    function resize() {
      var rect = hero.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function seed() {
      var count = Math.round((w * h) / 16000);
      count = Math.max(24, Math.min(count, 70));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(0.6, 2.2),
          vx: rand(-0.06, 0.09),
          vy: rand(-0.14, -0.02),
          baseAlpha: rand(0.25, 0.85),
          twinkleSpeed: rand(0.6, 1.6),
          twinklePhase: rand(0, Math.PI * 2)
        });
      }
    }

    var t = 0;
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -6) { p.y = h + 6; p.x = rand(0, w); }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;

        var twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed + p.twinklePhase);
        var alpha = p.baseAlpha * (0.4 + 0.6 * twinkle);

        var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        glow.addColorStop(0, "rgba(246,226,171," + alpha + ")");
        glow.addColorStop(1, "rgba(246,226,171,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,244,214," + Math.min(1, alpha + 0.15) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(draw);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      raf = window.requestAnimationFrame(draw);
    }
    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    if (!reduceMotion) {
      start();
    } else {
      // Draw a single static frame for reduced-motion users.
      draw = (function (orig) {
        return function () { orig(); stop(); };
      })(draw);
      raf = window.requestAnimationFrame(draw);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else if (!reduceMotion) start();
    });

    if ("IntersectionObserver" in window && hero) {
      var heroObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !document.hidden) start();
            else stop();
          });
        },
        { threshold: 0.05 }
      );
      heroObserver.observe(hero);
    }
  })();

})();
