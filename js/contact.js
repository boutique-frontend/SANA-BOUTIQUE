import { CONFIG } from '../../config.js';

export const ContactPage = {

    async render() {
        try {
            const response = await fetch('./pages/contact/contact.html');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();

            // Wait until the returned HTML has been inserted into the DOM
            setTimeout(() => this.bindData(), 0);

            return html;

        } catch (error) {
            console.error('Error loading contact template:', error);

            return `
                <div class="contact-page-wrapper contact-error-page">
                    <div class="contact-error-card">
                        <h2>Unable to Load Contact Page</h2>
                        <p>Please try again later.</p>
                    </div>
                </div>
            `;
        }
    },

    bindData() {

        /* =====================================================
           ALWAYS START CONTACT PAGE FROM THE TOP
           ===================================================== */

        const contactPage = document.querySelector('.contact-page-wrapper');

        if (contactPage) {
            contactPage.scrollTop = 0;
        }

        window.scrollTo(0, 0);


        /* =====================================================
           GOLD EMBER PARTICLES
           ===================================================== */

        this.spawnEmberParticles();


        /* =====================================================
           ELEMENTS
           ===================================================== */

        const avatar = document.getElementById('profileAvatarImg');
        const appTitle = document.getElementById('appNameTitle');

        const emailLink = document.getElementById('emailLink');
        const emailVal = document.getElementById('emailVal');

        const whatsappLink = document.getElementById('whatsappLink');
        const whatsappVal = document.getElementById('whatsappVal');

        const phoneLink = document.getElementById('phoneLink');
        const phoneVal = document.getElementById('phoneVal');

        const tiktokLink = document.getElementById('tiktokLink');
        const tiktokVal = document.getElementById('tiktokVal');

        const instagramLink = document.getElementById('instagramLink');
        const instagramVal = document.getElementById('instagramVal');

        const locationVal = document.getElementById('locationVal');

        const mapDirectionsBtn =
            document.getElementById('mapDirectionsBtn');

        const mapFrame =
            document.getElementById('mapFrame');

        const helpWhatsAppButton =
            document.getElementById('helpWhatsAppButton');


        /* =====================================================
           APP / PROFILE
           ===================================================== */

        if (avatar && CONFIG.PROFILE_IMAGE) {
            avatar.src = CONFIG.PROFILE_IMAGE;
        }

        if (appTitle) {
            appTitle.textContent =
                CONFIG.APP_NAME || 'SAnA Boutique';
        }


        /* =====================================================
           EMAIL
           ===================================================== */

        if (emailLink && CONFIG.EMAIL) {
            emailLink.href = `mailto:${CONFIG.EMAIL}`;
        }

        if (emailVal) {
            emailVal.textContent =
                CONFIG.EMAIL || '';
        }


        /* =====================================================
           WHATSAPP
           EVERYTHING USES CONFIG.WHATSAPP_NUMBER
           ===================================================== */

        const cleanWhatsapp = String(
            CONFIG.WHATSAPP_NUMBER || ''
        ).replace(/\D/g, '');

        const whatsappUrl = cleanWhatsapp
            ? `https://wa.me/${cleanWhatsapp}`
            : '#';


        // WhatsApp contact card
        if (whatsappLink) {
            whatsappLink.href = whatsappUrl;
        }

        if (whatsappVal) {
            whatsappVal.textContent = cleanWhatsapp
                ? `+${cleanWhatsapp}`
                : '';
        }


        // "Chat With Us" button
        if (helpWhatsAppButton) {
            helpWhatsAppButton.href = whatsappUrl;
        }


        /* =====================================================
           PHONE
           USES CONFIG.PHONE_NUMBER
           ===================================================== */

        const cleanPhone = String(
            CONFIG.PHONE_NUMBER || ''
        ).replace(/[^\d+]/g, '');

        if (phoneLink) {
            phoneLink.href = cleanPhone
                ? `tel:${cleanPhone}`
                : '#';
        }

        if (phoneVal) {
            phoneVal.textContent =
                CONFIG.PHONE_NUMBER || '';
        }


        /* =====================================================
           TIKTOK
           USES CONFIG.TIKTOK_USERNAME
           ===================================================== */

        const tiktokUsername = String(
            CONFIG.TIKTOK_USERNAME || ''
        )
            .replace(/^@/, '')
            .trim();

        if (tiktokLink && tiktokUsername) {
            tiktokLink.href =
                `https://www.tiktok.com/@${tiktokUsername}`;
        }

        if (tiktokVal) {
            tiktokVal.textContent =
                tiktokUsername
                    ? `@${tiktokUsername}`
                    : '';
        }


        /* =====================================================
           INSTAGRAM
           USES CONFIG.INSTAGRAM_USERNAME
           ===================================================== */

        const instagramUsername = String(
            CONFIG.INSTAGRAM_USERNAME || ''
        )
            .replace(/^@/, '')
            .trim();

        if (instagramLink && instagramUsername) {
            instagramLink.href =
                `https://www.instagram.com/${instagramUsername}/`;
        }

        if (instagramVal) {
            instagramVal.textContent =
                instagramUsername
                    ? `@${instagramUsername}`
                    : '';
        }


        /* =====================================================
           LOCATION
           ===================================================== */

        if (locationVal) {
            locationVal.textContent =
                CONFIG.LOCATION_NAME || '';
        }


        /* =====================================================
           GOOGLE MAP DIRECTIONS
           ===================================================== */

        if (
            mapDirectionsBtn &&
            CONFIG.MAPS_REDIRECT_URL
        ) {
            mapDirectionsBtn.href =
                CONFIG.MAPS_REDIRECT_URL;
        }


        /* =====================================================
           LIVE GOOGLE MAP
           ===================================================== */

        if (
            mapFrame &&
            CONFIG.MAPS_EMBED_URL
        ) {
            mapFrame.src =
                CONFIG.MAPS_EMBED_URL;
        }


        /* =====================================================
           EXTERNAL LINKS
           PREVENT HASH ROUTER INTERFERENCE
           ===================================================== */

        document
            .querySelectorAll('.external-link')
            .forEach((link) => {

                // Avoid attaching the same listener multiple times
                if (link.dataset.externalBound === 'true') {
                    return;
                }

                link.dataset.externalBound = 'true';

                link.addEventListener('click', (event) => {
                    event.stopPropagation();
                });
            });
    },

    /* =====================================================
       GOLD EMBER PARTICLES
       Spawns glowing gold particles that drift upward, like
       embers. Two layers: a wide sparse one across the whole
       hero banner, and a denser one over the photo panel.
       Skipped entirely if the user has reduced-motion on.
       ===================================================== */

    spawnEmberParticles() {

        if (
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        this._spawnEmbersInto('heroEmberLayer', 35, {
            sizeRange: [2, 5],
            riseRange: [160, 320],
            driftRange: [-40, 40],
            durationRange: [5, 9]
        });

        this._spawnEmbersInto('avatarEmberLayer', 18, {
            sizeRange: [1.5, 3.5],
            riseRange: [60, 120],
            driftRange: [-18, 18],
            durationRange: [3, 5.5]
        });

        this._spawnTwinkleInto('heroTwinkleLayer', 40);
    },

    _spawnEmbersInto(containerId, count, opts) {
        const container = document.getElementById(containerId);

        if (!container) return;

        // Guard against re-spawning if bindData ever runs twice
        if (container.dataset.embersSpawned === 'true') return;
        container.dataset.embersSpawned = 'true';

        const {
            sizeRange = [2, 5],
            riseRange = [140, 260],
            driftRange = [-30, 30],
            durationRange = [4, 8]
        } = opts || {};

        const frag = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('span');
            particle.className = 'ember-particle';

            const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
            const rise = riseRange[0] + Math.random() * (riseRange[1] - riseRange[0]);
            const drift = driftRange[0] + Math.random() * (driftRange[1] - driftRange[0]);
            const duration = durationRange[0] + Math.random() * (durationRange[1] - durationRange[0]);
            const delay = -Math.random() * duration; // negative delay = already mid-flight on load
            const left = Math.random() * 100;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.setProperty('--rise', `-${rise}px`);
            particle.style.setProperty('--drift', `${drift}px`);
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            frag.appendChild(particle);
        }

        container.appendChild(frag);
    },

    // Scattered static dots that fade in/out — no upward drift.
    // Spread wide across the whole hero for that starry-background
    // look, unlike the rising ember particles.
    _spawnTwinkleInto(containerId, count) {
        const container = document.getElementById(containerId);

        if (!container) return;
        if (container.dataset.twinkleSpawned === 'true') return;
        container.dataset.twinkleSpawned = 'true';

        const frag = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.className = 'twinkle-dot';

            const size = 1 + Math.random() * 2.5;
            const duration = 2 + Math.random() * 4;
            const delay = -Math.random() * duration;
            const top = Math.random() * 100;
            const left = Math.random() * 100;

            dot.style.width = `${size}px`;
            dot.style.height = `${size}px`;
            dot.style.top = `${top}%`;
            dot.style.left = `${left}%`;
            dot.style.animationDuration = `${duration}s`;
            dot.style.animationDelay = `${delay}s`;

            frag.appendChild(dot);
        }

        container.appendChild(frag);
    }
};

window.ContactPage = ContactPage;
