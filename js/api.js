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
    url,
    options = {}
) {

    let response;

    try {

        response = await fetch(
            url,
            options
        );

    } catch (error) {

        throw new Error(
            "Unable to connect to SANA server. Please check your internet connection."
        );

    }


    let data = null;

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        try {

            data =
                await response.json();

        } catch {

            data = null;

        }

    } else {

        try {

            const text =
                await response.text();

            data =
                text
                    ? { message: text }
                    : null;

        } catch {

            data = null;

        }

    }


    if (!response.ok) {

        throw new Error(
            data?.error ||
            data?.message ||
            `Server error (${response.status})`
        );

    }


    return data;

}


/* =========================================
   GET ALL PRODUCTS
========================================= */

async function getProducts() {

    const data =
        await apiRequest(
            `${API_BASE_URL}/api/posts`,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                },

                cache: "no-store"
            }
        );


    /*
     * Support different backend response shapes:
     *
     * []
     * { posts: [] }
     * { products: [] }
     * { data: [] }
     */

    if (Array.isArray(data)) {

        return data;

    }


    if (Array.isArray(data?.posts)) {

        return data.posts;

    }


    if (Array.isArray(data?.products)) {

        return data.products;

    }


    if (Array.isArray(data?.data)) {

        return data.data;

    }


    throw new Error(
        "Backend returned invalid product data."
    );

}


/* =========================================
   GET ONE PRODUCT
========================================= */

async function getProductById(
    productId
) {

    if (
        productId === null ||
        productId === undefined ||
        productId === ""
    ) {

        throw new Error(
            "Product ID is required."
        );

    }


    const products =
        await getProducts();


    return products.find(
        product => {

            const id =
                product?.id ??
                product?._id ??
                product?.product_id ??
                product?.post_id;


            return String(id) ===
                String(productId);

        }
    ) || null;

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
     * BACKEND FIELD MAPPING
     */

    formData.append(
        "title",
        String(product.name || "")
    );


    formData.append(
        "category",
        String(product.category || "")
    );


    formData.append(
        "price",
        String(product.price || "0")
    );


    formData.append(
        "sizes",
        Array.isArray(product.sizes)
            ? product.sizes.join(", ")
            : String(product.sizes || "")
    );


    formData.append(
        "description",
        String(product.description || "")
    );


    /*
     * EXTRA INFORMATION
     */

    formData.append(
        "color",
        String(product.color || "")
    );


    formData.append(
        "stock",
        String(product.stock || "0")
    );


    /*
     * IMAGE
     */

    formData.append(
        "image",
        product.image
    );


    /*
     * IMPORTANT:
     *
     * Do NOT manually set Content-Type here.
     * Browser automatically adds the multipart
     * boundary when FormData is used.
     */

    const data =
        await apiRequest(
            `${API_BASE_URL}/api/posts`,
            {
                method: "POST",

                body: formData
            }
        );


    return data;

}


/* =========================================
   DELETE PRODUCT
========================================= */

async function deleteProduct(
    productId
) {

    if (
        productId === null ||
        productId === undefined ||
        productId === ""
    ) {

        throw new Error(
            "Product ID is required."
        );

    }


    const data =
        await apiRequest(
            `${API_BASE_URL}/api/posts/${encodeURIComponent(productId)}`,
            {
                method: "DELETE",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    return data;

}


/* =========================================
   HEALTH CHECK
========================================= */

async function checkBackend() {

    try {

        const data =
            await apiRequest(
                API_BASE_URL,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


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
