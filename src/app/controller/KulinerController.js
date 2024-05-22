import { Controller } from "./Controller.js";

class KulinerController extends Controller {
  constructor() {
    super();
  }

  async index() {
    await this.view("/pages/kuliner.html");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Post";
    heroText.innerHTML = "Bagikan cerita tentang pengalaman kulinermu disini.";

    const kulinerPostList = document.querySelector(".kuliner-post-list");
    for (let amount = 1; amount < 10; amount++) {
      kulinerPostList.innerHTML += `
        <div class="post-card placeholder-wave col p-1">
            <picture class="placeholder w-100 bg-white mb-2 rounded overflow-hidden" style="aspect-ratio: 1.28/1;">
                <img src="" alt="" width="100%">
            </picture>
            <div class="card-header d-flex justify-content-between row gx-0">
                <h5 class="placeholder bg-white col-8 mb-0"></h5>
                <span class="col ms-1 d-flex align-items-center gap-1">
                    <button is="switch-button">
                        <i class="bi bi-heart inactive"></i>
                        <i class="bi bi-heart-fill active"></i>
                    </button>
                    <span class="like-count text-white bg-transparent pb-1">
                        0
                    </span>
                </span>
            </div>
            <div class="card-body">
                <div class="placeholder excerpt bg-white w-100"></div>
                <div class="placeholder excerpt bg-white w-100"></div>
                <div class="placeholder excerpt bg-white w-100"></div>
            </div>
        </div>
      `;
    }
  }
}

export { KulinerController };
