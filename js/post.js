/* =========================================
   SANA BOUTIQUE
   POST / CREATE PRODUCT CONTROLLER
========================================= */

"use strict";


document.addEventListener("DOMContentLoaded", () => {

    initializePost();

});


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
        document.getElementById("productImage");

    const preview =
        document.getElementById("uploadPreview");

    if (!input || !preview) return;


    input.addEventListener("change", () => {

        const file = input.files?.[0];

        if (!file) return;


        /* IMAGE TYPE */

        if (!file.type.startsWith("image/")) {

            showToast(
                "Please select a valid image"
            );

            input.value = "";

            resetImagePreview();

            return;

        }


        /* IMAGE SIZE */

        const maxSize =
            10 * 1024 * 1024;


        if (file.size > maxSize) {

            showToast(
                "Image must be smaller than 10MB"
            );

            input.value = "";

            resetImagePreview();

            return;

        }


        /* PREVIEW */

        const reader =
            new FileReader();


        reader.onload = event => {

            preview.classList.add(
                "has-image"
            );


            preview.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Product preview"
                >

                <div class="preview-overlay">
                    <span>Change Image</span>
                </div>

            `;

        };


        reader.readAsDataURL(file);

    });

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
   SUBMIT PRODUCT
========================================= */

async function handleProductSubmit(event) {

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


        /*
         * createProduct()
         * comes from api.js
         */

        if (
            typeof createProduct !==
            "function"
        ) {

            throw new Error(
                "Backend API is not connected."
            );

        }


        const result =
            await createProduct(
                product
            );


        console.log(
            "Product published successfully:",
            result
        );


        showPublishSuccess(
            form
        );


    } catch (error) {

        console.error(
            "Publishing failed:",
            error
        );


        showToast(
            getErrorMessage(error)
        );


    } finally {

        setPublishLoading(
            button,
            false
        );

    }

}


/* =========================================
   COLLECT PRODUCT DATA
========================================= */

function collectProductData(form) {

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

        /*
         * HTML name:
         * name
         *
         * Backend field:
         * title
         */

        name:
            formData.get("name")?.trim() ||
            "",


        description:
            formData.get("description")?.trim() ||
            "",


        price:
            formData.get("price") ||
            "",


        category:
            formData.get("category") ||
            "",


        sizes,


        /*
         * These are currently collected
         * for future backend support.
         */

        color:
            formData.get("color")?.trim() ||
            "",


        stock:
            formData.get("stock") ||
            "",


        /*
         * REAL FILE
         */

        image:
            formData.get("image") ||
            null

    };

}


/* =========================================
   VALIDATION
========================================= */

function validateProductData(data) {

    if (!data.image) {

        return {

            valid: false,

            message:
                "Please add a product image"

        };

    }


    if (
        !data.image.type ||
        !data.image.type.startsWith("image/")
    ) {

        return {

            valid: false,

            message:
                "Please select a valid image"

        };

    }


    if (!data.name) {

        return {

            valid: false,

            message:
                "Please enter a product name"

        };

    }


    if (!data.description) {

        return {

            valid: false,

            message:
                "Please enter a product description"

        };

    }


    if (
        data.price === "" ||
        Number.isNaN(Number(data.price)) ||
        Number(data.price) < 0
    ) {

        return {

            valid: false,

            message:
                "Please enter a valid price"

        };

    }


    if (!data.category) {

        return {

            valid: false,

            message:
                "Please select a category"

        };

    }


    return {

        valid: true,

        message: ""

    };

}


/* =========================================
   PUBLISH LOADING
========================================= */

function setPublishLoading(
    button,
    loading
) {

    if (!button) return;


    button.disabled =
        loading;


    if (loading) {

        if (!button.dataset.originalText) {

            button.dataset.originalText =
                button.innerHTML;

        }


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

function showPublishSuccess(form) {

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

        </section>

    `;


    const button =
        document.getElementById(
            "viewShopButton"
        );


    if (button) {

        button.addEventListener(
            "click",
            () => {

                window.location.href =
                    "shop.html";

            }
        );

    }

}


/* =========================================
   ERROR MESSAGE
========================================= */

function getErrorMessage(error) {

    if (!error) {

        return "Could not publish product";

    }


    return (
        error.message ||
        "Could not publish product"
    );

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
