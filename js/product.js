/* =========================================
   SANA BOUTIQUE
   PRODUCT DETAILS CONTROLLER
========================================= */

"use strict";


let currentProduct = null;

let selectedSize = "";


document.addEventListener(
    "DOMContentLoaded",
    initializeProduct
);


/* =========================================
   INITIALIZE
========================================= */

async function initializeProduct() {

    const productId =
        getProductId();


    if (!productId) {

        showProductNotFound();

        return;

    }


    setupFavoriteButton();


    await loadProduct(
        productId
    );

}


/* =========================================
   PRODUCT ID
========================================= */

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(
        "id"
    );

}


/* =========================================
   LOAD PRODUCT
========================================= */

async function loadProduct(
    productId
) {

    const container =
        document.getElementById(
            "productDetails"
        );


    if (!container) return;


    try {

        setProductLoading(
            container
        );


        if (
            typeof getProductById !==
            "function"
        ) {

            throw new Error(
                "API connection is not loaded."
            );

        }


        const product =
            await getProductById(
                productId
            );


        if (!product) {

            showProductNotFound();

            return;

        }


        currentProduct =
            product;


        selectedSize =
            "";


        if (
            typeof AppState !==
            "undefined"
        ) {

            AppState.selectedProduct =
                product;

        }


        renderProduct(
            product,
            container
        );


        setupProductActions(
            product
        );


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        showProductError(
            container
        );

    }

}


/* =========================================
   RENDER
========================================= */

function renderProduct(
    product,
    container
) {

    const id =
        product?.id ??
        product?._id ??
        product?.product_id ??
        product?.post_id;


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
        "Not specified";


    const stock =
        product?.stock ??
        product?.quantity ??
        "Available";


    const image =
        product?.image_url ??
        product?.image ??
        product?.photo ??
        "";


    const sizes =
        normalizeSizes(
            product?.sizes
        );


    container.innerHTML = `

        <!-- IMAGE -->

        <div class="product-main-image">

            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                        >

                        <div
                            class="image-placeholder"
                            style="display:none;"
                        ></div>
                    `
                    : `
                        <div
                            class="image-placeholder"
                        ></div>
                    `
            }

        </div>


        <!-- INFORMATION -->

        <section
            class="product-information"
        >


            <span
                class="product-category"
            >
                ${escapeHTML(category)}
            </span>


            <h1>
                ${escapeHTML(name)}
            </h1>


            <div
                class="product-detail-price"
            >
                ${formatProductPrice(price)}
            </div>


            <!-- DESCRIPTION -->

            <div
                class="product-description"
            >

                <h2>
                    Description
                </h2>

                <p>
                    ${escapeHTML(description)}
                </p>

            </div>


            <!-- DETAILS -->

            <div class="product-extra">

                <div class="detail-item">

                    <span class="detail-label">
                        Color
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(color)}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-label">
                        Stock
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(stock)}
                    </span>

                </div>

            </div>


            <!-- SIZES -->

            ${
                sizes.length
                    ? `

                        <div
                            class="product-sizes"
                        >

                            <h2>
                                Available Sizes
                            </h2>


                            <div
                                class="product-size-list"
                            >

                                ${sizes.map(
                                    size => `

                                        <button
                                            type="button"
                                            class="product-size"
                                            data-size="${escapeHTML(size)}"
                                        >
                                            ${escapeHTML(size)}
                                        </button>

                                    `
                                ).join("")}

                            </div>

                        </div>

                    `
                    : ""
            }


            <!-- ACTIONS -->

            <div
                class="product-actions"
            >

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
                    aria-label="Share product"
                >
                    ↗
                </button>

            </div>


        </section>

    `;


    setupSizeSelection();

}


/* =========================================
   SIZE SELECTION
========================================= */

function setupSizeSelection() {

    const buttons =
        document.querySelectorAll(
            ".product-size"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    selectedSize =
                        button.dataset.size ||
                        "";

                }
            );

        }
    );

}


/* =========================================
   PRODUCT ACTIONS
========================================= */

function setupProductActions(
    product
) {

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

                    showToast(
                        "Please select a size."
                    );

                    return;

                }


                const item = {

                    ...product,

                    selectedSize:
                        selectedSize ||
                        null

                };


                if (
                    typeof addToCart ===
                    "function"
                ) {

                    addToCart(
                        item
                    );


                    showToast(
                        "Added to bag"
                    );

                } else {

                    showToast(
                        "Shopping bag is unavailable."
                    );

                }

            }
        );

    }


    const shareButton =
        document.getElementById(
            "shareProduct"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            shareProduct
        );

    }


    setupHeaderFavorite(
        product
    );

}


/* =========================================
   FAVORITE
========================================= */

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
                currentProduct.id ??
                currentProduct._id ??
                currentProduct.product_id ??
                currentProduct.post_id;


            if (
                typeof toggleFavorite ===
                "function"
            ) {

                toggleFavorite(
                    id
                );

            }


            updateProductFavoriteButton(
                button,
                id
            );

        }
    );

}


/* =========================================
   HEADER FAVORITE
========================================= */

function setupHeaderFavorite(
    product
) {

    const button =
        document.getElementById(
            "productFavorite"
        );


    if (!button) return;


    const id =
        product?.id ??
        product?._id ??
        product?.product_id ??
        product?.post_id;


    updateProductFavoriteButton(
        button,
        id
    );

}


/* =========================================
   UPDATE FAVORITE
========================================= */

function updateProductFavoriteButton(
    button,
    productId
) {

    if (
        !button ||
        productId === undefined ||
        productId === null
    ) {

        return;

    }


    if (
        typeof isFavorite !==
        "function"
    ) {

        return;

    }


    const favorite =
        isFavorite(
            productId
        );


    button.classList.toggle(
        "active",
        favorite
    );


    button.textContent =
        favorite
            ? "♥"
            : "♡";

}


/* =========================================
   SHARE
========================================= */

async function shareProduct() {

    if (!currentProduct) return;


    const name =
        currentProduct.name ??
        currentProduct.title ??
        "SANA Boutique Product";


    const url =
        window.location.href;


    if (
        typeof navigator.share ===
        "function"
    ) {

        try {

            await navigator.share({

                title: name,

                text:
                    `Check out ${name} on SANA Boutique.`,

                url

            });

        } catch {

            /*
             * User cancelled sharing.
             */

        }


        return;

    }


    try {

        if (
            navigator.clipboard
        ) {

            await navigator.clipboard.writeText(
                url
            );


            showToast(
                "Product link copied"
            );

        } else {

            throw new Error(
                "Clipboard unavailable"
            );

        }

    } catch {

        showToast(
            "Unable to share product"
        );

    }

}


/* =========================================
   NORMALIZE SIZES
========================================= */

function normalizeSizes(
    sizes
) {

    if (
        Array.isArray(
            sizes
        )
    ) {

        return sizes
            .map(
                size =>
                    String(size).trim()
            )
            .filter(Boolean);

    }


    if (
        typeof sizes === "string" &&
        sizes.trim()
    ) {

        return sizes
            .split(",")
            .map(
                size =>
                    size.trim()
            )
            .filter(Boolean);

    }


    return [];

}


/* =========================================
   PRICE
========================================= */

function formatProductPrice(
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
   LOADING
========================================= */

function setProductLoading(
    container
) {

    container.innerHTML = `

        <div class="loading">
            Loading product...
        </div>

    `;

}


/* =========================================
   NOT FOUND
========================================= */

function showProductNotFound() {

    const container =
        document.getElementById(
            "productDetails"
        );


    if (!container) return;


    container.innerHTML = `

        <div
            class="product-not-found"
        >

            <div
                class="product-not-found-icon"
            >
                ♢
            </div>


            <h2>
                Product Not Found
            </h2>


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


/* =========================================
   ERROR
========================================= */

function showProductError(
    container
) {

    container.innerHTML = `

        <div
            class="product-not-found"
        >

            <div
                class="product-not-found-icon"
            >
                !
            </div>


            <h2>
                Couldn't Load Product
            </h2>


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

window.loadProduct =
    loadProduct;

window.shareProduct =
    shareProduct;
