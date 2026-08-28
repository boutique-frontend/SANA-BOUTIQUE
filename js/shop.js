/* SANA BOUTIQUE - SHOP CONTROLLER - FIXED PRODUCT CLICK SYSTEM */
"use strict";

let shopProducts = [];
let activeCategory = "all";
let searchTerm = "";

document.addEventListener("DOMContentLoaded", initializeShop);

async function initializeShop() {
    setupSearch();
    setupSearchButton();
    setupCategoryFilters();
    setupFilterButton();
    readCategoryFromURL();
    await loadShopProducts();
}

async function loadShopProducts() {
    const container = document.getElementById("shopProducts");
    if (!container) return;
    try {
        setShopLoading(container);
        if (typeof getProducts !== "function") throw new Error("API connection is not loaded.");
        const products = await getProducts();
        shopProducts = Array.isArray(products) ? products : [];
        if (typeof AppState !== "undefined") AppState.products = shopProducts;
        renderShopProducts();
    } catch (error) {
        console.error("Shop products error:", error);
        showShopError(container);
    }
}

function getShopProductId(product) {
    if (!product) return null;
    const id = product.id ?? product._id ?? product.product_id ?? product.post_id;
    return id === undefined || id === null || String(id).trim() === "" ? null : String(id);
}

function filterProducts(products) {
    return products.filter(product => {
        const name = String(product?.name ?? product?.title ?? "").toLowerCase();
        const description = String(product?.description ?? "").toLowerCase();
        const category = String(product?.category ?? product?.categories ?? "").toLowerCase();
        return (
            (!searchTerm || name.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) &&
            (activeCategory === "all" || category.includes(activeCategory))
        );
    });
}

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
    filtered.forEach((product, index) => {
        container.appendChild(createShopProductCard(product, index));
    });
    updateResultsTitle(filtered.length);
}

function createShopProductCard(product, index) {
    const card = document.createElement("article");
    card.className = "product-card";

    const id = getShopProductId(product);
    const name = product?.name ?? product?.title ?? "SANA Boutique Item";
    const price = product?.price ?? product?.amount ?? "";
    const image = product?.image_url ?? product?.image ?? product?.photo ?? "";
    const category = product?.category ?? product?.categories ?? "";

    if (id !== null) card.dataset.productId = id;
    card.dataset.productIndex = String(index);

    card.innerHTML = `
        ${category ? `<span class="product-badge">${escapeHTML(category)}</span>` : ""}
        <button type="button" class="product-favorite" aria-label="Favorite ${escapeHTML(name)}">♡</button>
        <div class="product-image-wrapper" role="button" tabindex="0" aria-label="View ${escapeHTML(name)}">
            ${image
                ? `<img class="product-card-image" src="${escapeHTML(image)}" alt="${escapeHTML(name)}" loading="lazy">
                   <div class="product-card-image image-placeholder" style="display:none;"></div>`
                : `<div class="product-card-image image-placeholder"></div>`}
            <div class="product-view-overlay"><span>VIEW PRODUCT</span></div>
        </div>
        <div class="product-info">
            <h3>${escapeHTML(name)}</h3>
            <div class="product-price">${formatShopPrice(price)}</div>
        </div>
    `;

    const openThisProduct = () => {
        const cardId = card.dataset.productId;
        if (!cardId) {
            console.error("Product has no valid ID:", product);
            showToast("Product unavailable");
            return;
        }

        card.classList.remove("tap-animation");
        void card.offsetWidth;
        card.classList.add("tap-animation");

        setTimeout(() => openProduct(cardId), 180);
    };

    card.addEventListener("click", event => {
        if (event.target.closest(".product-favorite")) return;
        if (event.target.closest(".product-image-wrapper")) return;
        openThisProduct();
    });

    const imageWrapper = card.querySelector(".product-image-wrapper");
    imageWrapper.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openThisProduct();
    });

    imageWrapper.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            openThisProduct();
        }
    });

    const img = card.querySelector("img.product-card-image");
    if (img) {
        img.addEventListener("error", () => {
            img.style.display = "none";
            const placeholder = card.querySelector(".image-placeholder");
            if (placeholder) placeholder.style.display = "flex";
        });
    }

    const favorite = card.querySelector(".product-favorite");
    if (favorite) {
        updateShopFavorite(favorite, id);
        favorite.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            if (id === null) return;
            if (typeof toggleFavorite === "function") toggleFavorite(id);
            updateShopFavorite(favorite, id);
        });
    }

    return card;
}

function openProduct(productId) {
    if (productId === undefined || productId === null || productId === "") {
        showToast("Product ID is missing");
        return;
    }
    window.location.assign(`product.html?id=${encodeURIComponent(String(productId))}`);
}

function updateShopFavorite(button, productId) {
    if (!button || productId === null || productId === undefined) return;
    if (typeof isFavorite !== "function") return;
    const active = isFavorite(productId);
    button.classList.toggle("active", active);
    button.textContent = active ? "♥" : "♡";
}

function setupSearch() {
    const input = document.getElementById("productSearch");
    const clear = document.getElementById("clearSearch");
    if (!input) return;

    input.addEventListener("input", () => {
        searchTerm = input.value.trim().toLowerCase();
        updateClearButton(clear);
        renderShopProducts();
    });

    if (clear) {
        clear.addEventListener("click", () => {
            input.value = "";
            searchTerm = "";
            updateClearButton(clear);
            renderShopProducts();
            input.focus();
        });
    }
}

function setupSearchButton() {
    const button = document.getElementById("shopSearchButton");
    const search = document.getElementById("shopSearch");
    const input = document.getElementById("productSearch");
    if (!button || !search) return;

    button.addEventListener("click", () => {
        search.classList.toggle("visible");
        if (search.classList.contains("visible") && input) setTimeout(() => input.focus(), 100);
    });
}

function updateClearButton(button) {
    if (button) button.classList.toggle("show", searchTerm.length > 0);
}

function setupCategoryFilters() {
    document.querySelectorAll(".category-filter").forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = String(button.dataset.category || "all").toLowerCase();
            document.querySelectorAll(".category-filter").forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });
            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
            updateCategoryTitle();
            renderShopProducts();
        });
    });
}

function readCategoryFromURL() {
    const category = new URLSearchParams(window.location.search).get("category");
    if (!category) {
        updateCategoryTitle();
        return;
    }

    activeCategory = category.toLowerCase().replace(/\s+/g, "");
    document.querySelectorAll(".category-filter").forEach(button => {
        const value = String(button.dataset.category || "").toLowerCase().replace(/\s+/g, "");
        const active = value === activeCategory;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
    updateCategoryTitle();
}

function updateCategoryTitle() {
    const title = document.getElementById("resultsTitle");
    if (title) title.textContent = activeCategory === "all" ? "All Products" : capitalizeWords(activeCategory);
}

function updateResultsTitle(count) {
    const title = document.getElementById("resultsTitle");
    if (!title) return;
    const category = activeCategory === "all" ? "All Products" : capitalizeWords(activeCategory);
    title.textContent = `${category} (${count})`;
}

function setupFilterButton() {
    const button = document.getElementById("filterButton");
    if (button) button.addEventListener("click", () => showToast("More filters coming soon."));
}

function setShopLoading(container) {
    container.innerHTML = `<div class="loading">Loading collection...</div>`;
}

function showNoProducts(container) {
    container.innerHTML = `<div class="no-products"><div class="no-products-icon">♢</div><h3>No Products Found</h3><p>Try another search or category.</p></div>`;
}

function showShopError(container) {
    container.innerHTML = `
        <div class="no-products">
            <div class="no-products-icon">!</div>
            <h3>Couldn't Load Collection</h3>
            <p>Please check your connection and try again.</p>
            <button type="button" class="gold-button" id="retryShop" style="margin-top:18px;">TRY AGAIN</button>
        </div>`;
    const retry = document.getElementById("retryShop");
    if (retry) retry.addEventListener("click", loadShopProducts);
}

function formatShopPrice(price) {
    if (price === null || price === undefined || price === "") return "Price unavailable";
    const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
    return Number.isNaN(numeric) ? escapeHTML(String(price)) : `Rs. ${numeric.toLocaleString()}`;
}

function capitalizeWords(value) {
    return String(value).replace(/[-_]/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.loadShopProducts = loadShopProducts;
window.renderShopProducts = renderShopProducts;
window.openProduct = openProduct;
