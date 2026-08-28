/* =========================================
   SANA BOUTIQUE
   SHOP CONTROLLER
   PREMIUM PRODUCT TAP SYSTEM
========================================= */

"use strict";


let shopProducts = [];

let activeCategory = "all";

let searchTerm = "";

let tapTimer = null;


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeShop
);


async function initializeShop() {

    setupSearch();

    setupSearchButton();

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
        document.getElementById(
            "shopProducts"
        );


    if (!container) return;


    try {

        setShopLoading(
            container
        );


        if (
            typeof getProducts !==
            "function"
        ) {

            throw new Error(
                "API connection is not loaded."
            );

        }


        const products =
            await getProducts();


        shopProducts =
            Array.isArray(products)
                ? products
                : [];


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

        updateResultsTitle(
            0
        );

        return;

    }


    filtered.forEach(
        (product, index) => {

            const card =
                createShopProductCard(
                    product,
                    index
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
                ).toLowerCase();


            const description =
                String(
                    product?.description ??
                    ""
                ).toLowerCase();


            const category =
                String(
                    product?.category ??
                    product?.categories ??
                    ""
                ).toLowerCase();


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
                category.includes(
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
   CREATE PRODUCT CARD
========================================= */

function createShopProductCard(
    product,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    /* =====================================
       PRODUCT DATA
    ===================================== */

    const id =
        product?.id ??
        product?._id ??
        product?.product_id ??
        product?.post_id;


    const name =
        product?.name ??
        product?.title ??
        "SANA Boutique Item";


    const price =
        product?.price ??
        product?.amount ??
        "";


    const image =
        product?.image_url ??
        product?.image ??
        product?.photo ??
        "";


    const category =
        product?.category ??
        product?.categories ??
        "";


    /* =====================================
       IMPORTANT PRODUCT ID
    ===================================== */

    if (
        id !== undefined &&
        id !== null &&
        id !== ""
    ) {

        card.dataset.productId =
            String(id);

    }


    /*
     * Store the position too.
     *
     * This helps us debug cards if the
     * backend accidentally returns duplicate
     * IDs.
     */

    card.dataset.productIndex =
        String(index);


    /* =====================================
       CARD HTML
    ===================================== */

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
            aria-label="Favorite ${escapeHTML(name)}"
        >
            ♡
        </button>


        <div
            class="product-image-wrapper"
            data-product-image="true"
            role="button"
            tabindex="0"
            aria-label="View ${escapeHTML(name)}"
        >

            ${
                image
                    ? `
                        <img
                            class="product-card-image"
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            loading="lazy"
                            draggable="false"
                        >

                        <div
                            class="product-card-image image-placeholder"
                            style="display:none;"
                        ></div>
                    `
                    : `
                        <div
                            class="product-card-image image-placeholder"
                        ></div>
                    `
            }


            <div
                class="product-view-overlay"
            >

                <span>
                    VIEW PRODUCT
                </span>

            </div>

        </div>


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
       IMAGE ERROR
    ===================================== */

    const productImage =
        card.querySelector(
            "img.product-card-image"
        );


    if (productImage) {

        productImage.addEventListener(
            "error",
            () => {

                productImage.style.display =
                    "none";


                const placeholder =
                    card.querySelector(
                        ".image-placeholder"
                    );


                if (placeholder) {

                    placeholder.style.display =
                        "flex";

                }

            }
        );

    }


    /* =====================================
       GET PRODUCT ID
    ===================================== */

    function getCardProductId() {

        return (
            product?.id ??
            product?._id ??
            product?.product_id ??
            product?.post_id ??
            null
        );

    }


    /* =====================================
       TAP ANIMATION
    ===================================== */

    function playTapAnimation() {

        /*
         * Remove previous animation first.
         */

        card.classList.remove(
            "tap-animation"
        );


        /*
         * Force browser reflow so the
         * animation can restart every tap.
         */

        void card.offsetWidth;


        card.classList.add(
            "tap-animation"
        );


        clearTimeout(
            tapTimer
        );


        tapTimer =
            setTimeout(
                () => {

                    card.classList.remove(
                        "tap-animation"
                    );

                },
                600
            );

    }


    /* =====================================
       OPEN THIS EXACT PRODUCT
    ===================================== */

    function handleProductOpen() {

        const productId =
            getCardProductId();


        console.log(
            "Opening product:",
            {
                index,
                id: productId,
                product
            }
        );


        if (
            productId === null ||
            productId === undefined ||
            productId === ""
        ) {

            console.error(
                "Product has no ID:",
                product
            );


            showToast(
                "Product unavailable"
            );


            return;

        }


        playTapAnimation();


        /*
         * Small delay allows the tap
         * animation to be visible.
         */

        setTimeout(
            () => {

                openProduct(
                    productId
                );

            },
            120
        );

    }


    /* =====================================
       CARD CLICK
    ===================================== */

    card.addEventListener(
        "click",
        event => {

            /*
             * Favorite button has its own
             * action.
             */

            if (
                event.target.closest(
                    ".product-favorite"
                )
            ) {

                return;

            }


            /*
             * Image wrapper has its own
             * handler.
             */

            if (
                event.target.closest(
                    ".product-image-wrapper"
                )
            ) {

                return;

            }


            handleProductOpen();

        }
    );


    /* =====================================
       IMAGE CLICK
    ===================================== */

    const imageWrapper =
        card.querySelector(
            ".product-image-wrapper"
        );


    if (imageWrapper) {

        imageWrapper.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                handleProductOpen();

            }
        );


        /* =================================
           KEYBOARD
        ================================= */

        imageWrapper.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();


                    handleProductOpen();

                }

            }
        );

    }


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

                event.preventDefault();

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
   OPEN PRODUCT
========================================= */

function openProduct(
    productId
) {

    if (
        productId === undefined ||
        productId === null ||
        productId === ""
    ) {

        showToast(
            "Product ID is missing"
        );

        return;

    }


    const encodedId =
        encodeURIComponent(
            String(productId)
        );


    /*
     * product.html is inside /pages/
     * together with shop.html.
     */

    const productPage =
        "./product.html?id=" +
        encodedId;


    console.log(
        "Product URL:",
        productPage
    );


    window.location.href =
        productPage;

}


/* =========================================
   FAVORITE
========================================= */

function updateShopFavorite(
    button,
    productId
) {

    if (
        !button ||
        productId === undefined ||
        productId === null ||
        productId === ""
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
            event => {

                event.preventDefault();

                event.stopPropagation();


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
   SEARCH BUTTON
========================================= */

function setupSearchButton() {

    const button =
        document.getElementById(
            "shopSearchButton"
        );


    const search =
        document.getElementById(
            "shopSearch"
        );


    const input =
        document.getElementById(
            "productSearch"
        );


    if (!button || !search) return;


    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            search.classList.toggle(
                "visible"
            );


            if (
                search.classList.contains(
                    "visible"
                ) &&
                input
            ) {

                setTimeout(
                    () => {

                        input.focus();

                    },
                    100
                );

            }

        }
    );

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
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    activeCategory =
                        (
                            button.dataset.category ||
                            "all"
                        )
                            .toLowerCase()
                            .replace(
                                /\s+/g,
                                ""
                            );


                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );


                            item.setAttribute(
                                "aria-pressed",
                                "false"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    button.setAttribute(
                        "aria-pressed",
                        "true"
                    );


                    updateCategoryTitle();


                    renderShopProducts();

                }
            );

        }
    );

}


/* =========================================
   READ CATEGORY FROM URL
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


    if (!category) {

        updateCategoryTitle();

        return;

    }


    const normalized =
        category
            .toLowerCase()
            .replace(
                /\s+/g,
                ""
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
                (
                    button.dataset.category ||
                    ""
                )
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        ""
                    );


            const active =
                buttonCategory ===
                normalized;


            button.classList.toggle(
                "active",
                active
            );


            button.setAttribute(
                "aria-pressed",
                active
                    ? "true"
                    : "false"
            );

        }
    );


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


    title.textContent =
        activeCategory === "all"
            ? "All Products"
            : capitalizeWords(
                activeCategory
            );

}


/* =========================================
   RESULTS TITLE
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
        event => {

            event.preventDefault();

            event.stopPropagation();


            showToast(
                "More filters coming soon."
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
                Couldn't Load Collection
            </h3>

            <p>
                Please check your connection
                and try again.
            </p>

            <button
                type="button"
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
            String(price)
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
