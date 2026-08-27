/* =========================================
   SANA BOUTIQUE
   NAVIGATION CONTROLLER
========================================= */

"use strict";


document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();

});


/* =========================================
   INITIALIZE NAVIGATION
========================================= */

function initializeNavigation() {

    setupNavigationLinks();

    setupPostButton();

    setActiveNavigation();

}


/* =========================================
   NAVIGATION LINKS
========================================= */

function setupNavigationLinks() {

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(item => {

        item.addEventListener("click", event => {

            const href =
                item.getAttribute("href");


            if (!href || href === "#") {

                event.preventDefault();

                return;

            }

            /*
             * Let the browser handle normal
             * navigation between pages.
             */

        });

    });

}


/* =========================================
   POST BUTTON
========================================= */

function setupPostButton() {

    const postButton =
        document.getElementById("postButton");


    if (!postButton) return;


    postButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            /*
             * The Post page will be built later.
             */

            const postPage =
                getPagePath("post.html");

            window.location.href =
                postPage;

        }
    );

}


/* =========================================
   PAGE PATH HELPER
========================================= */

function getPagePath(page) {

    const currentPath =
        window.location.pathname;


    /*
     * If we are inside /pages/
     * the path needs to stay inside
     * that folder.
     */

    if (
        currentPath.includes("/pages/")
    ) {

        return page;

    }


    return `pages/${page}`;

}


/* =========================================
   ACTIVE NAVIGATION
========================================= */

function setActiveNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");


    if (!navItems.length) return;


    const currentPage =
        getCurrentPageName();


    navItems.forEach(item => {

        const href =
            item.getAttribute("href");


        if (!href) return;


        const pageName =
            href.split("/").pop();


        item.classList.remove("active");


        if (
            pageName === currentPage ||
            (
                currentPage === "" &&
                pageName === "index.html"
            )
        ) {

            item.classList.add("active");

        }

    });

}


/* =========================================
   CURRENT PAGE
========================================= */

function getCurrentPageName() {

    const path =
        window.location.pathname;


    let page =
        path.split("/").pop();


    if (!page) {

        page = "index.html";

    }


    return page;

}


/* =========================================
   SIMPLE PAGE NAVIGATION
========================================= */

function navigateTo(page) {

    if (!page) return;


    window.location.href =
        getPagePath(page);

}


/* =========================================
   EXPOSE FUNCTIONS
========================================= */

window.navigateTo =
    navigateTo;

window.getPagePath =
    getPagePath;
