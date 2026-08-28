/* =========================================
   SANA BOUTIQUE
   POST / CREATE PRODUCT CONTROLLER
========================================= */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    initializePost
);


/* =========================================
   INITIALIZE
========================================= */

function initializePost() {

    setupImagePreview();

    setupProductForm();

}


/* =========================================
   IMAGE PREVIEW
========================================= */

function setupImagePreview() {

    const input =
        document.getElementById(
            "productImage"
        );

    const preview =
        document.getElementById(
            "uploadPreview"
        );


    if (!input || !preview) return;


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files?.[0];


            if (!file) {

                resetImagePreview();

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showToast(
                    "Please select a valid image."
                );

                input.value = "";

                resetImagePreview();

                return;

            }


            const maxSize =
                10 * 1024 * 1024;


            if (file.size > maxSize) {

                showToast(
                    "Image must be smaller than 10MB."
                );

                input.value = "";

                resetImagePreview();

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    preview.classList.add(
                        "has-image"
                    );


                    preview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="Product preview"
                        >

                        <div class="upload-overlay">
                            CHANGE IMAGE
                        </div>

                    `;

                };


            reader.onerror = () => {

                showToast(
                    "Unable to preview image."
                );

            };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================
   RESET IMAGE PREVIEW
========================================= */

function resetImagePreview() {

    const preview =
        document.getElementById(
            "uploadPreview"
        );


    if (!preview) return;


    preview.classList.remove(
        "has-image"
    );


    preview.innerHTML = `

        <div class="upload-icon">
            +
        </div>

        <strong>
            Add Product Image
        </strong>

        <small>
            JPG, PNG or WEBP
        </small>

    `;

}


/* =========================================
   PRODUCT FORM
========================================= */

function setupProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        handleProductSubmit
    );

}


/* =========================================
   SUBMIT
========================================= */

async function handleProductSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const button =
        document.getElementById(
            "publishButton"
        );


    const product =
        collectProductData(form);


    const validation =
        validateProductData(product);


    if (!validation.valid) {

        showToast(
            validation.message
        );

        return;

    }


    try {

        setPublishLoading(
            button,
            true
        );


        if (
            typeof createProduct !==
            "function"
        ) {

            throw new Error(
                "API connection is not loaded."
            );

        }


        const result =
            await createProduct(
                product
            );


        console.log(
            "Product published:",
            result
        );


        /*
         * Clear possible cached product
         * state if app.js provides it.
         */

        if (
            typeof AppState !==
            "undefined"
        ) {

            if (
                Array.isArray(
                    AppState.products
                )
            ) {

                AppState.products = [];

            }

        }


        showPublishSuccess(
            form
        );


    } catch (error) {

        console.error(
            "Publishing failed:",
            error
        );


        showToast(
            error?.message ||
            "Could not publish product."
        );


    } finally {

        setPublishLoading(
            button,
            false
        );

    }

}


/* =========================================
   COLLECT FORM DATA
========================================= */

function collectProductData(
    form
) {

    const formData =
        new FormData(form);


    const sizes =
        Array.from(
            form.querySelectorAll(
                'input[name="sizes"]:checked'
            )
        ).map(
            checkbox =>
                checkbox.value
        );


    return {

        name:
            String(
                formData.get("name") ||
                ""
            ).trim(),


        description:
            String(
                formData.get("description") ||
                ""
            ).trim(),


        price:
            String(
                formData.get("price") ||
                ""
            ).trim(),


        category:
            String(
                formData.get("category") ||
                ""
            ).trim(),


        sizes,


        color:
            String(
                formData.get("color") ||
                ""
            ).trim(),


        stock:
            String(
                formData.get("stock") ||
                ""
            ).trim(),


        image:
            formData.get("image") ||
            null

    };

}


/* =========================================
   VALIDATION
========================================= */

function validateProductData(
    data
) {

    if (!data.image) {

        return {
            valid: false,
            message:
                "Please add a product image."
        };

    }


    if (
        !data.image.type ||
        !data.image.type.startsWith(
            "image/"
        )
    ) {

        return {
            valid: false,
            message:
                "Please select a valid image."
        };

    }


    if (!data.name) {

        return {
            valid: false,
            message:
                "Please enter a product name."
        };

    }


    if (data.name.length < 2) {

        return {
            valid: false,
            message:
                "Product name is too short."
        };

    }


    if (!data.description) {

        return {
            valid: false,
            message:
                "Please enter a product description."
        };

    }


    const price =
        Number(data.price);


    if (
        data.price === "" ||
        !Number.isFinite(price) ||
        price < 0
    ) {

        return {
            valid: false,
            message:
                "Please enter a valid price."
        };

    }


    if (!data.category) {

        return {
            valid: false,
            message:
                "Please select a category."
        };

    }


    if (data.stock !== "") {

        const stock =
            Number(data.stock);


        if (
            !Number.isInteger(stock) ||
            stock < 0
        ) {

            return {
                valid: false,
                message:
                    "Please enter a valid stock quantity."
            };

        }

    }


    return {
        valid: true,
        message: ""
    };

}


/* =========================================
   LOADING
========================================= */

function setPublishLoading(
    button,
    loading
) {

    if (!button) return;


    button.disabled =
        loading;


    if (loading) {

        button.dataset.originalText =
            button.innerHTML;


        button.innerHTML = `

            <span>
                PUBLISHING...
            </span>

            <span>
                …
            </span>

        `;

    } else {

        button.innerHTML =
            button.dataset.originalText ||
            `

                <span>
                    PUBLISH PRODUCT
                </span>

                <span>
                    →
                </span>

            `;

    }

}


/* =========================================
   SUCCESS
========================================= */

function showPublishSuccess(
    form
) {

    form.innerHTML = `

        <section
            class="publish-success"
        >

            <div
                class="publish-success-icon"
            >
                ✓
            </div>


            <h2>
                Product Published
            </h2>


            <p>
                Your product has been
                successfully added to
                SANA Boutique.
            </p>


            <div class="success-actions">

                <button
                    type="button"
                    class="publish-button"
                    id="viewShopButton"
                >

                    <span>
                        VIEW SHOP
                    </span>

                    <span>
                        →
                    </span>

                </button>


                <button
                    type="button"
                    class="secondary-button"
                    id="addAnotherButton"
                >
                    ADD ANOTHER
                </button>

            </div>

        </section>

    `;


    const shopButton =
        document.getElementById(
            "viewShopButton"
        );


    if (shopButton) {

        shopButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "shop.html";

            }
        );

    }


    const anotherButton =
        document.getElementById(
            "addAnotherButton"
        );


    if (anotherButton) {

        anotherButton.addEventListener(
            "click",
            () => {

                window.location.reload();

            }
        );

    }

}


/* =========================================
   EXPOSE
========================================= */

window.collectProductData =
    collectProductData;

window.validateProductData =
    validateProductData;

window.handleProductSubmit =
    handleProductSubmit;
