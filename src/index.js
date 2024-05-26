// eslint-disable-next-line import/named
import { App } from "./app/App.js";

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
    document.querySelector(`.nav-desktop a[href*='${hrefForSearchingComponent}']`)?.classList.add("active");
  });

  window.addEventListener("load", async () => {
    await app.renderPage();
    const hrefForSearchingComponent = getBaseUrl(new URL(window.location.href).hash);
    document.querySelector(`.nav-desktop a[href*='${hrefForSearchingComponent}']`)?.classList.add("active");
  });

  function disableActiveNav() {
    const actives = document.querySelectorAll(".nav-desktop a.nav-link.active");
    if (actives) {
      actives.forEach((active) => {
        active.classList.remove("active");
      });
    }
  }

  let prevScrollpos = window.pageYOffset;
  let scrUpVal = 0;
  window.onscroll = () => {
    const minScroll = document.querySelector("nav").clientHeight;
    const currentScrollPos = window.pageYOffset;
    if (currentScrollPos >= minScroll) {
      if (prevScrollpos > currentScrollPos) {
        document.querySelector("nav").style.top = "0";
        scrUpVal = 0;
      } else {
        if (scrUpVal <= minScroll) {
          scrUpVal += minScroll * 0.1;
        }
        document.querySelector("nav").style.top = `-${scrUpVal}px`;
      }
      prevScrollpos = currentScrollPos;
    } else {
      document.querySelector("nav").style.top = "0";
    }
  };

  const offCanvasAnchorWrapper = document.querySelector("#nav-mobile-offcanvas .offcanvas-body .nav-mobile");
  offCanvasAnchorWrapper.addEventListener("click", (evt) => {
    const { target } = evt;
    if (target.tagName === "A" && target.getAttribute("is") === "link-router") {
      const offCanvasCloseBtn = document.querySelector("#nav-mobile-offcanvas .offcanvas-header .btn-close");
      offCanvasCloseBtn.click();
    }
  });
});
