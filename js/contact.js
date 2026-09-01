/* =========================================
   SANA BOUTIQUE
   CONTACT PAGE CONTROLLER
   Reads from CONFIG / CONFIG_LINKS (config.js)
   — no hardcoded contact details here.
========================================= */

"use strict";


document.addEventListener("DOMContentLoaded", () => {

    if (typeof CONFIG === "undefined") {

        console.error("CONFIG is not loaded — check that config.js is included before contact.js.");

        return;

    }

    bindConnectCards();

    bindMap();

    bindContactForm();

    bindNewsletterForm();

    setupParticles();

});


/* =========================================
   CONNECT WITH US CARDS
========================================= */

function bindConnectCards() {

    const whatsappCard = document.getElementById("contactWhatsappCard");
    const whatsappValue = document.getElementById("contactWhatsappValue");

    if (whatsappCard && whatsappValue) {

        whatsappCard.href = CONFIG_LINKS.whatsapp(
            "Hi SANA Boutique! I have a question."
        );

        whatsappValue.textContent = CONFIG.WHATSAPP_NUMBER;

    }

    const phoneCard = document.getElementById("contactPhoneCard");
    const phoneValue = document.getElementById("contactPhoneValue");

    if (phoneCard && phoneValue) {

        phoneCard.href = CONFIG_LINKS.phone();

        phoneValue.textContent = CONFIG.PHONE_NUMBER;

    }

    const instaCard = document.getElementById("contactInstagramCard");
    const instaValue = document.getElementById("contactInstagramValue");

    if (instaCard && instaValue) {

        instaCard.href = CONFIG_LINKS.instagram();

        instaValue.textContent = "@" + CONFIG.INSTAGRAM_USERNAME;

    }

    const tiktokCard = document.getElementById("contactTiktokCard");
    const tiktokValue = document.getElementById("contactTiktokValue");

    if (tiktokCard && tiktokValue) {

        tiktokCard.href = CONFIG_LINKS.tiktok();

        tiktokValue.textContent = "@" + CONFIG.TIKTOK_USERNAME;

    }

}


/* =========================================
   MAP
========================================= */

function bindMap() {

    const embed = document.getElementById("contactMapEmbed");
    if (embed) embed.src = CONFIG.MAPS_EMBED_URL;

    const largerLink = document.getElementById("contactMapLargerLink");
    if (largerLink) largerLink.href = CONFIG.MAPS_DIRECTIONS_URL;

    const mapName = document.getElementById("contactMapName");
    if (mapName) mapName.textContent = CONFIG.LOCATION_NAME;

    const mapAddress = document.getElementById("contactMapAddress");
    if (mapAddress) mapAddress.textContent = CONFIG.LOCATION_ADDRESS;

    const addressChip = document.getElementById("contactAddressChip");
    if (addressChip) addressChip.textContent = CONFIG.LOCATION_ADDRESS;

    const hoursChip = document.getElementById("contactHoursChip");

    if (hoursChip) {

        hoursChip.textContent =
            CONFIG.OPEN_HOURS_WEEKDAY + "\n" + CONFIG.OPEN_HOURS_WEEKEND;

    }

}


/* =========================================
   CONTACT FORM
   No backend exists yet, so submitting opens
   a prefilled WhatsApp chat with the message
   instead of silently doing nothing.
========================================= */

function bindContactForm() {

    const form = document.getElementById("contactForm");

    if (!form) return;

    form.addEventListener("submit", event => {

        event.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const subject = document.getElementById("contactSubject").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        if (!name || !email || !message) {

            if (window.showToast) window.showToast("Please fill in your name, email, and message");

            return;

        }

        const lines = [
            "New message from the SANA Boutique website:",
            "",
            "Name: " + name,
            "Email: " + email
        ];

        if (subject) lines.push("Subject: " + subject);

        lines.push("", message);

        const whatsappUrl = CONFIG_LINKS.whatsapp(lines.join("\n"));

        window.open(whatsappUrl, "_blank", "noopener");

        if (window.showToast) window.showToast("Opening WhatsApp to send your message");

        form.reset();

    });

}


/* =========================================
   NEWSLETTER
   No backend to store subscribers yet, so
   this opens a prefilled email instead of
   faking a successful subscription.
========================================= */

function bindNewsletterForm() {

    const form = document.getElementById("contactNewsletterForm");

    if (!form) return;

    form.addEventListener("submit", event => {

        event.preventDefault();

        const emailField = document.getElementById("contactNewsletterEmail");
        const email = emailField ? emailField.value.trim() : "";

        if (!email) {

            if (window.showToast) window.showToast("Please enter your email");

            return;

        }

        const mailtoUrl = CONFIG_LINKS.email(
            "Newsletter Subscription",
            "Please add this email to the SANA Boutique newsletter: " + email
        );

        window.location.href = mailtoUrl;

        if (window.showToast) window.showToast("Opening your email app to confirm");

        form.reset();

    });

}


/* =========================================
   HERO PARTICLE CANVAS
   Same lightweight gold-dust field used on
   the About page hero.
========================================= */

function setupParticles() {

    const canvas = document.getElementById("contactParticleCanvas");
    const hero = document.querySelector(".contact-hero");

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

        const count = Math.max(18, Math.min(Math.round((w * h) / 18000), 55));

        particles = [];

        for (let i = 0; i < count; i++) {

            particles.push({
                x: rand(0, w),
                y: rand(0, h),
                r: rand(0.6, 2),
                vx: rand(-0.05, 0.08),
                vy: rand(-0.12, -0.02),
                baseAlpha: rand(0.2, 0.75),
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

        if (!canvas.isConnected) { stop(); return; }

        t += 0.016;

        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {

            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.y < -6) { p.y = h + 6; p.x = rand(0, w); }
            if (p.x < -6) p.x = w + 6;
            if (p.x > w + 6) p.x = -6;

            const twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed + p.twinklePhase);
            const alpha = p.baseAlpha * (0.4 + 0.6 * twinkle);

            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
            glow.addColorStop(0, "rgba(244,201,93," + alpha + ")");
            glow.addColorStop(1, "rgba(244,201,93,0)");

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

    if (!reduceMotion) start(); else draw();

    let resizeTimer;

    window.addEventListener("resize", () => {

        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(resize, 150);

    });

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) stop(); else if (!reduceMotion) start();

    });

    if ("IntersectionObserver" in window) {

        const io = new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting && !document.hidden) start();
                    else stop();

                });

            },

            { threshold: 0.05 }

        );

        io.observe(hero);

    }

}
