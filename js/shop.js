/* =========================================
   SANA BOUTIQUE
   SHOP CONTROLLER
========================================= */

"use strict";


let shopProducts = [];
let activeCategory = "all";
let searchTerm = "";


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeShop
);


async function initializeShop() {

    setupSearch();

    setupCategoryFilters();

    setupFilterButton();

    readCategoryFromURL();

    await loadShopProducts();

}


/* =========================================
   LOAD PRODUCTS FROM BACKEND
========================================= */

async function loadShopProducts() {

    const container =
        document.getElementById(
            "shopProducts"
        );


    if (!container) return;


    try {

        setShopLoading(container);


        if (
            typeof getProducts !==
            "function"
        ) {

            throw new Error(
                "API connection is not available."
            );

        }


        const products =
            await getProducts();


        shopProducts =
            Array.isArray(products)
                ? products
                : [];


        /*
         * Save globally only if AppState exists.
         */

        if (
            typeof AppState !==
            "undefined"
        ) {

            AppState.products =
                shopProducts;

        }


        renderShopProducts();


    } catch (error) {

        console.error(
            "Shop products error:",
            error
        );


        showShopError(
            container
        );

    }

}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderShopProducts() {

    const container =
        document.getElementById(
            "shopProducts"
        );


    if (!container) return;


    const filtered =
        filterProducts(
            shopProducts
        );


    container.innerHTML = "";


    if (!filtered.length) {

        showNoProducts(
            container
        );


        updateResultsTitle(0);

        return;

    }


    filtered.forEach(
        product => {

            const card =
                createShopProductCard(
                    product
                );


            container.appendChild(
                card
            );

        }
    );


    updateResultsTitle(
        filtered.length
    );

}


/* =========================================
   FILTER PRODUCTS
========================================= */

function filterProducts(
    products
) {

    return products.filter(
        product => {

            const name =
                String(
                    product?.name ??
                    product?.title ??
                    ""
                )
                .toLowerCase();


            const description =
                String(
                    product?.description ??
                    ""
                )
                .toLowerCase();


            const category =
                normalizeCategory(
                    product?.category ??
                    ""
                );


            const matchesSearch =
                !searchTerm ||
                name.includes(
                    searchTerm
                ) ||
                description.includes(
                    searchTerm
                ) ||
                category.includes(
                    searchTerm
                );


            const matchesCategory =
                activeCategory === "all" ||
                category ===
                normalizeCategory(
                    activeCategory
                );


            return (
                matchesSearch &&
                matchesCategory
            );

        }
    );

}


/* =========================================
   PRODUCT CARD
========================================= */

function createShopProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    const id =
        product?.id ??
        product?._id ??
        product?.product_id;


    const name =
        product?.title ??
        product?.name ??
        "SANA Boutique Item";


    const price =
        product?.price ??
        "";


    const image =
        product?.image_url ??
        product?.image ??
        product?.photo ??
        "";


    const category =
        product?.category ??
        "";


    card.innerHTML = `

        ${
            category
                ? `
                    <span
                        class="product-badge"
                    >
                        ${escapeHTML(category)}
                    </span>
                  `
                : ""
        }


        <button
            type="button"
            class="product-favorite"
            data-favorite="${escapeHTML(id ?? "")}"
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
                        class="
                            product-card-image
                            image-placeholder
                        "
                    >
                        <span>
                            SANA
                        </span>
                    </div>
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


    /* =====================================
       OPEN PRODUCT
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


            if (!id) {

                console.warn(
                    "Product has no ID:",
                    product
                );

                return;

            }


            openProduct(
                id
            );

        }
    );


    /* =====================================
       FAVORITE
    ===================================== */

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


                if (
                    typeof toggleFavorite ===
                    "function"
                ) {

                    toggleFavorite(
                        id
                    );

                }


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
   OPEN PRODUCT PAGE
========================================= */

function openProduct(
    productId
) {

    if (!productId) return;


    window.location.href =
        `product.html?id=${encodeURIComponent(productId)}`;

}


/* =========================================
   FAVORITE STATE
========================================= */

function updateShopFavorite(
    button,
    productId
) {

    if (
        !button ||
        !productId
    ) {

        return;

    }


    if (
        typeof isFavorite !==
        "function"
    ) {

        return;

    }


    const active =
        isFavorite(
            productId
        );


    button.classList.toggle(
        "active",
        active
    );


    button.textContent =
        active
            ? "♥"
            : "♡";

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
   CLEAR SEARCH
========================================= */

function updateClearButton(
    button
) {

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


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    activeCategory =
                        normalizeCategory(
                            button.dataset.category ||
                            "all"
                        );


                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    updateCategoryTitle();

                    renderShopProducts();

                }
            );

        }
    );

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
        params.get(
            "category"
        );


    if (!category) return;


    const normalized =
        normalizeCategory(
            category
        );


    activeCategory =
        normalized;


    const buttons =
        document.querySelectorAll(
            ".category-filter"
        );


    buttons.forEach(
        button => {

            const buttonCategory =
                normalizeCategory(
                    button.dataset.category ||
                    ""
                );


            button.classList.toggle(
                "active",
                buttonCategory ===
                normalized
            );

        }
    );


    updateCategoryTitle();

}


/* =========================================
   NORMALIZE CATEGORY
========================================= */

function normalizeCategory(
    value
) {

    return String(
        value ?? ""
    )
    .toLowerCase()
    .trim()
    .replace(
        /[\s_-]+/g,
        ""
    );

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


    if (
        activeCategory ===
        "all"
    ) {

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

function updateResultsTitle(
    count
) {

    const title =
        document.getElementById(
            "resultsTitle"
        );


    if (!title) return;


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

function setShopLoading(
    container
) {

    container.innerHTML = `

        <div class="loading">

            Loading collection...

        </div>

    `;

}


/* =========================================
   NO PRODUCTS
========================================= */

function showNoProducts(
    container
) {

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

function showShopError(
    container
) {

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
                type="button"
                class="gold-button"
                id="retryShop"
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

function formatShopPrice(
    price
) {

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
                .replace(
                    /[^0-9.]/g,
                    ""
                )
        );


    if (
        Number.isNaN(
            numeric
        )
    ) {

        return escapeHTML(
            price
        );

    }


    return `Rs. ${numeric.toLocaleString()}`;

}


/* =========================================
   CAPITALIZE
========================================= */

function capitalizeWords(
    value
) {

    return String(value)
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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
   EXPOSE
========================================= */

window.loadShopProducts =
    loadShopProducts;


window.renderShopProducts =
    renderShopProducts;


window.openProduct =
    openProduct;
