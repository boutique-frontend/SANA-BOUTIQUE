/* =========================================
   SANA BOUTIQUE
   API CONNECTION
========================================= */

"use strict";


const API_BASE_URL =
    "https://boutique-backend-6fcr.onrender.com";


/* =========================================
   API REQUEST HELPER
========================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                options
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            data = null;

        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Server error (${response.status})`
            );

        }


        return data;

    } catch (error) {

        console.error(
            "SANA API Error:",
            error
        );


        if (
            error instanceof TypeError
        ) {

            throw new Error(
                "Unable to connect to SANA server. Please check your internet connection."
            );

        }


        throw error;

    }

}


/* =========================================
   GET ALL PRODUCTS
========================================= */

async function getProducts() {

    const data =
        await apiRequest(
            "/api/posts",
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                },

                cache: "no-store"

            }
        );


    if (!Array.isArray(data)) {

        throw new Error(
            "Backend returned invalid product data."
        );

    }


    return data;

}


/* =========================================
   GET ONE PRODUCT
========================================= */

async function getProductById(
    productId
) {

    if (!productId) {

        return null;

    }


    const products =
        await getProducts();


    return (
        products.find(
            product =>
                String(product.id) ===
                String(productId)
        ) || null
    );

}


/* =========================================
   CREATE PRODUCT
========================================= */

async function createProduct(
    product
) {

    if (!product) {

        throw new Error(
            "Product data is missing."
        );

    }


    if (!product.image) {

        throw new Error(
            "Please select a product image."
        );

    }


    if (
        !(product.image instanceof File)
    ) {

        throw new Error(
            "Invalid image file."
        );

    }


    const formData =
        new FormData();


    /*
     * Flask expects:
     *
     * title
     * category
     * price
     * sizes
     * description
     * image
     */


    formData.append(
        "title",
        product.name?.trim() || ""
    );


    formData.append(
        "category",
        product.category || ""
    );


    formData.append(
        "price",
        product.price || "0"
    );


    formData.append(
        "sizes",
        Array.isArray(product.sizes)
            ? product.sizes.join(", ")
            : product.sizes || ""
    );


    formData.append(
        "description",
        product.description?.trim() || ""
    );


    formData.append(
        "image",
        product.image,
        product.image.name
    );


    /*
     * DO NOT manually set
     * Content-Type here.
     *
     * Browser automatically creates
     * multipart/form-data boundary.
     */


    return await apiRequest(
        "/api/posts",
        {
            method: "POST",
            body: formData
        }
    );

}


/* =========================================
   DELETE PRODUCT
========================================= */

async function deleteProduct(
    productId
) {

    if (!productId) {

        throw new Error(
            "Product ID is required."
        );

    }


    return await apiRequest(
        `/api/posts/${encodeURIComponent(productId)}`,
        {
            method: "DELETE",

            headers: {
                "Accept":
                    "application/json"
            }
        }
    );

}


/* =========================================
   BACKEND HEALTH CHECK
========================================= */

async function checkBackend() {

    try {

        const response =
            await fetch(
                API_BASE_URL,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            return false;

        }


        const data =
            await response.json();


        return Boolean(
            data?.message
        );

    } catch {

        return false;

    }

}


/* =========================================
   WARM UP BACKEND
========================================= */

async function wakeBackend() {

    try {

        await checkBackend();

        return true;

    } catch {

        return false;

    }

}


/* =========================================
   EXPOSE API
========================================= */

window.API_BASE_URL =
    API_BASE_URL;

window.apiRequest =
    apiRequest;

window.getProducts =
    getProducts;

window.getProductById =
    getProductById;

window.createProduct =
    createProduct;

window.deleteProduct =
    deleteProduct;

window.checkBackend =
    checkBackend;

window.wakeBackend =
    wakeBackend;
