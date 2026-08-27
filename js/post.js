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


        if (!file.type.startsWith("image/")) {

            showToast("Please select an image");

            input.value = "";

            return;

        }


        const maxSize =
            10 * 1024 * 1024;


        if (file.size > maxSize) {

            showToast(
                "Image must be smaller than 10MB"
            );

            input.value = "";

            return;

        }


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

            `;

        };


        reader.readAsDataURL(file);

    });

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


    const formData =
        collectProductData(form);


    const validation =
        validateProductData(formData);


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
         * IMPORTANT:
         *
         * The actual backend request will be
         * connected in api.js.
         *
         * We do NOT invent your endpoint.
         */

        let result;


        if (
            typeof createProduct ===
            "function"
        ) {

            result =
                await createProduct(
                    formData
                );

        } else {

            /*
             * API function isn't connected yet.
             */

            throw new Error(
                "createProduct() is not connected to the backend yet."
            );

        }


        console.log(
            "Product published:",
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
            error.message ||
            "Could not publish product"
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

        color:
            formData.get("color")?.trim() ||
            "",

        stock:
            formData.get("stock") ||
            "",

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
            message: "Please add a product image"
        };

    }


    if (!data.name) {

        return {
            valid: false,
            message: "Please enter a product name"
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
        Number(data.price) < 0
    ) {

        return {
            valid: false,
            message: "Please enter a valid price"
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
                style="margin-top:20px;"
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
   EXPOSE
========================================= */

window.collectProductData =
    collectProductData;

window.validateProductData =
    validateProductData;

window.handleProductSubmit =
    handleProductSubmit;
