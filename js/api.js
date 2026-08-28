/* =========================================
   SANA BOUTIQUE
   API CONNECTION
========================================= */

"use strict";


const API_BASE_URL =
    "https://boutique-backend-6fcr.onrender.com";


/* =========================================
   GET ALL POSTS
========================================= */

async function getProducts() {

    const response = await fetch(
        `${API_BASE_URL}/api/posts`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }
    );


    if (!response.ok) {

        throw new Error(
            `Failed to load products (${response.status})`
        );

    }


    const data =
        await response.json();


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

    const products =
        await getProducts();


    return products.find(product => {

        return String(
            product.id
        ) === String(productId);

    }) || null;

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


    const formData =
        new FormData();


    /*
     * IMPORTANT:
     * Your Flask backend expects
     * "title", not "name".
     */

    formData.append(
        "title",
        product.name || ""
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
        product.description || ""
    );


    formData.append(
        "image",
        product.image
    );


    const response =
        await fetch(
            `${API_BASE_URL}/api/posts`,
            {
                method: "POST",
                body: formData
            }
        );


    let data = null;


    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "The server returned an invalid response."
        );

    }


    if (!response.ok) {

        throw new Error(
            data?.error ||
            `Failed to publish product (${response.status})`
        );

    }


    return data;

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


    const response =
        await fetch(
            `${API_BASE_URL}/api/posts/${encodeURIComponent(productId)}`,
            {
                method: "DELETE",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


    let data = null;


    try {

        data =
            await response.json();

    } catch {

        data = {};

    }


    if (!response.ok) {

        throw new Error(
            data?.error ||
            `Failed to delete product (${response.status})`
        );

    }


    return data;

}


/* =========================================
   HEALTH CHECK
========================================= */

async function checkBackend() {

    try {

        const response =
            await fetch(
                API_BASE_URL,
                {
                    method: "GET"
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
   EXPOSE API
========================================= */

window.API_BASE_URL =
    API_BASE_URL;

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
