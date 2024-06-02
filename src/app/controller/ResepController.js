import $ from "jquery";
import { Controller } from "./Controller.js";

class ResepController extends Controller {
  constructor() {
    super();
  }

  async index() {
    await this.view("/pages/resep.html");

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Resep";
    heroText.innerHTML = "Bagikan resepmu disini agar mereka tahu nikmatnya masakanmu.";
    const recipeListElement = document.querySelector(".recipes-list");

    $.get(`${process.env.API_ENDPOINT}/api/recipes/page/1`).done((response) => {
      recipeListElement.innerHTML = "";
      const { results } = response;
      results.forEach((result) => {
        const resultStr = JSON.stringify(result);
        const topRecipeCard = document.createElement("div", { is: "recipe-card" });
        topRecipeCard.classList.add(..."recipe-card position-relative rounded bg-white text-black px-0".split(" "));
        topRecipeCard.setAttribute("json-data", resultStr);
        recipeListElement.appendChild(topRecipeCard);
      });
    });
  }
}

export { ResepController };
