import { numberToNotation } from "../../utils/helper/number-to-notation.js";
import "./recipe-card.css";

const template = document.createElement("template");
template.innerHTML = `
    <div class="card-header">
        <picture class="bg-dark-subtle rounded-top">
            <img src="" alt="" class="recipe-thumbnail">
        </picture>
        <div class="recipe-likes rounded-start-pill small">
            <i class="bi bi-heart-fill"></i>
            <span>9999</span>
        </div>
    </div>
    <div class="card-body my-2 mx-2">
        <div class="recipe-header px-1 mb-2 border-bottom border-subtle">
            <h6 class="recipe-name">Nama resep</h6>
        </div>
        <div class="recipe-sub-header d-flex flex-column row-gap-1 mx-2 mb-3 small">
            <div class="fw-semibold recipe-duration">
                <i class="bi bi-stopwatch"></i>
                <span class="ms-2">30 Menit</span>
            </div>
            <div class="fw-semibold recipe-difficulty">
                <i class="bi bi-speedometer2"></i>
                <span class="ms-2">Easy</span>
            </div>
            <div class="fw-semibold recipe-calories">
                <i class="bi bi-fire"></i>
                <span class="ms-2">0Kkal</span>
            </div>
        </div>
    </div>
    <div class="card-footer">
        <a href="" is="link-router" class="button-44 btn nav-pils text-white pt-1 rounded-pill px-4 fw-bold">Lets Cook</a>
    </div>
`;

class RecipeCard extends HTMLDivElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["json-data"];
  }

  renderCard() {
    this.innerHTML = "";
    this.appendChild(template.content.cloneNode(true));
    const {
      slug, title, thumbnail, duration,
      difficulty,
      calories, likes,
    } = JSON.parse(this.getAttribute("json-data"));

    this.querySelector(".card-footer a").setAttribute("href", `/recipe/${slug}`);
    this.querySelector(".recipe-name").textContent = title;
    this.querySelector(".recipe-thumbnail").setAttribute("src", thumbnail);
    this.querySelector(".recipe-thumbnail").addEventListener("error", () => {
      this.querySelector(".recipe-thumbnail").setAttribute("src", "/public/img/img-not-found.png");
    });

    let timeText = "";
    if (duration <= "00:30:00") {
      timeText = "30 Menit atau kurang";
    } else if (duration >= "00:30:01" && duration <= "00:45:00") {
      timeText = "30 Menit - 45Menit";
    } else if (duration >= "00:45:01" && duration <= "01:00:00") {
      timeText = "45 Menit - 1 Jam";
    } else if (duration >= "01:00:01") {
      timeText = "Lebih dari 1 Jam";
    }
    this.querySelector(".recipe-duration span").textContent = timeText;

    let diffColor = "";
    const diffText = {
      easy: "Mudah",
      medium: "Sedang",
      hard: "Sulit",
    };
    switch (difficulty) {
    case "easy":
      diffColor = "success";
      break;
    case "medium":
      diffColor = "warning";
      break;
    case "hard":
      diffColor = "danger";
      break;
    default:
      break;
    }
    this.querySelector(".recipe-difficulty span").textContent = diffText[difficulty];
    this.querySelector(".recipe-difficulty").classList.add(`text-${diffColor}`);

    if (calories.length >= 1) {
      let caloriesColor;
      switch (calories[0]) {
      case "low":
        caloriesColor = "success";
        break;
      case "medium":
        caloriesColor = "warning";
        break;
      case "high":
        caloriesColor = "danger";
        break;
      default:
        break;
      }
      this.querySelector(".recipe-calories").classList.add(`text-${caloriesColor}`);
      this.querySelector(".recipe-calories span").textContent = calories[1];
    } else {
      this.querySelector(".recipe-calories").remove();
    }
    this.querySelector(".recipe-likes span").textContent = `${numberToNotation(likes)} Like`;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue && name === "json-data" && newValue !== "") {
      this.renderCard();
      this.removeAttribute("json-data");
    }
  }
}

customElements.define("recipe-card", RecipeCard, { extends: "div" });
export default RecipeCard;
