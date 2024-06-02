import $ from "jquery";
import { Controller } from "./Controller.js";

class HomeController extends Controller {
  constructor() {
    super();
  }

  async index() {
    await this.view("/pages/home.html");

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery";
    heroText.innerHTML = "Temukan masakan khas indonesia dan bagikan pengalaman kulinermu disini.";

    const recipeSlider = document.querySelector(".popular-recipes");
    const articleSlider = document.querySelector(".popular-articles");
    for (let amount = 1; amount <= 10; amount++) {
      articleSlider.innerHTML += `
        <div class="card placeholder-glow  bg-white rounded">
            <div class="placeholder" style="aspect-ratio: 3/2; width: 30vw;max-width: 220px;"></div>
        </div>`;
      recipeSlider.innerHTML += `
        <div class="card placeholder-glow bg-white rounded">
            <div class="placeholder" style="aspect-ratio: 3/2; width: 30vw;max-width: 220px;"></div>
        </div>`;
    }

    $.get(`${process.env.API_ENDPOINT}/api/popular-recipes`).done((response) => {
      recipeSlider.innerHTML = "";
      const { results } = response;
      results.forEach((result) => {
        const resultStr = JSON.stringify(result);
        const topRecipeCard = document.createElement("div", { is: "recipe-card" });
        topRecipeCard.classList.add(..."recipe-card position-relative rounded bg-white text-black".split(" "));
        topRecipeCard.setAttribute("json-data", resultStr);
        recipeSlider.appendChild(topRecipeCard);
      });
    });

    $.get(`${process.env.API_ENDPOINT}/api/popular-articles`).done((response) => {
      articleSlider.innerHTML = "";
      const { results } = response;
      results.forEach((result) => {
        const resultStr = JSON.stringify(result);
        const topArticleCard = document.createElement("div", { is: "article-card" });
        topArticleCard.classList.add(..."article-card overflow-hidden rounded".split(" "));
        topArticleCard.setAttribute("json-data", resultStr);
        articleSlider.appendChild(topArticleCard);
      });
    });
  }
}

export { HomeController };
