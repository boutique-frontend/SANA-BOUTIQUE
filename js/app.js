/* =========================================
   SANA BOUTIQUE
   MAIN APP CONTROLLER + ROUTER
========================================= */

"use strict";


/* =========================================
   APP CONFIGURATION
========================================= */

const SANA_APP = {

    name: "SANA Boutique",

    version: "1.0.0",

    API_BASE_URL: "",

    debug: true

};


/* =========================================
   GLOBAL APP STATE
========================================= */

const AppState = {

    currentPage: "home",

    products: [],

    selectedProduct: null,

    favorites: [],

    cart: [],

    isLoading: false

};


/* =========================================
   MAIN APP ROUTER
========================================= */

const App = {

    /* -------------------------------------
       INITIALIZE
    ------------------------------------- */

    async init() {

        const appContainer =
            document.getElementById("app");

        if (!appContainer) {

            console.error(
                "SANA: #app container not found."
            );

            return;

        }


        /* Main page container */

        appContainer.innerHTML = `
            <div id="page-content"></div>
        `;


        loadLocalState();

        setupGlobalEvents();


        /* Listen for #home, #shop, etc. */

        window.addEventListener(
            "hashchange",
            () => this.handleRoute()
        );


        /* Load current page */

        await this.handleRoute();

    },


    /* -------------------------------------
       HANDLE ROUTE
    ------------------------------------- */

    async handleRoute() {

        const contentContainer =
            document.getElementById(
                "page-content"
            );


        if (!contentContainer) return;


        /*
         * Read URL hash.
         *
         * Examples:
         * #home
         * #shop
         * #post
         * #about
         * #contact
         * #product/123
         */

        let hash =
            window.location.hash
                .replace(/^#/, "")
                .trim();


        if (!hash) {

            hash = "home";

        }


        const parts =
            hash.split("/");


        const route =
            parts[0].toLowerCase();


        const routeParameter =
            parts[1] || null;


        AppState.currentPage =
            route;


        console.log(
            `SANA: Loading route "${route}"`
        );


        setLoading(true);


        try {

            let module;


            /* =================================
               HOME
            ================================= */

            switch (route) {


                case "home":

                    module =
                        await import(
                            "./js/home.js?v=2"
                        );


                    if (
                        !module.HomePage
                    ) {

                        throw new Error(
                            "HomePage was not found in js/home.js"
                        );

                    }


                    contentContainer.innerHTML =
                        await module.HomePage.render();


                    if (
                        typeof module.HomePage.init ===
                        "function"
                    ) {

                        await module.HomePage.init();

                    }


                    break;



                /* =================================
                   SHOP
                ================================= */

                case "shop":

                    module =
                        await import(
                            "./js/shop.js?v=2"
                        );


                    if (
                        !module.ShopPage
                    ) {

                        throw new Error(
                            "ShopPage was not found in js/shop.js"
                        );

                    }


                    contentContainer.innerHTML =
                        await module.ShopPage.render();


                    if (
                        typeof module.ShopPage.init ===
                        "function"
                    ) {

                        await module.ShopPage.init();

                    }


                    break;



                /* =================================
                   POST
                ================================= */

                case "post":

                    module =
                        await import(
                            "./js/post.js?v=2"
                        );


                    if (
                        !module.PostPage
                    ) {

                        throw new Error(
                            "PostPage was not found in js/post.js"
                        );

                    }


                    contentContainer.innerHTML =
                        await module.PostPage.render();


                    if (
                        typeof module.PostPage.init ===
                        "function"
                    ) {

                        await module.PostPage.init();

                    }


                    break;



                /* =================================
                   ABOUT
                ================================= */

                case "about":

                    module =
                        await import(
                            "./js/about.js?v=2"
                        );


                    if (
                        !module.AboutPage
                    ) {

                        throw new Error(
                            "AboutPage was not found in js/about.js"
                        );

                    }


                    contentContainer.innerHTML =
                        await module.AboutPage.render();


                    if (
                        typeof module.AboutPage.init ===
                        "function"
                    ) {

                        await module.AboutPage.init();

                    }


                    break;



                /* =================================
                   CONTACT
                ================================= */

                case "contact":

                    module =
                        await import(
                            "./js/contact.js?v=2"
                        );


                    if (
                        !module.ContactPage
                    ) {

                        throw new Error(
                            "ContactPage was not found in js/contact.js"
                        );

                    }


                    contentContainer.innerHTML =
                        await module.ContactPage.render();


                    if (
                        typeof module.ContactPage.init ===
                        "function"
                    ) {

                        await module.ContactPage.init();

                    }


                    break;



                /* =================================
                   PRODUCT
                ================================= */

                case "product":

                    module =
                        await import(
                            "./js/product.js?v=2"
                        );


                    if (
                        !module.ProductPage
                    ) {

                        throw new Error(
                            "ProductPage was not found in js/product.js"
                        );

                    }


                    /*
                     * Make product ID available
                     * to product.js.
                     */

                    window.SANA_PRODUCT_ID =
                        routeParameter;


                    contentContainer.innerHTML =
                        await module.ProductPage.render(
                            routeParameter
                        );


                    if (
                        typeof module.ProductPage.init ===
                        "function"
                    ) {

                        await module.ProductPage.init(
                            routeParameter
                        );

                    }


                    break;



                /* =================================
                   UNKNOWN ROUTE
                ================================= */

                default:

                    console.warn(
                        `SANA: Unknown route "${route}", returning home.`
                    );


                    window.location.hash =
                        "#home";


                    return;

            }


            /* =================================
               RESET SCROLL
            ================================= */

            this.resetScroll(
                contentContainer
            );


            /* =================================
               UPDATE NAVIGATION
            ================================= */

            updateNavigation(route);


        } catch (error) {

            console.error(
                "SANA routing error:",
                error
            );


            contentContainer.innerHTML = `

                <section
                    class="error-box"
                    style="
                        min-height:60vh;
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        justify-content:center;
                        text-align:center;
                        padding:30px;
                    "
                >

                    <h2>
                        Something went wrong
                    </h2>

                    <p
                        style="
                            color:#8c9ba5;
                            margin-top:10px;
                            max-width:500px;
                        "
                    >
                        ${escapeHTML(
                            error.message ||
                            "Unable to load this page."
                        )}
                    </p>

                    <button
                        type="button"
                        onclick="window.location.hash='#home'"
                        style="
                            margin-top:20px;
                            padding:12px 22px;
                            border-radius:999px;
                            border:1px solid rgba(244,210,122,.5);
                            background:transparent;
                            color:#f4d27a;
                            cursor:pointer;
                        "
                    >
                        BACK HOME
                    </button>

                </section>

            `;


            this.resetScroll(
                contentContainer
            );

        } finally {

            setLoading(false);

        }

    },


    /* -------------------------------------
       RESET SCROLL
    ------------------------------------- */

    resetScroll(contentContainer) {

        window.scrollTo(
            0,
            0
        );


        document.documentElement.scrollTop =
            0;


        document.body.scrollTop =
            0;


        if (contentContainer) {

            contentContainer.scrollTop =
                0;


            const pageRoot =
                contentContainer
                    .firstElementChild;


            if (pageRoot) {

                pageRoot.scrollTop =
                    0;

            }

        }

    }

};


/* =========================================
   NAVIGATION
========================================= */

function updateNavigation(route) {

    /*
     * Supports both:
     *
     * .nav-item
     * [data-route]
     */

    document
        .querySelectorAll(
            ".nav-item, [data-route]"
        )
        .forEach(item => {

            const target =
                (
                    item.dataset.route ||
                    item.getAttribute("href") ||
                    ""
                )
                .replace(/^#/, "")
                .replace(/^.*#/, "")
                .split("/")[0]
                .toLowerCase();


            item.classList.toggle(
                "active",
                target === route
            );

        });

}


/* =========================================
   NAVIGATION HELPER
========================================= */

function goTo(url) {

    if (!url) return;


    /*
     * Hash routes stay inside
     * the SPA.
     */

    if (
        url.startsWith("#")
    ) {

        window.location.hash =
            url.substring(1);

        return;

    }


    /*
     * Convert old page links
     * into SPA routes.
     */

    const clean =
        url
            .split("?")[0]
            .split("#")[0];


    if (
        clean.includes("about.html")
    ) {

        window.location.hash =
            "#about";

        return;

    }


    if (
        clean.includes("contact.html")
    ) {

        window.location.hash =
            "#contact";

        return;

    }


    if (
        clean.includes("shop.html")
    ) {

        window.location.hash =
            "#shop";

        return;

    }


    if (
        clean.includes("post.html")
    ) {

        window.location.hash =
            "#post";

        return;

    }


    if (
        clean.includes("index.html") ||
        clean === ""
    ) {

        window.location.hash =
            "#home";

        return;

    }


    window.location.href =
        url;

}


/* =========================================
   OPEN PRODUCT
========================================= */

function openProduct(productId) {

    if (!productId) return;


    window.location.hash =
        `#product/${encodeURIComponent(
            productId
        )}`;

}


/* =========================================
   FAVORITES
========================================= */

function toggleFavorite(productId) {

    if (!productId) return;


    const index =
        AppState.favorites.indexOf(
            productId
        );


    if (index === -1) {

        AppState.favorites.push(
            productId
        );

        showToast(
            "Added to favorites"
        );

    } else {

        AppState.favorites.splice(
            index,
            1
        );

        showToast(
            "Removed from favorites"
        );

    }


    saveLocalState();


    document
        .querySelectorAll(
            `[data-favorite="${productId}"]`
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                AppState.favorites.includes(
                    productId
                )
            );

        });

}


/* =========================================
   CHECK FAVORITE
========================================= */

function isFavorite(productId) {

    return AppState.favorites.includes(
        productId
    );

}


/* =========================================
   CART
========================================= */

function addToCart(product) {

    if (
        !product ||
        !product.id
    ) {

        return;

    }


    AppState.cart.push(
        product
    );


    saveLocalState();


    showToast(
        "Added to bag"
    );

}


/* =========================================
   REMOVE FROM CART
========================================= */

function removeFromCart(productId) {

    AppState.cart =
        AppState.cart.filter(
            product =>
                product.id !== productId
        );


    saveLocalState();

}


/* =========================================
   LOCAL STORAGE
========================================= */

function loadLocalState() {

    try {

        const savedFavorites =
            localStorage.getItem(
                "sana_favorites"
            );


        const savedCart =
            localStorage.getItem(
                "sana_cart"
            );


        if (savedFavorites) {

            const parsedFavorites =
                JSON.parse(
                    savedFavorites
                );


            if (
                Array.isArray(
                    parsedFavorites
                )
            ) {

                AppState.favorites =
                    parsedFavorites;

            }

        }


        if (savedCart) {

            const parsedCart =
                JSON.parse(
                    savedCart
                );


            if (
                Array.isArray(
                    parsedCart
                )
            ) {

                AppState.cart =
                    parsedCart;

            }

        }

    } catch (error) {

        console.error(
            "Could not load local app state:",
            error
        );

    }

}


/* =========================================
   SAVE LOCAL STATE
========================================= */

function saveLocalState() {

    try {

        localStorage.setItem(
            "sana_favorites",
            JSON.stringify(
                AppState.favorites
            )
        );


        localStorage.setItem(
            "sana_cart",
            JSON.stringify(
                AppState.cart
            )
        );

    } catch (error) {

        console.error(
            "Could not save app state:",
            error
        );

    }

}


/* =========================================
   GLOBAL EVENTS
========================================= */

function setupGlobalEvents() {

    /* Prevent accidental button double-tap */

    document.addEventListener(
        "dblclick",
        event => {

            if (
                event.target &&
                event.target.tagName ===
                "BUTTON"
            ) {

                event.preventDefault();

            }

        }
    );


    /* Online */

    window.addEventListener(
        "online",
        () => {

            showToast(
                "Connection restored"
            );

        }
    );


    /* Offline */

    window.addEventListener(
        "offline",
        () => {

            showToast(
                "You are offline"
            );

        }
    );

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    let toast =
        document.querySelector(
            ".sana-toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.className =
            "sana-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast.hideTimer
    );


    toast.hideTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================
   LOADING STATE
========================================= */

function setLoading(isLoading) {

    AppState.isLoading =
        Boolean(isLoading);


    document.body.classList.toggle(
        "app-loading",
        AppState.isLoading
    );

}


/* =========================================
   SAFE JSON
========================================= */

function safeJSON(
    value,
    fallback = null
) {

    try {

        return JSON.parse(
            value
        );

    } catch {

        return fallback;

    }

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   GLOBAL EXPORTS
========================================= */

window.SANA_APP =
    SANA_APP;

window.AppState =
    AppState;

window.App =
    App;

window.goTo =
    goTo;

window.openProduct =
    openProduct;

window.toggleFavorite =
    toggleFavorite;

window.isFavorite =
    isFavorite;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.showToast =
    showToast;

window.setLoading =
    setLoading;

window.safeJSON =
    safeJSON;


/* =========================================
   START APP
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            `${SANA_APP.name} v${SANA_APP.version} started`
        );


        App.init();

    }
);
