/* =========================================================
   SANA BOUTIQUE — SHOP CONTROLLER
   FULL FIXED VERSION
   ========================================================= */
"use strict";

/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */
let shopProducts = [];
let activeCategory = "all";
let searchTerm = "";
let navigationLock = false;

/* ---------------------------------------------------------
   STORAGE KEYS
--------------------------------------------------------- */
const PRODUCT_CACHE_PREFIX = "sana_product_";
const LAST_PRODUCT_KEY = "sana_last_product_id";

/* ---------------------------------------------------------
   START
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", initializeShop);

async function initializeShop() {
    setupSearch();
    setupSearchButton();
    setupCategoryFilters();
    setupFilterButton();
    readCategoryFromURL();
    await loadShopProducts();
}

/* ---------------------------------------------------------
   LOAD PRODUCTS
--------------------------------------------------------- */
async function loadShopProducts() {
    const container = document.getElementById("shopProducts");
    if (!container) return;

    setShopLoading(container);

    try {
        if (typeof window.getProducts !== "function") {
            throw new Error("API connection is not loaded.");
        }

        const result = await window.getProducts();

        shopProducts = normalizeProducts(result);

        if (typeof window.AppState !== "undefined") {
            window.AppState.products = shopProducts;
        }

        renderShopProducts();
    } catch (error) {
        console.error("Shop loading error:", error);
        showShopError(container);
    }
}

/* ---------------------------------------------------------
   NORMALIZE PRODUCT LIST
--------------------------------------------------------- */
function normalizeProducts(products) {
    if (!Array.isArray(products)) return [];

    return products.map((product, index) => {
        const item = product && typeof product === "object"
            ? { ...product }
            : {};

        item.__shopIndex = index;

        const id = getProductId(item);

        if (id !== null) {
            item.__shopProductId = String(id);
        }

        return item;
    });
}

/* ---------------------------------------------------------
   PRODUCT ID
--------------------------------------------------------- */
function getProductId(product) {
    if (!product) return null;

    const candidates = [
        product.id,
        product.product_id,
        product.post_id,
        product._id,
        product.uuid,
        product.pk
    ];

    for (const value of candidates) {
        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            return value;
        }
    }

    return null;
}

/* ---------------------------------------------------------
   PRODUCT FIELDS
--------------------------------------------------------- */
function getProductName(product) {
    return product?.name ??
        product?.title ??
        product?.product_name ??
        "SANA Boutique Item";
}

function getProductDescription(product) {
    return product?.description ??
        product?.details ??
        "";
}

function getProductPrice(product) {
    return product?.price ??
        product?.amount ??
        product?.selling_price ??
        "";
}

function getProductCategory(product) {
    return product?.category ??
        product?.categories ??
        product?.type ??
        "";
}

function getProductImage(product) {
    return product?.image_url ??
        product?.imageUrl ??
        product?.image ??
        product?.photo ??
        product?.image_path ??
        "";
}

/* ---------------------------------------------------------
   FILTER
--------------------------------------------------------- */
function filterProducts(products) {
    const search = searchTerm.trim().toLowerCase();
    const category = activeCategory.trim().toLowerCase();

    return products.filter(product => {
        const name = String(getProductName(product)).toLowerCase();
        const description =
            String(getProductDescription(product)).toLowerCase();
        const productCategory =
            String(getProductCategory(product)).toLowerCase();

        const matchesSearch =
            !search ||
            name.includes(search) ||
            description.includes(search) ||
            productCategory.includes(search);

        const matchesCategory =
            category === "all" ||
            productCategory.includes(category);

        return matchesSearch && matchesCategory;
    });
}

/* ---------------------------------------------------------
   RENDER
--------------------------------------------------------- */
function renderShopProducts() {
    const container = document.getElementById("shopProducts");
    if (!container) return;

    const filtered = filterProducts(shopProducts);

    container.innerHTML = "";

    if (!filtered.length) {
        showNoProducts(container);
        updateResultsTitle(0);
        return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach((product, index) => {
        fragment.appendChild(
            createShopProductCard(product, index)
        );
    });

    container.appendChild(fragment);
    updateResultsTitle(filtered.length);
}

/* ---------------------------------------------------------
   CARD
--------------------------------------------------------- */
function createShopProductCard(product, visibleIndex) {
    const card = document.createElement("article");

    card.className = "product-card";
    card.dataset.shopCard = "true";
    card.dataset.visibleIndex = String(visibleIndex);

    const id = getProductId(product);
    const name = getProductName(product);
    const price = getProductPrice(product);
    const image = getProductImage(product);
    const category = getProductCategory(product);

    /*
     * CRITICAL FIX:
     * Store THIS product's ID on THIS card.
     * Never use a global "current product" for shop clicks.
     */
    card.dataset.productId =
        id === null ? "" : String(id);

    card.innerHTML = `
        ${
            category
                ? `<span class="product-badge">
                    ${escapeHTML(category)}
                   </span>`
                : ""
        }

        <button
            type="button"
            class="product-favorite"
            data-favorite-id="${escapeHTML(id ?? "")}"
            aria-label="Favorite ${escapeHTML(name)}"
        >♡</button>

        <div
            class="product-image-wrapper"
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
                            style="display:none"
                        ></div>
                    `
                    : `
                        <div
                            class="product-card-image image-placeholder"
                        ></div>
                    `
            }

            <div class="product-view-overlay">
                <span>VIEW PRODUCT</span>
            </div>
        </div>

        <div class="product-info">
            <h3>${escapeHTML(name)}</h3>
            <div class="product-price">
                ${formatShopPrice(price)}
            </div>
        </div>
    `;

    setupImageError(card);
    setupCardClick(card, product);
    setupFavorite(card, product);

    return card;
}

/* ---------------------------------------------------------
   CARD CLICK
--------------------------------------------------------- */
function setupCardClick(card, product) {
    const imageWrapper =
        card.querySelector(".product-image-wrapper");

    /*
     * Closure keeps the exact product object belonging to the card.
     * This prevents the common bug where every click uses the first
     * product stored in a shared variable.
     */
    const openThisProduct = event => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (navigationLock) return;

        const id = getProductId(product);

        playTapAnimation(card);

        if (id === null) {
            showToast("This product has no valid ID.");
            return;
        }

        cacheProduct(product, id);

        navigationLock = true;

        window.setTimeout(() => {
            window.location.href =
                "product.html?id=" +
                encodeURIComponent(String(id));
        }, 90);
    };

    card.addEventListener("click", event => {
        if (
            event.target.closest(".product-favorite")
        ) {
            return;
        }

        openThisProduct(event);
    });

    if (imageWrapper) {
        imageWrapper.addEventListener(
            "click",
            openThisProduct
        );

        imageWrapper.addEventListener(
            "keydown",
            event => {
                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    openThisProduct(event);
                }
            }
        );
    }
}

/* ---------------------------------------------------------
   CACHE EXACT PRODUCT
--------------------------------------------------------- */
function cacheProduct(product, id) {
    try {
        const key =
            PRODUCT_CACHE_PREFIX +
            encodeURIComponent(String(id));

        sessionStorage.setItem(
            key,
            JSON.stringify(product)
        );

        sessionStorage.setItem(
            LAST_PRODUCT_KEY,
            String(id)
        );
    } catch (error) {
        console.warn(
            "Product cache failed:",
            error
        );
    }
}

/* ---------------------------------------------------------
   PUBLIC CACHE READER
--------------------------------------------------------- */
function getCachedProduct(id) {
    try {
        const key =
            PRODUCT_CACHE_PREFIX +
            encodeURIComponent(String(id));

        const raw =
            sessionStorage.getItem(key);

        if (!raw) return null;

        const product = JSON.parse(raw);

        return product &&
            typeof product === "object"
            ? product
            : null;
    } catch {
        return null;
    }
}

/* ---------------------------------------------------------
   IMAGE ERROR
--------------------------------------------------------- */
function setupImageError(card) {
    const image =
        card.querySelector("img.product-card-image");

    if (!image) return;

    image.addEventListener("error", () => {
        image.style.display = "none";

        const placeholder =
            card.querySelector(".image-placeholder");

        if (placeholder) {
            placeholder.style.display = "flex";
        }
    });
}

/* ---------------------------------------------------------
   TAP EFFECT
--------------------------------------------------------- */
function playTapAnimation(card) {
    card.classList.remove("tap-animation");
    void card.offsetWidth;
    card.classList.add("tap-animation");

    window.setTimeout(() => {
        card.classList.remove("tap-animation");
    }, 600);
}

/* ---------------------------------------------------------
   FAVORITES
--------------------------------------------------------- */
function setupFavorite(card, product) {
    const button =
        card.querySelector(".product-favorite");

    if (!button) return;

    const id = getProductId(product);

    updateFavoriteButton(button, id);

    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        if (id === null) return;

        if (typeof window.toggleFavorite === "function") {
            window.toggleFavorite(id);
        }

        updateFavoriteButton(button, id);
    });
}

function updateFavoriteButton(button, id) {
    if (!button || id === null) return;

    let active = false;

    if (typeof window.isFavorite === "function") {
        try {
            active = Boolean(
                window.isFavorite(id)
            );
        } catch {
            active = false;
        }
    }

    button.classList.toggle("active", active);
    button.textContent = active ? "♥" : "♡";
}

/* ---------------------------------------------------------
   SEARCH
--------------------------------------------------------- */
function setupSearch() {
    const input =
        document.getElementById("productSearch");

    const clear =
        document.getElementById("clearSearch");

    if (!input) return;

    input.addEventListener("input", () => {
        searchTerm =
            input.value.trim().toLowerCase();

        updateClearButton(clear);
        renderShopProducts();
    });

    if (clear) {
        clear.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            input.value = "";
            searchTerm = "";

            updateClearButton(clear);
            renderShopProducts();
            input.focus();
        });
    }
}

function updateClearButton(button) {
    if (!button) return;

    button.classList.toggle(
        "show",
        searchTerm.length > 0
    );
}

/* ---------------------------------------------------------
   SEARCH BUTTON
--------------------------------------------------------- */
function setupSearchButton() {
    const button =
        document.getElementById("shopSearchButton");

    const search =
        document.getElementById("shopSearch");

    const input =
        document.getElementById("productSearch");

    if (!button || !search) return;

    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        search.classList.toggle("visible");

        if (
            search.classList.contains("visible") &&
            input
        ) {
            window.setTimeout(
                () => input.focus(),
                100
            );
        }
    });
}

/* ---------------------------------------------------------
   CATEGORIES
--------------------------------------------------------- */
function setupCategoryFilters() {
    const buttons =
        document.querySelectorAll(
            ".category-filter"
        );

    buttons.forEach(button => {
        button.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                activeCategory =
                    String(
                        button.dataset.category ||
                        "all"
                    )
                        .trim()
                        .toLowerCase();

                buttons.forEach(item => {
                    item.classList.remove(
                        "active"
                    );

                    item.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                });

                button.classList.add("active");

                button.setAttribute(
                    "aria-pressed",
                    "true"
                );

                updateCategoryTitle();
                renderShopProducts();
            }
        );
    });
}

/* ---------------------------------------------------------
   URL CATEGORY
--------------------------------------------------------- */
function readCategoryFromURL() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        params.get("category");

    if (!category) {
        updateCategoryTitle();
        return;
    }

    const normalized =
        category
            .toLowerCase()
            .replace(/\s+/g, "");

    const allowed = [
        "all",
        "unstitched",
        "kurtis",
        "abayas",
        "shawls",
        "other"
    ];

    activeCategory =
        allowed.includes(normalized)
            ? normalized
            : "all";

    document
        .querySelectorAll(".category-filter")
        .forEach(button => {
            const value =
                String(
                    button.dataset.category ||
                    ""
                )
                    .toLowerCase()
                    .replace(/\s+/g, "");

            const active =
                value === activeCategory;

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                String(active)
            );
        });

    updateCategoryTitle();
}

/* ---------------------------------------------------------
   TITLES
--------------------------------------------------------- */
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

function updateResultsTitle(count) {
    const title =
        document.getElementById(
            "resultsTitle"
        );

    if (!title) return;

    const name =
        activeCategory === "all"
            ? "All Products"
            : capitalizeWords(
                activeCategory
            );

    title.textContent =
        `${name} (${count})`;
}

/* ---------------------------------------------------------
   FILTER BUTTON
--------------------------------------------------------- */
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

/* ---------------------------------------------------------
   LOADING
--------------------------------------------------------- */
function setShopLoading(container) {
    container.innerHTML = `
        <div class="loading">
            Loading collection...
        </div>
    `;
}

/* ---------------------------------------------------------
   EMPTY
--------------------------------------------------------- */
function showNoProducts(container) {
    container.innerHTML = `
        <div class="no-products">
            <div class="no-products-icon">♢</div>
            <h3>No Products Found</h3>
            <p>
                Try another search or category.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   ERROR
--------------------------------------------------------- */
function showShopError(container) {
    container.innerHTML = `
        <div class="no-products">
            <div class="no-products-icon">!</div>
            <h3>Couldn't Load Collection</h3>
            <p>
                Please check your connection
                and try again.
            </p>
            <button
                type="button"
                class="gold-button"
                id="retryShop"
                style="margin-top:18px"
            >
                TRY AGAIN
            </button>
        </div>
    `;

    const retry =
        document.getElementById("retryShop");

    if (retry) {
        retry.addEventListener(
            "click",
            () => loadShopProducts()
        );
    }
}

/* ---------------------------------------------------------
   PRICE
--------------------------------------------------------- */
function formatShopPrice(price) {
    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {
        return "Price unavailable";
    }

    const raw =
        String(price)
            .replace(/[^0-9.]/g, "");

    const numeric = Number(raw);

    if (Number.isNaN(numeric)) {
        return escapeHTML(String(price));
    }

    return `Rs. ${numeric.toLocaleString()}`;
}

/* ---------------------------------------------------------
   TEXT
--------------------------------------------------------- */
function capitalizeWords(value) {
    return String(value)
        .replace(/[-_]/g, " ")
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );
}

/* ---------------------------------------------------------
   ESCAPE
--------------------------------------------------------- */
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ---------------------------------------------------------
   REFRESH
--------------------------------------------------------- */
async function refreshShop() {
    await loadShopProducts();
}

/* ---------------------------------------------------------
   RESET FILTERS
--------------------------------------------------------- */
function resetShopFilters() {
    activeCategory = "all";
    searchTerm = "";

    const input =
        document.getElementById(
            "productSearch"
        );

    if (input) input.value = "";

    document
        .querySelectorAll(".category-filter")
        .forEach(button => {
            const active =
                String(
                    button.dataset.category ||
                    ""
                ).toLowerCase() === "all";

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                String(active)
            );
        });

    updateClearButton(
        document.getElementById(
            "clearSearch"
        )
    );

    updateCategoryTitle();
    renderShopProducts();
}

/* ---------------------------------------------------------
   FIND PRODUCT
--------------------------------------------------------- */
function findShopProduct(id) {
    if (id === null || id === undefined) {
        return null;
    }

    return shopProducts.find(product => {
        const productId =
            getProductId(product);

        return (
            productId !== null &&
            String(productId) === String(id)
        );
    }) || null;
}

/* ---------------------------------------------------------
   DEBUG
--------------------------------------------------------- */
function debugShopProducts() {
    console.table(
        shopProducts.map(product => ({
            id: getProductId(product),
            name: getProductName(product),
            category: getProductCategory(product),
            image: getProductImage(product)
        }))
    );

    return shopProducts;
}

/* ---------------------------------------------------------
   PRODUCT URL
--------------------------------------------------------- */
function buildProductURL(id) {
    if (
        id === null ||
        id === undefined ||
        String(id).trim() === ""
    ) {
        return null;
    }

    return (
        "product.html?id=" +
        encodeURIComponent(String(id))
    );
}

/* ---------------------------------------------------------
   EXPORT
--------------------------------------------------------- */
window.loadShopProducts =
    loadShopProducts;

window.renderShopProducts =
    renderShopProducts;

window.getCachedProduct =
    getCachedProduct;

window.debugShopProducts =
    debugShopProducts;

window.buildProductURL =
    buildProductURL;

/* =========================================================
   EXTRA DIAGNOSTIC HELPERS
   These are useful while testing different backend responses.
   ========================================================= */

function productHasId(product) {
    return getProductId(product) !== null;
}

function productHasImage(product) {
    return String(
        getProductImage(product)
    ).trim() !== "";
}

function productMatchesSearch(product, term) {
    const value =
        String(term ?? "")
            .trim()
            .toLowerCase();

    if (!value) return true;

    return (
        String(getProductName(product))
            .toLowerCase()
            .includes(value) ||
        String(getProductDescription(product))
            .toLowerCase()
            .includes(value) ||
        String(getProductCategory(product))
            .toLowerCase()
            .includes(value)
    );
}

function getVisibleProducts() {
    return filterProducts(shopProducts);
}

function getShopProductCount() {
    return shopProducts.length;
}

function getVisibleProductCount() {
    return filterProducts(shopProducts).length;
}

function clearProductCache(id) {
    try {
        const key =
            PRODUCT_CACHE_PREFIX +
            encodeURIComponent(String(id));

        sessionStorage.removeItem(key);
    } catch {
        /* Storage can be disabled by browser. */
    }
}

function clearAllProductCache() {
    try {
        const keys = [];

        for (
            let index = 0;
            index < sessionStorage.length;
            index++
        ) {
            const key =
                sessionStorage.key(index);

            if (
                key &&
                key.startsWith(
                    PRODUCT_CACHE_PREFIX
                )
            ) {
                keys.push(key);
            }
        }

        keys.forEach(key =>
            sessionStorage.removeItem(key)
        );
    } catch {
        /* Nothing to do. */
    }
}

/* ---------------------------------------------------------
   EXTRA BACKEND FIELD NORMALIZERS
--------------------------------------------------------- */
function getProductTitle(product) {
    return getProductName(product);
}

function getProductAmount(product) {
    return getProductPrice(product);
}

function getProductPhoto(product) {
    return getProductImage(product);
}

function getProductType(product) {
    return getProductCategory(product);
}

function getProductStock(product) {
    return product?.stock ??
        product?.quantity ??
        product?.inventory ??
        "";
}

function getProductColor(product) {
    return product?.color ??
        product?.colour ??
        "";
}

function getProductSizes(product) {
    const sizes =
        product?.sizes ??
        product?.available_sizes ??
        product?.size ??
        "";

    if (Array.isArray(sizes)) {
        return sizes
            .map(size => String(size).trim())
            .filter(Boolean);
    }

    if (typeof sizes === "string") {
        return sizes
            .split(",")
            .map(size => size.trim())
            .filter(Boolean);
    }

    return [];
}

/* ---------------------------------------------------------
   PRELOAD IMAGES
--------------------------------------------------------- */
function preloadProductImage(product) {
    const source =
        getProductImage(product);

    if (!source) return;

    const image = new Image();
    image.decoding = "async";
    image.src = source;
}

function preloadFirstProducts(limit = 6) {
    filterProducts(shopProducts)
        .slice(0, limit)
        .forEach(preloadProductImage);
}

/* ---------------------------------------------------------
   SAFE STORAGE
--------------------------------------------------------- */
function safeSessionGet(key) {
    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSessionSet(key, value) {
    try {
        sessionStorage.setItem(
            key,
            value
        );
        return true;
    } catch {
        return false;
    }
}

function safeSessionRemove(key) {
    try {
        sessionStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

/* ---------------------------------------------------------
   SHOP STATE
--------------------------------------------------------- */
function getShopState() {
    return {
        activeCategory,
        searchTerm,
        totalProducts: shopProducts.length,
        visibleProducts:
            filterProducts(shopProducts).length
    };
}

/* ---------------------------------------------------------
   FINAL EXPORTS
--------------------------------------------------------- */
window.refreshShop =
    refreshShop;

window.resetShopFilters =
    resetShopFilters;

window.findShopProduct =
    findShopProduct;

window.getShopState =
    getShopState;

window.productHasId =
    productHasId;

window.productHasImage =
    productHasImage;

window.clearProductCache =
    clearProductCache;

window.clearAllProductCache =
    clearAllProductCache;

/* =========================================================
   END OF SHOP.JS
   ========================================================= */
