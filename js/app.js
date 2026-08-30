/* =========================================
   SANA BOUTIQUE
   MAIN APP CONTROLLER + ROUTER
========================================= */
"use strict";

const SANA_APP = {
    name: "SANA Boutique",
    version: "1.0.0",
    API_BASE_URL: "",
    debug: true
};

const AppState = {
    currentPage: "home",
    products: [],
    selectedProduct: null,
    favorites: [],
    cart: [],
    isLoading: false
};

const App = {
    async init() {
        const appContainer = document.getElementById("app");
        if (!appContainer) {
            console.error("SANA: #app container not found.");
            return;
        }

        appContainer.innerHTML = `
            <div id="page-content"></div>
            ${window.Navbar && typeof window.Navbar.render === "function" ? window.Navbar.render() : ""}
        `;

        loadLocalState();
        setupGlobalEvents();

        window.addEventListener("hashchange", () => this.handleRoute());
        await this.handleRoute();
    },

    async handleRoute() {
        const contentContainer = document.getElementById("page-content");
        if (!contentContainer) return;

        let hash = window.location.hash.replace(/^#/, "").trim();
        if (!hash) hash = "home";

        const parts = hash.split("/");
        const route = parts[0].toLowerCase();
        const routeParameter = parts[1] || null;

        AppState.currentPage = route;
        setLoading(true);

        try {
            let module;

            switch (route) {
                case "home":
                    module = await import("./pages/home/home.js?v=2");
                    if (!module.HomePage) throw new Error("HomePage was not found in pages/home/home.js");
                    contentContainer.innerHTML = await module.HomePage.render();
                    if (typeof module.HomePage.init === "function") await module.HomePage.init();
                    break;

                case "shop":
                    module = await import("./pages/shop/shop.js?v=2");
                    if (!module.ShopPage) throw new Error("ShopPage was not found in pages/shop/shop.js");
                    contentContainer.innerHTML = await module.ShopPage.render();
                    if (typeof module.ShopPage.init === "function") await module.ShopPage.init();
                    break;

                case "post":
                    module = await import("./pages/post/post.js?v=2");
                    if (!module.PostPage) throw new Error("PostPage was not found in pages/post/post.js");
                    contentContainer.innerHTML = await module.PostPage.render();
                    if (typeof module.PostPage.init === "function") await module.PostPage.init();
                    break;

                case "about":
                    module = await import("./pages/about/about.js?v=2");
                    if (!module.AboutPage) throw new Error("AboutPage was not found in pages/about/about.js");
                    contentContainer.innerHTML = await module.AboutPage.render();
                    if (typeof module.AboutPage.init === "function") await module.AboutPage.init();
                    break;

                case "contact":
                    module = await import("./pages/contact/contact.js?v=2");
                    if (!module.ContactPage) throw new Error("ContactPage was not found in pages/contact/contact.js");
                    contentContainer.innerHTML = await module.ContactPage.render();
                    if (typeof module.ContactPage.init === "function") await module.ContactPage.init();
                    break;

                case "product":
                    module = await import("./pages/product/product.js?v=2");
                    if (!module.ProductPage) throw new Error("ProductPage was not found in pages/product/product.js");
                    window.SANA_PRODUCT_ID = routeParameter;
                    contentContainer.innerHTML = await module.ProductPage.render(routeParameter);
                    if (typeof module.ProductPage.init === "function") await module.ProductPage.init(routeParameter);
                    break;

                default:
                    window.location.hash = "#home";
                    return;
            }

            this.resetScroll(contentContainer);
            updateNavigation(route);

        } catch (error) {
            console.error("SANA routing error:", error);
            contentContainer.innerHTML = `
                <section class="error-box">
                    <h2>Something went wrong</h2>
                    <p>${escapeHTML(error.message || "Unable to load this page.")}</p>
                    <button type="button" onclick="window.location.hash='#home'">BACK HOME</button>
                </section>
            `;
            this.resetScroll(contentContainer);
        } finally {
            setLoading(false);
        }
    },

    resetScroll(contentContainer) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (contentContainer) {
            contentContainer.scrollTop = 0;
            if (contentContainer.firstElementChild) {
                contentContainer.firstElementChild.scrollTop = 0;
            }
        }
    }
};

function updateNavigation(route) {
    document.querySelectorAll(".nav-item, .post-button, [data-route]").forEach(item => {
        const target = (item.dataset.route || "").toLowerCase();
        item.classList.toggle("active", target === route);
    });
}

function goTo(url) {
    if (!url) return;

    if (url.startsWith("#")) {
        window.location.hash = url.substring(1);
        return;
    }

    const clean = url.split("?")[0].split("#")[0];

    if (clean.includes("about.html")) return void (window.location.hash = "#about");
    if (clean.includes("contact.html")) return void (window.location.hash = "#contact");
    if (clean.includes("shop.html")) return void (window.location.hash = "#shop");
    if (clean.includes("post.html")) return void (window.location.hash = "#post");

    if (clean.includes("product.html")) {
        const query = url.split("?")[1] || "";
        const id = new URLSearchParams(query).get("id");
        window.location.hash = id ? `#product/${encodeURIComponent(id)}` : "#product";
        return;
    }

    if (clean.includes("index.html") || clean === "") {
        window.location.hash = "#home";
        return;
    }

    window.location.href = url;
}

function openProduct(productId) {
    if (!productId) return;
    window.location.hash = `#product/${encodeURIComponent(productId)}`;
}

function toggleFavorite(productId) {
    if (!productId) return;
    const index = AppState.favorites.indexOf(productId);

    if (index === -1) {
        AppState.favorites.push(productId);
        showToast("Added to favorites");
    } else {
        AppState.favorites.splice(index, 1);
        showToast("Removed from favorites");
    }

    saveLocalState();

    document.querySelectorAll(`[data-favorite="${productId}"]`).forEach(button => {
        button.classList.toggle("active", AppState.favorites.includes(productId));
    });
}

function isFavorite(productId) {
    return AppState.favorites.includes(productId);
}

function addToCart(product) {
    if (!product || !product.id) return;
    AppState.cart.push(product);
    saveLocalState();
    showToast("Added to bag");
}

function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(product => product.id !== productId);
    saveLocalState();
}

function loadLocalState() {
    try {
        const savedFavorites = localStorage.getItem("sana_favorites");
        const savedCart = localStorage.getItem("sana_cart");

        if (savedFavorites) {
            const parsed = JSON.parse(savedFavorites);
            if (Array.isArray(parsed)) AppState.favorites = parsed;
        }

        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) AppState.cart = parsed;
        }
    } catch (error) {
        console.error("Could not load local app state:", error);
    }
}

function saveLocalState() {
    try {
        localStorage.setItem("sana_favorites", JSON.stringify(AppState.favorites));
        localStorage.setItem("sana_cart", JSON.stringify(AppState.cart));
    } catch (error) {
        console.error("Could not save local app state:", error);
    }
}

function setupGlobalEvents() {
    document.addEventListener("dblclick", event => {
        if (event.target && event.target.tagName === "BUTTON") event.preventDefault();
    });

    window.addEventListener("online", () => showToast("Connection restored"));
    window.addEventListener("offline", () => showToast("You are offline"));
}

function showToast(message) {
    let toast = document.querySelector(".sana-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "sana-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast.hideTimer);

    toast.hideTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setLoading(isLoading) {
    AppState.isLoading = Boolean(isLoading);
    document.body.classList.toggle("app-loading", AppState.isLoading);
}

function safeJSON(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.SANA_APP = SANA_APP;
window.AppState = AppState;
window.App = App;
window.goTo = goTo;
window.openProduct = openProduct;
window.toggleFavorite = toggleFavorite;
window.isFavorite = isFavorite;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.showToast = showToast;
window.setLoading = setLoading;
window.safeJSON = safeJSON;

document.addEventListener("DOMContentLoaded", () => {
    console.log(`${SANA_APP.name} v${SANA_APP.version} started`);
    App.init();
});
