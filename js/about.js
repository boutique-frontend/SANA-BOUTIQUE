/* =========================================
   SANA BOUTIQUE
   ABOUT PAGE CONTROLLER
========================================= */

"use strict";


document.addEventListener("DOMContentLoaded", () => {

    setupShareButton();

    setupPlayToggle();

    setupParticles();

});


/* =========================================
   SHARE BUTTON
========================================= */

function setupShareButton() {

    const shareButton =
        document.getElementById("aboutShareButton");

    if (!shareButton) return;

    shareButton.addEventListener("click", async () => {

        const shareData = {
            title: "SANA Boutique",
            text: "Elegance, Redefined — discover SANA Boutique.",
            url: window.location.href
        };

        try {

            if (navigator.share) {

                await navigator.share(shareData);

            } else if (navigator.clipboard) {

                await navigator.clipboard.writeText(shareData.url);

                if (window.showToast) {
                    window.showToast("Link copied");
                }

            }

        } catch (error) {

            /* User cancelled the share sheet — not an error. */

        }

    });

}


/* =========================================
   PLAY / PAUSE FABRIC MOTION
========================================= */

function setupPlayToggle() {

    const button =
        document.getElementById("aboutPlayToggle");

    if (!button) return;

    const visual =
        button.closest(".about-visual");

    button.addEventListener("click", () => {

        const playing =
            button.getAttribute("aria-pressed") === "true";

        const next = !playing;

        button.setAttribute("aria-pressed", String(next));

        if (visual) {
            visual.classList.toggle("is-paused", !next);
        }

        button.textContent = next ? "❙❙" : "▶";

        button.setAttribute(
            "aria-label",
            next ? "Pause motion" : "Play motion"
        );

    });

}


/* =========================================
   HERO PARTICLE CANVAS
========================================= */

function setupParticles() {

    const canvas =
        document.getElementById("aboutParticleCanvas");

    const hero =
        document.getElementById("aboutHero");

    if (!canvas || !hero) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles = [];
    let raf = null;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, t = 0;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function seed() {

        const count =
            Math.max(24, Math.min(Math.round((w * h) / 16000), 70));

        particles = [];

        for (let i = 0; i < count; i++) {

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

    function resize() {

        const rect = hero.getBoundingClientRect();

        w = rect.width;
        h = rect.height;

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        seed();

    }

    function draw() {

        if (!canvas.isConnected) {
            stop();
            return;
        }

        t += 0.016;

        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {

            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.y < -6) { p.y = h + 6; p.x = rand(0, w); }
            if (p.x < -6) p.x = w + 6;
            if (p.x > w + 6) p.x = -6;

            const twinkle =
                0.5 + 0.5 * Math.sin(t * p.twinkleSpeed + p.twinklePhase);

            const alpha =
                p.baseAlpha * (0.4 + 0.6 * twinkle);

            const glow =
                ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);

            glow.addColorStop(0, "rgba(244,201,93," + alpha + ")");
            glow.addColorStop(1, "rgba(244,201,93,0)");

            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle =
                "rgba(255,244,214," + Math.min(1, alpha + 0.15) + ")";

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
        draw();
    }

    let resizeTimer;

    window.addEventListener("resize", () => {

        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(resize, 150);

    });

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            stop();
        } else if (!reduceMotion) {
            start();
        }

    });

    if ("IntersectionObserver" in window) {

        const heroObserver = new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting && !document.hidden) {
                        start();
                    } else {
                        stop();
                    }

                });

            },

            { threshold: 0.05 }

        );

        heroObserver.observe(hero);

    }

                                               }
