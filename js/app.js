/* =========================================
SANA BOUTIQUE
MAIN APP CONTROLLER
========================================= */

"use strict";

/* =========================================
APP CONFIGURATION
========================================= */

const SANA_APP = {

name: "SANA Boutique",  

version: "1.0.0",  

/* Backend URL  
   We will connect your existing backend here later.  
*/  
API_BASE_URL: "",  

debug: true

};

/* =========================================
GLOBAL APP STATE
========================================= */

const AppState = {

currentPage: "home",  

products: [],  

selectedProduct: null,  

favorites: [],  

cart: [],  

isLoading: false

};

/* =========================================
APP INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

console.log(  
    `${SANA_APP.name} v${SANA_APP.version} started`  
);  

initializeApp();

});

function initializeApp() {

detectCurrentPage();  

loadLocalState();  

setupGlobalEvents();

}

/* =========================================
DETECT CURRENT PAGE
========================================= */

function detectCurrentPage() {

const path = window.location.pathname.toLowerCase();  

if (  
    path.endsWith("/") ||  
    path.endsWith("index.html")  
) {  

    AppState.currentPage = "home";  

} else if (path.includes("shop")) {  

    AppState.currentPage = "shop";  

} else if (path.includes("post")) {  

    AppState.currentPage = "post";  

} else if (path.includes("product")) {  

    AppState.currentPage = "product";  

} else if (path.includes("about")) {  

    AppState.currentPage = "about";  

} else if (path.includes("contact")) {  

    AppState.currentPage = "contact";  

}

}

/* =========================================
LOCAL STORAGE
========================================= */

function loadLocalState() {

try {  

    const savedFavorites =  
        localStorage.getItem("sana_favorites");  

    const savedCart =  
        localStorage.getItem("sana_cart");  


    if (savedFavorites) {  

        AppState.favorites =  
            JSON.parse(savedFavorites);  

    }  


    if (savedCart) {  

        AppState.cart =  
            JSON.parse(savedCart);  

    }  

} catch (error) {  

    console.error(  
        "Could not load local app state:",  
        error  
    );  

}

}

/* =========================================
SAVE LOCAL STATE
========================================= */

function saveLocalState() {

try {  

    localStorage.setItem(  
        "sana_favorites",  
        JSON.stringify(AppState.favorites)  
    );  


    localStorage.setItem(  
        "sana_cart",  
        JSON.stringify(AppState.cart)  
    );  

} catch (error) {  

    console.error(  
        "Could not save app state:",  
        error  
    );  

}

}

/* =========================================
GLOBAL EVENTS
========================================= */

function setupGlobalEvents() {

/* Prevent accidental double tapping */  

document.addEventListener(  
    "dblclick",  
    event => {  

        if (  
            event.target.tagName === "BUTTON"  
        ) {  

            event.preventDefault();  

        }  

    }  
);  


/* Handle online/offline state */  

window.addEventListener(  
    "online",  
    () => {  

        showToast(  
            "Connection restored"  
        );  

    }  
);  


window.addEventListener(  
    "offline",  
    () => {  

        showToast(  
            "You are offline"  
        );  

    }  
);

}

/* =========================================
NAVIGATION HELPER
========================================= */

function goTo(url) {

window.location.href = url;

}

/* =========================================
PRODUCT PAGE
========================================= */

function openProduct(productId) {

if (!productId) return;  

window.location.href =  
    `pages/product.html?id=${encodeURIComponent(productId)}`;

}

/* =========================================
FAVORITES
========================================= */

function toggleFavorite(productId) {

if (!productId) return;  


const index =  
    AppState.favorites.indexOf(productId);  


if (index === -1) {  

    AppState.favorites.push(productId);  

    showToast("Added to favorites");  

} else {  

    AppState.favorites.splice(index, 1);  

    showToast("Removed from favorites");  

}  


saveLocalState();  


/* Refresh favorite buttons */  

document  
    .querySelectorAll(  
        `[data-favorite="${productId}"]`  
    )  
    .forEach(button => {  

        button.classList.toggle(  
            "active",  
            AppState.favorites.includes(productId)  
        );  

    });

}

/* =========================================
CHECK FAVORITE
========================================= */

function isFavorite(productId) {

return AppState.favorites.includes(  
    productId  
);

}

/* =========================================
CART
========================================= */

function addToCart(product) {

if (!product || !product.id) return;  


AppState.cart.push(product);  

saveLocalState();  

showToast("Added to bag");

}

/* =========================================
REMOVE FROM CART
========================================= */

function removeFromCart(productId) {

AppState.cart =  
    AppState.cart.filter(  
        product =>  
            product.id !== productId  
    );  


saveLocalState();

}

/* =========================================
TOAST MESSAGE
========================================= */

function showToast(message) {

let toast =  
    document.querySelector(".sana-toast");  


if (!toast) {  

    toast =  
        document.createElement("div");  

    toast.className =  
        "sana-toast";  

    document.body.appendChild(toast);  

}  


toast.textContent = message;  

toast.classList.add("show");  


clearTimeout(  
    toast.hideTimer  
);  


toast.hideTimer =  
    setTimeout(() => {  

        toast.classList.remove("show");  

    }, 2200);

}

/* =========================================
LOADING STATE
========================================= */

function setLoading(isLoading) {

AppState.isLoading =  
    Boolean(isLoading);  


document.body.classList.toggle(  
    "app-loading",  
    AppState.isLoading  
);

}

/* =========================================
SAFE JSON
========================================= */

function safeJSON(value, fallback = null) {

try {  

    return JSON.parse(value);  

} catch {  

    return fallback;  

}

}

/* =========================================
EXPORT GLOBAL APP
========================================= */

window.SANA_APP = SANA_APP;

window.AppState = AppState;

window.goTo = goTo;

window.openProduct = openProduct;

window.toggleFavorite = toggleFavorite;

window.isFavorite = isFavorite;

window.addToCart = addToCart;

window.removeFromCart = removeFromCart;

window.showToast = showToast;

window.setLoading = setLoading;

window.safeJSON = safeJSON;
Update it no mistake
