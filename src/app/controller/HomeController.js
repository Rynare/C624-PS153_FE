import { Controller } from "./Controller.js";

class HomeController extends Controller {
  constructor() {
    super();
  }

  async index() {
    await this.view("/pages/home.html");

    const recipeSlider = document.querySelector(".popular-recipes");
    const articleSlider = document.querySelector(".popular-articles");
    for (let amount = 1; amount <= 10; amount++) {
      articleSlider.innerHTML += `<div class="card placeholder-wave">
                    <div class="placeholder" style="aspect-ratio: 3/2; width: 30vw;"></div>
                </div>`;
      recipeSlider.innerHTML += `<div class="card placeholder-wave">
                    <div class="placeholder" style="aspect-ratio: 3/2; width: 30vw;"></div>
                </div>`;
    }
  }
}

export { HomeController };
