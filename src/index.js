// eslint-disable-next-line import/named
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { App } from "./app/App.js";
import "./app/components/Link-Router.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();

  function getBaseUrl(url) {
    let secondSlash = false;
    const indexOf2ndSlash = url.indexOf((el) => {
      if (el === "/") {
        if (secondSlash) {
          return true;
        }
        secondSlash = true;
        return false;
      }
    });
    if (parseInt(indexOf2ndSlash, 10) >= 0) {
      if (url.slice(0, parseInt(indexOf2ndSlash, 10)) === "#/") {
        return "#/home/";
      }
      return url.slice(0, parseInt(indexOf2ndSlash, 10));
    }
    return url || "#/home/";
  }

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
    disableActiveNav();

    const hrefForSearchingComponent = getBaseUrl(new URL(window.location.href).hash);
    document.querySelector(`.nav-desktop a[href*='${hrefForSearchingComponent}']`).classList.add("active");
  });

  window.addEventListener("load", async () => {
    await app.renderPage();
    const hrefForSearchingComponent = getBaseUrl(new URL(window.location.href).hash);
    document.querySelector(`.nav-desktop a[href*='${hrefForSearchingComponent}']`).classList.add("active");
  });

  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.querySelector(".nav-mobile");
  hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("nav-mobile-active");
  });

  function disableActiveNav() {
    const actives = document.querySelectorAll(".nav-desktop a.nav-link.active");
    if (actives) {
      actives.forEach((active) => {
        active.classList.remove("active");
      });
    }
  }
});
