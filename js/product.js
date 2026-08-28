/* =========================================
   SANA BOUTIQUE
   PRODUCT DETAILS CONTROLLER
========================================= */

"use strict";

let currentProduct = null;
let selectedSize = "";


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeProduct
);


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
   GET PRODUCT ID
========================================= */

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("id");

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
                "Product API is not connected."
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


        /*
         * Only update AppState
         * if it exists.
         */

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
   RENDER PRODUCT
========================================= */

function renderProduct(
    product,
    container
) {

    const name =
        product.title ??
        product.name ??
        "SANA Boutique Item";


    const description =
        product.description ??
        "No description available.";


    const price =
        product.price ??
        "";


    const category =
        product.category ??
        "Collection";


    const image =
        product.image_url ??
        product.image ??
        product.photo ??
        "";


    const sizes =
        normalizeSizes(
            product.sizes
        );


    container.innerHTML = `

        <!-- =================================
             MAIN PRODUCT IMAGE
        ================================== -->

        <div class="product-main-image">

            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            class="product-large-image"
                        >
                      `
                    : `
                        <div
                            class="
                                image-placeholder
                            "
                        >
                            <span>
                                SANA
                            </span>
                        </div>
                      `
            }

        </div>


        <!-- =================================
             PRODUCT INFORMATION
        ================================== -->

        <section class="product-information">


            <span class="product-category">

                ${escapeHTML(category)}

            </span>


            <h1 class="product-title">

                ${escapeHTML(name)}

            </h1>


            <div class="product-detail-price">

                ${formatProductPrice(price)}

            </div>


            <!-- DESCRIPTION -->

            <div class="product-description">

                <h2>
                    Description
                </h2>


                <p>
                    ${escapeHTML(description)}
                </p>

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
                    : `
                        <div
                            class="product-no-size"
                        >
                            Size information
                            not available.
                        </div>
                      `
            }


            <!-- ACTIONS -->

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
                        button.dataset.size;

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
                        product.sizes
                    );


                if (
                    sizes.length &&
                    !selectedSize
                ) {

                    showToast(
                        "Please select a size"
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
                        "Cart is not connected yet."
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
   FAVORITE BUTTON
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
                getProductIdValue(
                    currentProduct
                );


            if (
                !id ||
                typeof toggleFavorite !==
                "function"
            ) {

                return;

            }


            toggleFavorite(
                id
            );


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
        getProductIdValue(
            product
        );


    updateProductFavoriteButton(
        button,
        id
    );

}


/* =========================================
   GET PRODUCT ID
========================================= */

function getProductIdValue(
    product
) {

    return (
        product?.id ??
        product?._id ??
        product?.product_id ??
        null
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
   SHARE PRODUCT
========================================= */

async function shareProduct() {

    if (!currentProduct) return;


    const name =
        currentProduct.title ??
        currentProduct.name ??
        "SANA Boutique Product";


    const url =
        window.location.href;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title: name,

                text:
                    `Check out ${name} on SANA Boutique.`,

                url: url

            });

        } catch {

            /*
             * User cancelled sharing.
             */

        }


        return;

    }


    try {

        await navigator.clipboard.writeText(
            url
        );


        showToast(
            "Product link copied"
        );


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
        typeof sizes ===
        "string" &&
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
   FORMAT PRICE
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
            price
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
