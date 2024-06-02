import "./article-card.css";
import { numberToNotation } from "../../utils/helper/number-to-notation.js";

const template = document.createElement("template");
template.innerHTML = /* html */`
    <div class="card-thumbnail">
        <picture>
            <img src="" alt="" class="article-thumbnail rounded">
        </picture>
        <div class="card-sub-thumbnail px-3 py-2 p-sm-3">
        </div>
    </div>
    <div class="card-body bg-dark px-2 py-2">
      <small class="article-category badge text-bg-warning mb-1"></small>
      <a href="" class="nav-link mt-1 mt-sm-2 mb-md-1" is="link-router">
        <h6 class="article-title pb-1 mb-0"></h6>
      </a>
      <small class="article-author text-bg-danger rounded px-2 pb-0 me-1 text-truncate d-inline-flex mb-0 gap-1">
          <i class="bi bi-person"></i>
          <span class="small text-truncate"></span>
      </small>
      <div class="article-likes text-danger badge text-bg-light">
          <i class="bi bi-heart-fill"></i>
          <span class="ms-1"></span>
      </div>    
    </div>
`;

class ArticleCard extends HTMLDivElement {
  constructor() {
    super();
  }

  renderCard() {
    this.innerHTML = "";
    this.appendChild(template.content.cloneNode(true));
    const {
      title, slug, category, thumbnail, author, likes,
    } = JSON.parse(this.getAttribute("json-data"));
    this.querySelector(".article-thumbnail").setAttribute("src", thumbnail);
    this.querySelector(".article-thumbnail").addEventListener("error", () => {
      this.querySelector(".article-thumbnail").setAttribute("src", "/public/img/img-not-found.png");
    });

    this.querySelector(".article-likes span").textContent = `${numberToNotation(likes)} Like`;
    this.querySelector(".article-title").textContent = title;
    this.querySelector("a").href = `/${slug}`;
    this.querySelector(".article-category").textContent = category.name || "Uncategorized";
    this.querySelector(".article-author span").textContent = author;
    this.querySelector("a").href = `/${slug}`;
  }

  static get observedAttributes() {
    return ["json-data"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue && name === "json-data" && newValue !== "") {
      this.renderCard();
      this.removeAttribute("json-data");
    }
  }
}

customElements.define("article-card", ArticleCard, { extends: "div" });
export default ArticleCard;
