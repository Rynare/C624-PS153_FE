import UrlParser from "../routes/link-parser/url-parser.js";
/* eslint-disable import/named */
import { compareUrlWithPattern } from "../routes/router.js";
import { routes } from "../routes/web.js";
import { renderView } from "../utils/helper/view-helper.js";

class App {
  static mainContent = null;

  constructor() {
    if (App.mainContent !== null) {
      throw new Error("Anda hanya bisa membuat 1 instance app");
    } else {
      App.mainContent = document.querySelector(process.env.APP_MAIN_CONTENT);
      this._listenTabIndex();
    }
  }

  async renderPage() {
    const rawCurrentPath = window.location.hash || "/";
    // pecah hash menjadi segment
    const pathSplit = UrlParser.urlSplitter(rawCurrentPath);
    const currentPath = `/${pathSplit.join("/")}`;
    // mencari rute dengan mencocokkan awalan pattern dengan awalan url, dan berdasarkan panjang segmen url & segmen pattern
    let filteredRoutes = routes.filter((cursor) => `${currentPath}/`.startsWith(`${cursor.startWith}/`) && pathSplit.length === cursor.request.segment.length);
    let doAction = null;

    if (filteredRoutes.length === 1) {
      doAction = filteredRoutes[0].action;
    } else if (filteredRoutes.length >= 2) {
      filteredRoutes = routes.filter((cursor) => compareUrlWithPattern(currentPath, cursor.pattern));
      // Jika tetap 2 maka throw error
      if (filteredRoutes.length >= 2) {
        console.error(`Multiple routes: \n\t${filteredRoutes.map((cursor) => `'${cursor.pattern}'`).join(",\n\t")}`);
        throw new Error("Multiple matching routes found.");
      }
      doAction = filteredRoutes[0].action;
    } else {
      doAction = () => renderView("/pages/404.html");
    }
    doAction();
    if (parseInt(filteredRoutes[0]?.request.parameter.length, 10) > 0) {
      filteredRoutes[0].request.putParameter();
    }
  }

  _listenTabIndex() {
    document.addEventListener("keydown", (event) => {
      const { activeElement } = document;
      const isEditable = activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";
      if (activeElement === event.target && this._isElementVisible(activeElement)) {
        if (
          (event.keyCode === 13 || event.keyCode === 32)
          && activeElement.tabIndex >= 0 && !isEditable
        ) {
          event.preventDefault();
          event.target.click();
        }
      }
    });
  }

  _isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    let isVisible = (
      rect.top >= 0
      && rect.left >= 0
      && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    const computedStyle = window.getComputedStyle(el);
    if (
      computedStyle.getPropertyValue("visibility") === "hidden"
      || computedStyle.getPropertyValue("display") === "none"
      || computedStyle.getPropertyValue("opacity") === "0"
    ) {
      isVisible = false;
    }
    return isVisible;
  }
}

export { App };
