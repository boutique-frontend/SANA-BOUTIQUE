/* =========================================
   SANA BOUTIQUE
   API CONNECTION
   PRODUCT ID FIX
========================================= */

"use strict";


/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE_URL =
    "https://boutique-backend-6fcr.onrender.com";


const API_ENDPOINTS = {

    posts:
        `${API_BASE_URL}/api/posts`

};


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
            {
                ...options,

                cache:
                    options.cache ||
                    "no-store"
            }
        );

    } catch (error) {

        console.error(
            "SANA API connection error:",
            error
        );


        throw new Error(
            "Unable to connect to SANA server. Please check your internet connection."
        );

    }


    let data = null;


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    /* =====================================
       JSON
    ====================================== */

    if (
        contentType
            .toLowerCase()
            .includes(
                "application/json"
            )
    ) {

        try {

            data =
                await response.json();

        } catch (error) {

            console.error(
                "JSON parsing failed:",
                error
            );

            data = null;

        }

    }


    /* =====================================
       TEXT
    ====================================== */

    else {

        try {

            const text =
                await response.text();


            if (text) {

                data = {
                    message: text
                };

            }

        } catch {

            data = null;

        }

    }


    /* =====================================
       HTTP ERROR
    ====================================== */

    if (!response.ok) {

        const message =
            data?.error ||
            data?.message ||
            `Server error (${response.status})`;


        throw new Error(
            message
        );

    }


    return data;

}


/* =========================================
   GET PRODUCT ID
========================================= */

function getProductId(
    product
) {

    if (!product) {

        return null;

    }


    /*
     * Check the most common backend
     * identifier names.
     */

    const possibleIds = [

        product.id,

        product._id,

        product.product_id,

        product.post_id,

        product.uuid,

        product.productId,

        product.postId

    ];


    for (
        const value of possibleIds
    ) {

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


/* =========================================
   NORMALIZE PRODUCT
========================================= */

function normalizeProduct(
    product
) {

    if (
        !product ||
        typeof product !== "object"
    ) {

        return null;

    }


    const id =
        getProductId(
            product
        );


    /*
     * Keep the original backend object,
     * but expose one reliable ID.
     */

    return {

        ...product,

        id:
            id !== null
                ? id
                : product.id

    };

}


/* =========================================
   NORMALIZE PRODUCT LIST
========================================= */

function normalizeProductList(
    data
) {

    let products = null;


    if (
        Array.isArray(data)
    ) {

        products =
            data;

    }

    else if (
        Array.isArray(data?.posts)
    ) {

        products =
            data.posts;

    }

    else if (
        Array.isArray(data?.products)
    ) {

        products =
            data.products;

    }

    else if (
        Array.isArray(data?.data)
    ) {

        products =
            data.data;

    }


    if (!products) {

        return null;

    }


    /*
     * Normalize every product individually.
     */

    return products
        .map(
            normalizeProduct
        )
        .filter(
            product => product !== null
        );

}


/* =========================================
   GET ALL PRODUCTS
========================================= */

async function getProducts() {

    const data =
        await apiRequest(
            API_ENDPOINTS.posts,
            {
                method: "GET",

                headers: {

                    "Accept":
                        "application/json"

                }

            }
        );


    const products =
        normalizeProductList(
            data
        );


    if (!products) {

        console.error(
            "Invalid backend response:",
            data
        );


        throw new Error(
            "Backend returned invalid product data."
        );

    }


    /*
     * IMPORTANT DEBUGGING
     *
     * This lets us see exactly what
     * IDs the backend is returning.
     */

    console.table(
        products.map(
            (product, index) => ({

                index,

                id:
                    getProductId(
                        product
                    ),

                name:
                    product.name ??
                    product.title ??
                    "Unnamed",

                category:
                    product.category ??
                    ""

            })
        )
    );


    return products;

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


    const requestedId =
        String(
            productId
        ).trim();


    const product =
        products.find(
            item => {

                const id =
                    getProductId(
                        item
                    );


                if (
                    id === null ||
                    id === undefined
                ) {

                    return false;

                }


                return (
                    String(id).trim() ===
                    requestedId
                );

            }
        );


    if (!product) {

        console.warn(
            "Product not found for ID:",
            requestedId
        );


        console.log(
            "Available product IDs:",
            products.map(
                getProductId
            )
        );

    }


    return product || null;

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


    /* =====================================
       IMAGE
    ====================================== */

    if (!product.image) {

        throw new Error(
            "Please select a product image."
        );

    }


    if (
        !(
            product.image
            instanceof File
        )
    ) {

        throw new Error(
            "Invalid product image."
        );

    }


    if (
        !product.image.type
            .toLowerCase()
            .startsWith("image/")
    ) {

        throw new Error(
            "The selected file is not a valid image."
        );

    }


    const MAX_IMAGE_SIZE =
        10 * 1024 * 1024;


    if (
        product.image.size >
        MAX_IMAGE_SIZE
    ) {

        throw new Error(
            "Image must be smaller than 10MB."
        );

    }


    /* =====================================
       REQUIRED FIELDS
    ====================================== */

    const title =
        String(
            product.name ||
            ""
        ).trim();


    const description =
        String(
            product.description ||
            ""
        ).trim();


    const category =
        String(
            product.category ||
            ""
        ).trim();


    const price =
        String(
            product.price ||
            ""
        ).trim();


    if (!title) {

        throw new Error(
            "Product name is required."
        );

    }


    if (!description) {

        throw new Error(
            "Product description is required."
        );

    }


    if (!category) {

        throw new Error(
            "Product category is required."
        );

    }


    if (
        price === "" ||
        Number.isNaN(
            Number(price)
        ) ||
        Number(price) < 0
    ) {

        throw new Error(
            "Please enter a valid price."
        );

    }


    /* =====================================
       FORMDATA
    ====================================== */

    const formData =
        new FormData();


    formData.append(
        "title",
        title
    );


    formData.append(
        "category",
        category
    );


    formData.append(
        "price",
        price
    );


    /* =====================================
       SIZES
    ====================================== */

    let sizes = "";


    if (
        Array.isArray(
            product.sizes
        )
    ) {

        sizes =
            product.sizes
                .map(
                    size =>
                        String(size).trim()
                )
                .filter(Boolean)
                .join(", ");

    }

    else if (
        product.sizes
    ) {

        sizes =
            String(
                product.sizes
            ).trim();

    }


    formData.append(
        "sizes",
        sizes
    );


    /* =====================================
       DESCRIPTION
    ====================================== */

    formData.append(
        "description",
        description
    );


    /* =====================================
       COLOR
    ====================================== */

    const color =
        String(
            product.color ||
            ""
        ).trim();


    formData.append(
        "color",
        color
    );


    /* =====================================
       STOCK
    ====================================== */

    let stock =
        String(
            product.stock ??
            ""
        ).trim();


    if (stock === "") {

        stock = "0";

    }


    if (
        Number.isNaN(
            Number(stock)
        ) ||
        Number(stock) < 0
    ) {

        throw new Error(
            "Please enter a valid stock quantity."
        );

    }


    formData.append(
        "stock",
        stock
    );


    /* =====================================
       IMAGE
    ====================================== */

    formData.append(
        "image",
        product.image,
        product.image.name
    );


    /* =====================================
       SEND
    ====================================== */

    const data =
        await apiRequest(
            API_ENDPOINTS.posts,
            {
                method: "POST",

                body:
                    formData

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


    const encodedId =
        encodeURIComponent(
            String(productId)
        );


    return await apiRequest(
        `${API_ENDPOINTS.posts}/${encodedId}`,
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

                    }

                }
            );


        return Boolean(
            data &&
            (
                data.message ||
                data.status ||
                data.success
            )
        );

    } catch (error) {

        console.warn(
            "SANA backend health check failed:",
            error.message
        );


        return false;

    }

}


/* =========================================
   DEBUG API
========================================= */

async function testProductsAPI() {

    try {

        const products =
            await getProducts();


        console.log(
            "SANA API connected successfully."
        );


        console.log(
            "Products:",
            products
        );


        return products;

    } catch (error) {

        console.error(
            "SANA API test failed:",
            error
        );


        throw error;

    }

}


/* =========================================
   EXPOSE API
========================================= */

window.API_BASE_URL =
    API_BASE_URL;


window.API_ENDPOINTS =
    API_ENDPOINTS;


window.getProducts =
    getProducts;


window.getProductById =
    getProductById;


window.getProductId =
    getProductId;


window.createProduct =
    createProduct;


window.deleteProduct =
    deleteProduct;


window.checkBackend =
    checkBackend;


window.testProductsAPI =
    testProductsAPI;
