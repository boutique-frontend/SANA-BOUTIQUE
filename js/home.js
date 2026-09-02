/* =========================================
   SANA BOUTIQUE
   HOME PAGE CONTROLLER
========================================= */

"use strict";


/* =========================================
   SAFETY NET

   FIX:
   - AppState normally comes from app.js.
   - If app.js ever fails to parse (syntax
     error, etc.), AppState would not exist
     at all, and the line below that sets
     AppState.products would throw and kill
     product loading before it starts — the
     same failure pattern setLoading had.
   - This guarantees AppState always exists
     here, without overriding the real one
     when app.js loads correctly.
========================================= */

if (typeof window.AppState === "undefined") {

    window.AppState = { products: [] };

}


document.addEventListener("DOMContentLoaded", () => {

    initializeHome();

});


/* =========================================
   INITIALIZE HOME
========================================= */

async function initializeHome() {

    setupCategoryButtons();

    setupShopButton();

    await loadFeaturedProducts();

}


/* =========================================
   LOAD FEATURED PRODUCTS

   FIX:
   - Render's free tier puts the backend to
     sleep when idle, so the FIRST request
     after a while can take 20-50s to wake it
     up and may time out / fail even though
     the backend is fine.
   - Rather than showing a scary error on
     that first failure, this now retries
     once automatically after a short delay,
     with a "waking up" message in between.
   - Only shows the real error + Try Again
     button if the SECOND attempt also fails.
========================================= */

async function loadFeaturedProducts() {

    const container =
        document.getElementById("featuredProducts");


    if (!container) return;


    if (
        typeof getFeaturedProducts !==
        "function"
    ) {

        showEmptyProducts(container);

        return;

    }


    safeSetLoading(true);


    try {

        const products =
            await getFeaturedProducts();


        AppState.products =
            Array.isArray(products)
                ? products
                : [];


        renderFeaturedProducts(
            AppState.products,
            container
        );

        safeSetLoading(false);

        return;

    } catch (firstError) {

        console.warn(
            "First attempt to load products failed, retrying:",
            firstError
        );

    }


    /*
     * FIRST ATTEMPT FAILED —
     * likely a sleeping backend waking up.
     * Show a friendly interim state and
     * retry once after a short delay.
     */

    showWakingUp(container);


    await wait(4000);


    try {

        const products =
            await getFeaturedProducts();


        AppState.products =
            Array.isArray(products)
                ? products
                : [];


        renderFeaturedProducts(
            AppState.products,
            container
        );

    } catch (secondError) {

        console.error(
            "Failed to load products after retry:",
            secondError
        );

        showProductError(container);

    } finally {

        safeSetLoading(false);

    }

}


/* =========================================
   SAFE setLoading

   FIX:
   - setLoading() lives in app.js. If app.js
     ever fails to load or has a syntax error,
     setLoading would be undefined and calling
     it directly would throw — which, outside
     a try/catch, silently kills this whole
     function before it ever fetches products.
   - This guards every call so a problem in
     app.js can no longer take the featured
     products section down with it.
========================================= */

function safeSetLoading(isLoading) {

    if (typeof setLoading === "function") {

        setLoading(isLoading);

    }

}


/* =========================================
   SIMPLE DELAY HELPER
========================================= */

function wait(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}


/* =========================================
   RENDER FEATURED PRODUCTS
========================================= */

function renderFeaturedProducts(
    products,
    container
) {

    container.innerHTML = "";


    /*
     * Tag the container so home.css can
     * target it for the horizontal
     * side-scroll layout.
     */

    container.classList.add(
        "product-scroll-row"
    );


    if (!Array.isArray(products) || !products.length) {

        showEmptyProducts(container);

        return;

    }


    products.forEach(product => {

        if (!product) return;


        const card =
            createProductCard(product);


        container.appendChild(card);

    });

}


/* =========================================
   CREATE PRODUCT CARD
========================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");


    card.className =
        "product-card";


    const id =
        product.id ??
        product._id ??
        product.product_id ??
        "";


    const name =
        product.name ??
        product.title ??
        "SANA Boutique Item";


    const price =
        product.price ??
        product.amount ??
        "";


    /*
     * This is the REAL IMAGE uploaded
     * through the posting system.
     */

    const image =
        product.image_url ??
        product.image ??
        product.photo ??
        product.imageUrl ??
        "";


    const formattedPrice =
        formatPrice(price);


    card.innerHTML = `

        <button
            class="product-favorite"
            data-favorite="${escapeHTML(id)}"
            aria-label="Add to favorites"
            type="button"
        >
            ♡
        </button>


        ${
            image
                ? `
                    <img
                        class="product-card-image"
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(name)}"
                        loading="lazy"
                        onerror="this.style.display='none';"
                    >
                  `
                : `
                    <div
                        class="product-card-image
                               image-placeholder"
                        aria-label="No product image"
                    ></div>
                  `
        }


        <div class="product-info">

            <h3>
                ${escapeHTML(name)}
            </h3>

            <div class="product-price">
                ${escapeHTML(formattedPrice)}
            </div>

        </div>

    `;


    /* =====================================
       OPEN PRODUCT DETAILS
    ===================================== */

    card.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    ".product-favorite"
                )
            ) {

                return;

            }


            if (id) {

                openProduct(id);

            }

        }
    );


    /* =====================================
       FAVORITE
    ===================================== */

    const favoriteButton =
        card.querySelector(
            ".product-favorite"
        );


    if (favoriteButton && id) {

        updateFavoriteButton(
            favoriteButton,
            id
        );


        favoriteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                toggleFavorite(id);


                updateFavoriteButton(
                    favoriteButton,
                    id
                );

            }
        );

    }


    return card;

}


/* =========================================
   FAVORITE BUTTON STATE
========================================= */

function updateFavoriteButton(
    button,
    productId
) {

    if (!button || !productId) return;


    if (
        typeof isFavorite !==
        "function"
    ) {

        return;

    }


    const favorite =
        isFavorite(productId);


    button.classList.toggle(
        "active",
        favorite
    );


    button.textContent =
        favorite ? "♥" : "♡";

}


/* =========================================
   CATEGORY BUTTONS
========================================= */

function setupCategoryButtons() {

    const buttons =
        document.querySelectorAll(
            ".category-content button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                const card =
                    button.closest(
                        ".category-card"
                    );


                if (!card) return;


                /*
                 * Use the data-category
                 * already present in index.html.
                 */

                const category =
                    card.dataset.category;


                if (!category) return;


                window.location.href =
                    `pages/shop.html?category=${encodeURIComponent(category)}`;

            }
        );

    });

}


/* =========================================
   SHOP COLLECTION BUTTON
========================================= */

function setupShopButton() {

    const shopButton =
        document.querySelector(
            ".hero .gold-button"
        );


    if (!shopButton) return;


    shopButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "pages/shop.html";

        }
    );

}


/* =========================================
   PRICE FORMAT
========================================= */

function formatPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {

        return "Price unavailable";

    }


    const numericPrice =
        Number(
            String(price)
                .replace(/[^0-9.]/g, "")
        );


    if (Number.isNaN(numericPrice)) {

        return String(price);

    }


    return `Rs. ${numericPrice.toLocaleString()}`;

}


/* =========================================
   EMPTY PRODUCTS
========================================= */

function showEmptyProducts(container) {

    container.classList.remove(
        "product-scroll-row"
    );


    container.innerHTML = `

        <div class="loading">

            <p>
                No products available yet.
            </p>

        </div>

    `;

}


/* =========================================
   WAKING UP
   Shown between the first (failed) attempt
   and the automatic retry, so a sleeping
   Render backend doesn't look like an error.
========================================= */

function showWakingUp(container) {

    container.classList.remove(
        "product-scroll-row"
    );


    container.innerHTML = `

        <div class="loading">

            <p>
                Waking up the store — this can
                take a few seconds on the first
                load.
            </p>

        </div>

    `;

}


/* =========================================
   PRODUCT ERROR
========================================= */

function showProductError(container) {

    container.classList.remove(
        "product-scroll-row"
    );


    container.innerHTML = `

        <div class="loading">

            <p>
                Unable to load products.
            </p>

            <button
                class="gold-button"
                id="retryProducts"
                type="button"
                style="margin-top:15px;"
            >
                TRY AGAIN
            </button>

        </div>

    `;


    const retry =
        document.getElementById(
            "retryProducts"
        );


    if (retry) {

        retry.addEventListener(
            "click",
            () => loadFeaturedProducts()
        );

    }

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   EXPOSE FUNCTIONS
========================================= */

window.loadFeaturedProducts =
    loadFeaturedProducts;


window.renderFeaturedProducts =
    renderFeaturedProducts;
