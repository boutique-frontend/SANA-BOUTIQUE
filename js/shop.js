/* =========================================
   SANA BOUTIQUE
   SHOP CONTROLLER
========================================= */

"use strict";

let shopProducts = [];
let activeCategory = "all";
let searchTerm = "";


document.addEventListener("DOMContentLoaded", () => {
    initializeShop();
});


/* =========================================
   INITIALIZE
========================================= */

async function initializeShop() {

    setupSearch();

    setupCategoryFilters();

    setupFilterButton();

    readCategoryFromURL();

    await loadShopProducts();
}


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadShopProducts() {

    const container =
        document.getElementById("shopProducts");

    if (!container) return;

    try {

        setShopLoading(container);

        /*
         * We will connect this to your
         * existing backend through api.js.
         */

        let products = [];

        if (typeof getProducts === "function") {
            products = await getProducts();
        }
        else if (
            typeof getFeaturedProducts === "function"
        ) {
            products = await getFeaturedProducts();
        }

        shopProducts =
            Array.isArray(products)
                ? products
                : [];

        AppState.products = shopProducts;

        renderShopProducts();

    } catch (error) {

        console.error(
            "Shop products error:",
            error
        );

        showShopError(container);
    }
}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderShopProducts() {

    const container =
        document.getElementById("shopProducts");

    if (!container) return;

    const filtered =
        filterProducts(shopProducts);

    container.innerHTML = "";

    if (!filtered.length) {

        showNoProducts(container);

        updateResultsTitle(0);

        return;
    }

    filtered.forEach(product => {

        const card =
            createShopProductCard(product);

        container.appendChild(card);

    });

    updateResultsTitle(filtered.length);
}


/* =========================================
   FILTER PRODUCTS
========================================= */

function filterProducts(products) {

    return products.filter(product => {

        const name =
            String(
                product.name ??
                product.title ??
                ""
            ).toLowerCase();

        const description =
            String(
                product.description ??
                ""
            ).toLowerCase();

        const category =
            String(
                product.category ??
                product.categories ??
                ""
            ).toLowerCase();

        const matchesSearch =
            !searchTerm ||
            name.includes(searchTerm) ||
            description.includes(searchTerm) ||
            category.includes(searchTerm);

        const matchesCategory =
            activeCategory === "all" ||
            category.includes(
                activeCategory.toLowerCase()
            );

        return (
            matchesSearch &&
            matchesCategory
        );

    });
}


/* =========================================
   PRODUCT CARD
========================================= */

function createShopProductCard(product) {

    const card =
        document.createElement("article");

    card.className = "product-card";

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

    const category =
        product.category ??
        product.categories ??
        "";

    card.innerHTML = `

        ${
            category
                ? `
                    <span class="product-badge">
                        ${escapeHTML(category)}
                    </span>
                  `
                : ""
        }

        <button
            class="product-favorite"
            data-favorite="${escapeHTML(id)}"
            aria-label="Favorite"
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
                ${formatShopPrice(price)}
            </div>

        </div>
    `;


    /* Open product */

    card.addEventListener("click", event => {

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

    });


    /* Favorite */

    const favorite =
        card.querySelector(
            ".product-favorite"
        );

    if (favorite) {

        updateShopFavorite(
            favorite,
            id
        );

        favorite.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleFavorite(id);

                updateShopFavorite(
                    favorite,
                    id
                );

            }
        );
    }


    return card;
}


/* =========================================
   FAVORITE STATE
========================================= */

function updateShopFavorite(
    button,
    productId
) {

    if (!button || !productId) return;

    const active =
        isFavorite(productId);

    button.classList.toggle(
        "active",
        active
    );

    button.textContent =
        active ? "♥" : "♡";
}


/* =========================================
   SEARCH
========================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "productSearch"
        );

    const clearButton =
        document.getElementById(
            "clearSearch"
        );

    if (!input) return;


    input.addEventListener(
        "input",
        () => {

            searchTerm =
                input.value
                    .trim()
                    .toLowerCase();

            updateClearButton(
                clearButton
            );

            renderShopProducts();

        }
    );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                input.value = "";

                searchTerm = "";

                updateClearButton(
                    clearButton
                );

                renderShopProducts();

                input.focus();

            }
        );
    }
}


/* =========================================
   CLEAR SEARCH BUTTON
========================================= */

function updateClearButton(button) {

    if (!button) return;

    button.classList.toggle(
        "show",
        searchTerm.length > 0
    );
}


/* =========================================
   CATEGORY FILTERS
========================================= */

function setupCategoryFilters() {

    const buttons =
        document.querySelectorAll(
            ".category-filter"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activeCategory =
                    (
                        button.dataset.category ||
                        "all"
                    ).toLowerCase();


                buttons.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                updateCategoryTitle();

                renderShopProducts();

            }
        );

    });
}


/* =========================================
   CATEGORY FROM URL
========================================= */

function readCategoryFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        params.get("category");

    if (!category) return;

    const normalized =
        category
            .toLowerCase()
            .replace(/\s+/g, "");

    activeCategory =
        normalized;


    const buttons =
        document.querySelectorAll(
            ".category-filter"
        );


    buttons.forEach(button => {

        const buttonCategory =
            (
                button.dataset.category ||
                ""
            )
            .toLowerCase()
            .replace(/\s+/g, "");


        button.classList.toggle(
            "active",
            buttonCategory === normalized
        );

    });


    updateCategoryTitle();
}


/* =========================================
   CATEGORY TITLE
========================================= */

function updateCategoryTitle() {

    const title =
        document.getElementById(
            "resultsTitle"
        );

    if (!title) return;


    if (activeCategory === "all") {

        title.textContent =
            "All Products";

        return;
    }


    title.textContent =
        capitalizeWords(
            activeCategory
        );
}


/* =========================================
   RESULTS COUNT
========================================= */

function updateResultsTitle(count) {

    const title =
        document.getElementById(
            "resultsTitle"
        );

    if (!title) return;

    /*
     * Keep the category name while
     * showing the number of results.
     */

    const categoryName =
        activeCategory === "all"
            ? "All Products"
            : capitalizeWords(
                activeCategory
            );

    title.textContent =
        `${categoryName} (${count})`;
}


/* =========================================
   FILTER BUTTON
========================================= */

function setupFilterButton() {

    const button =
        document.getElementById(
            "filterButton"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            showToast(
                "More filters coming soon"
            );

        }
    );
}


/* =========================================
   LOADING
========================================= */

function setShopLoading(container) {

    container.innerHTML = `

        <div class="loading">

            Loading collection...

        </div>

    `;
}


/* =========================================
   NO PRODUCTS
========================================= */

function showNoProducts(container) {

    container.innerHTML = `

        <div class="no-products">

            <div class="no-products-icon">
                ♢
            </div>

            <h3>
                No Products Found
            </h3>

            <p>
                Try another search or category.
            </p>

        </div>

    `;
}


/* =========================================
   ERROR
========================================= */

function showShopError(container) {

    container.innerHTML = `

        <div class="no-products">

            <div class="no-products-icon">
                !
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                We couldn't load the collection.
            </p>

            <button
                class="gold-button"
                id="retryShop"
                style="margin-top:18px;"
            >
                TRY AGAIN
            </button>

        </div>

    `;


    const retry =
        document.getElementById(
            "retryShop"
        );

    if (retry) {

        retry.addEventListener(
            "click",
            loadShopProducts
        );

    }
}


/* =========================================
   PRICE
========================================= */

function formatShopPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {
        return "Price unavailable";
    }

    const numeric =
        Number(
            String(price)
                .replace(/[^0-9.]/g, "")
        );

    if (Number.isNaN(numeric)) {

        return String(price);

    }

    return `Rs. ${numeric.toLocaleString()}`;
}


/* =========================================
   CAPITALIZE
========================================= */

function capitalizeWords(value) {

    return String(value)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}


/* =========================================
   ESCAPE HTML
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

window.loadShopProducts =
    loadShopProducts;

window.renderShopProducts =
    renderShopProducts; 
