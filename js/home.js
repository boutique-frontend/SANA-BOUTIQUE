/* =========================================
   SANA BOUTIQUE
   HOME PAGE CONTROLLER
========================================= */

"use strict";


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
========================================= */

async function loadFeaturedProducts() {

    const container =
        document.getElementById("featuredProducts");


    if (!container) return;


    /*
     * The API connection will be connected
     * to your existing backend in api.js.
     */

    try {

        if (
            typeof getFeaturedProducts !==
            "function"
        ) {

            showEmptyProducts(container);

            return;

        }


        setLoading(true);


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


    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        showProductError(container);

    } finally {

        setLoading(false);

    }

}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderFeaturedProducts(
    products,
    container
) {

    container.innerHTML = "";


    if (!products.length) {

        showEmptyProducts(container);

        return;

    }


    products.forEach(product => {

        const card =
            createProductCard(product);


        container.appendChild(card);

    });

}


/* =========================================
   PRODUCT CARD
========================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");


    card.className =
        "product-card";


    /*
     * Backend may use different field names.
     * We support the common ones here.
     */

    const id =
        product.id ??
        product._id ??
        product.product_id;


    const name =
        product.name ??
        product.title ??
        "SANA Boutique Item";


    const price =
        product.price ??
        product.amount ??
        "";


    const image =
        product.image_url ??
        product.image ??
        product.photo ??
        "";


    const formattedPrice =
        formatPrice(price);


    card.innerHTML = `

        <button
            class="product-favorite"
            data-favorite="${escapeHTML(id)}"
            aria-label="Add to favorites"
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
                    >
                  `
                : `
                    <div
                        class="product-card-image
                               image-placeholder"
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


    /*
     * Open product details
     */

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


    /*
     * Favorite button
     */

    const favoriteButton =
        card.querySelector(
            ".product-favorite"
        );


    if (favoriteButton) {

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

                event.stopPropagation();


                const card =
                    button.closest(
                        ".category-card"
                    );


                if (!card) return;


                const title =
                    card.querySelector("h3");


                if (!title) return;


                const category =
                    title.textContent
                        .trim()
                        .replace(/\s+/g, " ");


                /*
                 * Shop page will later receive
                 * the selected category.
                 */

                window.location.href =
                    `pages/shop.html?category=${encodeURIComponent(category)}`;

            }
        );

    });

}


/* =========================================
   SHOP BUTTON
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

    container.innerHTML = `

        <div class="loading">

            <p>
                No products available yet.
            </p>

        </div>

    `;

}


/* =========================================
   ERROR
========================================= */

function showProductError(container) {

    container.innerHTML = `

        <div class="loading">

            <p>
                Unable to load products.
            </p>

            <button
                class="gold-button"
                id="retryProducts"
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
            loadFeaturedProducts
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
   EXPOSE HOME FUNCTIONS
========================================= */

window.loadFeaturedProducts =
    loadFeaturedProducts;

window.renderFeaturedProducts =
    renderFeaturedProducts;
