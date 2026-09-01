/* =========================================
   SANA BOUTIQUE
   CENTRAL CONFIG
   Single source of truth for contact info,
   socials, and location. Update values here
   and every page that reads from CONFIG
   (currently: contact.html) stays in sync.
========================================= */

"use strict";


const CONFIG = {

    APP_NAME: "SANA Boutique",

    /* =====================================
       CONTACT
       NOTE: EMAIL is a placeholder — swap
       in the real inbox address.
    ===================================== */

    EMAIL: "hello@sanaboutique.com",

    PHONE_NUMBER: "+232 76 123456",

    /* Used for the wa.me link. Keep the
       same number as PHONE_NUMBER unless
       WhatsApp uses a different line. */
    WHATSAPP_NUMBER: "+232 76 123456",


    /* =====================================
       SOCIALS
       Usernames only (no @, no full URL) —
       links are built from these.
    ===================================== */

    INSTAGRAM_USERNAME: "sana.boutique.sl",

    TIKTOK_USERNAME: "sana.boutique.sl",


    /* =====================================
       LOCATION
    ===================================== */

    LOCATION_NAME: "SANA Boutique",

    LOCATION_ADDRESS: "123 Fashion Street, Freetown, Sierra Leone",

    OPEN_HOURS_WEEKDAY: "Mon - Sat: 9AM - 7PM",

    OPEN_HOURS_WEEKEND: "Sunday: Closed",


    /* =====================================
       MAP LINKS
       Built from LOCATION_ADDRESS — no API
       key required for either of these.
    ===================================== */

    get MAPS_EMBED_URL() {

        return "https://www.google.com/maps?q=" +
            encodeURIComponent(this.LOCATION_ADDRESS) +
            "&output=embed";

    },

    get MAPS_DIRECTIONS_URL() {

        return "https://www.google.com/maps/dir/?api=1&destination=" +
            encodeURIComponent(this.LOCATION_ADDRESS);

    }

};


/* =========================================
   LINK HELPERS
   Build ready-to-use links from the raw
   values above so no page has to re-derive
   digits-only numbers or URL-encode text.
========================================= */

const CONFIG_LINKS = {

    /* wa.me requires digits only, no + or
       spaces. Optional prefilled message. */
    whatsapp(message) {

        const digits =
            CONFIG.WHATSAPP_NUMBER.replace(/\D/g, "");

        const base =
            "https://wa.me/" + digits;

        if (!message) return base;

        return base + "?text=" + encodeURIComponent(message);

    },

    phone() {

        return "tel:" + CONFIG.PHONE_NUMBER.replace(/\s+/g, "");

    },

    email(subject, body) {

        let url = "mailto:" + CONFIG.EMAIL;

        const params = [];

        if (subject) params.push("subject=" + encodeURIComponent(subject));
        if (body) params.push("body=" + encodeURIComponent(body));

        if (params.length) url += "?" + params.join("&");

        return url;

    },

    instagram() {

        return "https://instagram.com/" + CONFIG.INSTAGRAM_USERNAME;

    },

    tiktok() {

        return "https://tiktok.com/@" + CONFIG.TIKTOK_USERNAME;

    }

};


/* =========================================
   EXPOSE GLOBALLY
========================================= */

window.CONFIG = CONFIG;

window.CONFIG_LINKS = CONFIG_LINKS;
