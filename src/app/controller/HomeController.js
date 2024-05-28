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
        <div class="card placeholder-wave">
            <div class="placeholder" style="aspect-ratio: 3/2; width: 30vw;max-width: 220px;"></div>
        </div>`;
      recipeSlider.innerHTML += `
        <div class="card placeholder-wave">
            <div class="placeholder" style="aspect-ratio: 3/2; width: 30vw;max-width: 220px;"></div>
        </div>`;
    }
  }
}

export { HomeController };
