/* =========================================================
   SANA BOUTIQUE — PRODUCT DETAILS CONTROLLER
   EXACT ID + CACHE FALLBACK + DELETE BUTTON
   ========================================================= */
"use strict";

let currentProduct = null;
let selectedSize = "";

/*
 * Frontend password gate only.
 * IMPORTANT: real security must also be enforced by Flask.
 */
const SANA_DELETE_PASSWORD = "5090";

document.addEventListener(
    "DOMContentLoaded",
    initializeProduct
);

async function initializeProduct() {
    const id = getProductId();

    if (!id) {
        showProductNotFound();
        return;
    }

    setupFavoriteButton();
    setupDeletePasswordModal();
    await loadProduct(id);
}

function getProductId() {
    return new URLSearchParams(
        window.location.search
    ).get("id");
}

async function loadProduct(productId) {
    const container =
        document.getElementById(
            "productDetails"
        );

    if (!container) return;

    setProductLoading(container);

    try {
        /*
         * FIRST: use the exact object saved by shop.js.
         * This fixes "Product Not Found" after clicking a card.
         */
        let product = getCachedProduct(productId);

        /*
         * SECOND: ask the API for the latest copy.
         * If the API cannot find it, the cached exact copy remains.
         */
        if (
            typeof window.getProductById ===
            "function"
        ) {
            try {
                const serverProduct =
                    await window.getProductById(
                        productId
                    );

                if (serverProduct) {
                    product = serverProduct;
                }
            } catch (error) {
                console.warn(
                    "Using cached product:",
                    error
                );
            }
        }

        if (!product) {
            showProductNotFound();
            return;
        }

        currentProduct = product;
        selectedSize = "";

        renderProduct(
            product,
            container
        );

        setupProductActions(product);
        setupDeleteButton(product);

    } catch (error) {
        console.error(
            "Product loading error:",
            error
        );

        showProductError(container);
    }
}

function getCachedProduct(productId) {
    try {
        const key =
            "sana_product_" +
            encodeURIComponent(
                String(productId)
            );

        const raw =
            sessionStorage.getItem(key);

        if (!raw) return null;

        const product =
            JSON.parse(raw);

        return product &&
            typeof product === "object"
            ? product
            : null;

    } catch {
        return null;
    }
}

function getProductObjectId(product) {
    const values = [
        product?.id,
        product?.product_id,
        product?.post_id,
        product?._id,
        product?.uuid,
        product?.pk
    ];

    for (const value of values) {
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

function renderProduct(product, container) {
    const name =
        product?.name ??
        product?.title ??
        "SANA Boutique Item";

    const description =
        product?.description ??
        "No description available.";

    const price =
        product?.price ??
        product?.amount ??
        "";

    const category =
        product?.category ??
        product?.categories ??
        "Collection";

    const color =
        product?.color ??
        product?.colour ??
        "Not specified";

    const stock =
        product?.stock ??
        product?.quantity ??
        "Available";

    const image =
        product?.image_url ??
        product?.imageUrl ??
        product?.image ??
        product?.photo ??
        "";

    const sizes =
        normalizeSizes(
            product?.sizes
        );

    container.innerHTML = `
        <div class="product-main-image">
            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                        >
                        <div
                            class="image-placeholder"
                            style="display:none"
                        ></div>
                    `
                    : `
                        <div class="image-placeholder"></div>
                    `
            }
        </div>

        <section class="product-information">
            <span class="product-category">
                ${escapeHTML(category)}
            </span>

            <h1>${escapeHTML(name)}</h1>

            <div class="product-detail-price">
                ${formatProductPrice(price)}
            </div>

            <div class="product-description">
                <h2>Description</h2>
                <p>${escapeHTML(description)}</p>
            </div>

            <div class="product-extra">
                <div class="detail-item">
                    <span class="detail-label">Color</span>
                    <span class="detail-value">
                        ${escapeHTML(color)}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Stock</span>
                    <span class="detail-value">
                        ${escapeHTML(stock)}
                    </span>
                </div>
            </div>

            ${
                sizes.length
                    ? `
                        <div class="product-sizes">
                            <h2>Available Sizes</h2>
                            <div class="product-size-list">
                                ${sizes.map(size => `
                                    <button
                                        type="button"
                                        class="product-size"
                                        data-size="${escapeHTML(size)}"
                                    >
                                        ${escapeHTML(size)}
                                    </button>
                                `).join("")}
                            </div>
                        </div>
                    `
                    : ""
            }

            <div class="product-actions">
                <button
                    type="button"
                    class="add-to-bag"
                    id="addToBag"
                >
                    ADD TO BAG
                </button>

                <button
                    type="button"
                    class="share-product"
                    id="shareProduct"
                >
                    ↗
                </button>
            </div>

            <div class="product-delete-section">
                <button
                    type="button"
                    class="delete-product-button"
                    id="deleteProductButton"
                >
                    <span
                        class="delete-icon"
                        aria-hidden="true"
                    >⌫</span>
                    <span>DELETE PRODUCT</span>
                </button>

                <p class="delete-product-note">
                    Deleting a product is permanent
                    and requires a password.
                </p>
            </div>
        </section>
    `;

    setupSizeSelection();
}

function setupDeleteButton(product) {
    const button =
        document.getElementById(
            "deleteProductButton"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            openDeletePasswordModal(product);
        }
    );
}


/* =========================================
   DELETE PASSWORD MODAL

   Replaces the old window.prompt() /
   window.confirm() flow with the modal
   markup + styling that already existed in
   product.css but was never connected to
   any JS.
========================================= */

let deleteModalProduct = null;

function getDeleteModalEls() {
    return {
        modal:
            document.getElementById(
                "deletePasswordModal"
            ),
        input:
            document.getElementById(
                "deletePasswordInput"
            ),
        toggle:
            document.getElementById(
                "toggleDeletePasswordVisibility"
            ),
        error:
            document.getElementById(
                "deletePasswordError"
            ),
        cancel:
            document.getElementById(
                "deletePasswordCancel"
            ),
        confirm:
            document.getElementById(
                "deletePasswordConfirm"
            )
    };
}

function openDeletePasswordModal(product) {
    const { modal, input, error } =
        getDeleteModalEls();

    if (!modal) return;

    deleteModalProduct = product;

    if (input) input.value = "";
    if (error) error.textContent = "";

    modal.classList.add("show");

    if (input) {
        window.setTimeout(
            () => input.focus(),
            50
        );
    }
}

function closeDeletePasswordModal() {
    const { modal, error } =
        getDeleteModalEls();

    if (!modal) return;

    modal.classList.remove("show");

    deleteModalProduct = null;

    if (error) error.textContent = "";
}

function setupDeletePasswordModal() {
    const {
        modal,
        input,
        toggle,
        cancel,
        confirm
    } = getDeleteModalEls();

    if (!modal) return;

    if (cancel) {
        cancel.addEventListener(
            "click",
            closeDeletePasswordModal
        );
    }

    modal.addEventListener(
        "click",
        event => {
            if (event.target === modal) {
                closeDeletePasswordModal();
            }
        }
    );

    if (toggle && input) {
        toggle.addEventListener(
            "click",
            () => {
                const isPassword =
                    input.type === "password";

                input.type =
                    isPassword ? "text" : "password";

                toggle.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );
            }
        );
    }

    if (input) {
        input.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    handleDeleteConfirm();
                }
            }
        );
    }

    if (confirm) {
        confirm.addEventListener(
            "click",
            handleDeleteConfirm
        );
    }

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Escape" &&
                modal.classList.contains("show")
            ) {
                closeDeletePasswordModal();
            }
        }
    );
}

async function handleDeleteConfirm() {
    const { input, error, confirm } =
        getDeleteModalEls();

    const product = deleteModalProduct;

    if (!product) return;

    const id =
        getProductObjectId(product);

    if (id === null) {
        if (error) {
            error.textContent =
                "Product ID is missing.";
        }
        return;
    }

    const password =
        input ? input.value : "";

    if (
        password !==
        SANA_DELETE_PASSWORD
    ) {
        if (error) {
            error.textContent =
                "Incorrect password.";
        }

        if (input) {
            input.focus();
            input.select();
        }

        return;
    }

    if (error) error.textContent = "";

    if (confirm) {
        confirm.disabled = true;
        confirm.classList.add("loading");
    }

    try {
        if (
            typeof window.deleteProduct !==
            "function"
        ) {
            throw new Error(
                "Delete API is not loaded."
            );
        }

        await window.deleteProduct(id);

        removeCachedProduct(id);

        closeDeletePasswordModal();

        showProductToast(
            "Product deleted successfully."
        );

        window.setTimeout(
            () => {
                window.location.href =
                    "shop.html";
            },
            650
        );

    } catch (err) {
        console.error(
            "Delete error:",
            err
        );

        if (error) {
            error.textContent =
                err?.message ||
                "Unable to delete product.";
        }

        if (confirm) {
            confirm.disabled = false;
            confirm.classList.remove(
                "loading"
            );
        }
    }
}

function removeCachedProduct(id) {
    try {
        sessionStorage.removeItem(
            "sana_product_" +
            encodeURIComponent(
                String(id)
            )
        );

        sessionStorage.removeItem(
            "sana_last_product_id"
        );
    } catch {
        /* Storage unavailable. */
    }
}

function setupSizeSelection() {
    document
        .querySelectorAll(".product-size")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    document
                        .querySelectorAll(
                            ".product-size"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "selected"
                            )
                        );

                    button.classList.add(
                        "selected"
                    );

                    selectedSize =
                        button.dataset.size ||
                        "";
                }
            );
        });
}

function setupProductActions(product) {
    const addButton =
        document.getElementById(
            "addToBag"
        );

    if (addButton) {
        addButton.addEventListener(
            "click",
            () => {
                const sizes =
                    normalizeSizes(
                        product?.sizes
                    );

                if (
                    sizes.length &&
                    !selectedSize
                ) {
                    showProductToast(
                        "Please select a size."
                    );
                    return;
                }

                const item = {
                    ...product,
                    selectedSize:
                        selectedSize || null
                };

                if (
                    typeof window.addToCart ===
                    "function"
                ) {
                    window.addToCart(item);
                    showProductToast(
                        "Added to bag"
                    );
                } else {
                    showProductToast(
                        "Shopping bag is unavailable."
                    );
                }
            }
        );
    }

    const share =
        document.getElementById(
            "shareProduct"
        );

    if (share) {
        share.addEventListener(
            "click",
            shareProduct
        );
    }
}

function setupFavoriteButton() {
    const button =
        document.getElementById(
            "productFavorite"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        () => {
            if (!currentProduct) return;

            const id =
                getProductObjectId(
                    currentProduct
                );

            if (
                typeof window.toggleFavorite ===
                "function"
            ) {
                window.toggleFavorite(id);
            }

            updateFavorite(
                button,
                id
            );
        }
    );
}

function updateFavorite(button, id) {
    if (
        !button ||
        id === null ||
        typeof window.isFavorite !==
            "function"
    ) {
        return;
    }

    const active =
        Boolean(
            window.isFavorite(id)
        );

    button.classList.toggle(
        "active",
        active
    );

    button.textContent =
        active ? "♥" : "♡";
}

async function shareProduct() {
    if (!currentProduct) return;

    const name =
        currentProduct.name ??
        currentProduct.title ??
        "SANA Boutique Product";

    try {
        if (
            typeof navigator.share ===
            "function"
        ) {
            await navigator.share({
                title: name,
                text:
                    `Check out ${name} on SANA Boutique.`,
                url: window.location.href
            });

            return;
        }

        await navigator.clipboard.writeText(
            window.location.href
        );

        showProductToast(
            "Product link copied"
        );
    } catch {
        /* User cancelled share. */
    }
}

function normalizeSizes(sizes) {
    if (Array.isArray(sizes)) {
        return sizes
            .map(size => String(size).trim())
            .filter(Boolean);
    }

    if (
        typeof sizes === "string" &&
        sizes.trim()
    ) {
        return sizes
            .split(",")
            .map(size => size.trim())
            .filter(Boolean);
    }

    return [];
}

function formatProductPrice(price) {
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

    if (Number.isNaN(numeric)) {
        return escapeHTML(
            String(price)
        );
    }

    return `Rs. ${numeric.toLocaleString()}`;
}

function setProductLoading(container) {
    container.innerHTML = `
        <div class="loading">
            Loading product...
        </div>
    `;
}

function showProductNotFound() {
    const container =
        document.getElementById(
            "productDetails"
        );

    if (!container) return;

    container.innerHTML = `
        <div class="product-not-found">
            <div class="product-not-found-icon">
                ♢
            </div>

            <h2>Product Not Found</h2>

            <p>
                This product may have been
                removed or is no longer available.
            </p>

            <button
                type="button"
                class="gold-button"
                onclick="window.location.href='shop.html'"
            >
                BACK TO SHOP
            </button>
        </div>
    `;
}

function showProductError(container) {
    container.innerHTML = `
        <div class="product-not-found">
            <div class="product-not-found-icon">
                !
            </div>

            <h2>Couldn't Load Product</h2>

            <p>
                Please check your connection
                and try again.
            </p>

            <button
                type="button"
                class="gold-button"
                onclick="location.reload()"
            >
                TRY AGAIN
            </button>
        </div>
    `;
}

function showProductToast(message) {
    if (
        typeof window.showToast ===
        "function"
    ) {
        window.showToast(message);
    } else {
        window.alert(String(message));
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.loadProduct = loadProduct;
window.shareProduct = shareProduct;
window.getCachedProduct = getCachedProduct;
