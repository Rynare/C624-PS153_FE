import $ from "jquery";
import { Controller } from "./Controller.js";

class ResepController extends Controller {
  constructor() {
    super();
    this._recipeLazyPage = 1;
  }

  async index() {
    await this.view("/pages/resep.html");
    this._recipeLazyPage = 1;

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Resep";
    heroText.innerHTML = "Bagikan resepmu disini agar mereka tahu nikmatnya masakanmu.";

    const lazyLoadObserver = new IntersectionObserver((theElements) => {
      const { isIntersecting } = theElements[0];
      if (isIntersecting && this._articleLazyPage !== "last") {
        this.renderCard();
      }
    });

    lazyLoadObserver.observe(document.querySelector(".recipe-container .loading-recipe"));
  }

  renderCard() {
    const recipeListElement = document.querySelector(".recipes-list");
    if (this._recipeLazyPage === 1) {
      recipeListElement.innerHTML = "";
    }
    $.get(`${process.env.API_ENDPOINT}/api/recipes/page/${this._recipeLazyPage}`).done((response) => {
      const { results } = response;

      results.forEach((result) => {
        const resultStr = JSON.stringify(result);
        const topRecipeCard = document.createElement("div", { is: "recipe-card" });
        topRecipeCard.classList.add(..."recipe-card position-relative rounded bg-white text-black px-0".split(" "));
        topRecipeCard.setAttribute("json-data", resultStr);
        recipeListElement.appendChild(topRecipeCard);
      });
      if (results.length <= 0) {
        this._recipeLazyPage = "last";

        document.querySelector(".recipe-container .loading-recipe").classList.add("d-none");
        document.querySelector(".recipe-container .last-recipe-message").classList.remove("d-none");
      }
    });

    if (this._recipeLazyPage !== "last") this._recipeLazyPage += 1;
  }
}

export { ResepController };
