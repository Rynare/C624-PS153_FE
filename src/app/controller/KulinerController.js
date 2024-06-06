import Quill from "quill";
import $ from "jquery";
import "@selectize/selectize";
import moment from "moment";
import { Controller } from "./Controller.js";
import { numberToNotation } from "../../utils/helper/number-to-notation.js";

class KulinerController extends Controller {
  constructor() {
    super();
    this._articleLazyPage = 1;
    this._articleLazyComment = 1;
  }

  async index() {
    await this.view("/pages/kuliner.html");
    this._articleLazyPage = 1;

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Post";
    heroText.innerHTML = "Bagikan cerita tentang pengalaman kulinermu disini.";

    const lazyLoadObserver = new IntersectionObserver((theElements) => {
      const { isIntersecting } = theElements[0];
      if (isIntersecting && this._articleLazyPage !== "last") {
        this.renderCard();
      }
    });

    lazyLoadObserver.observe(document.querySelector(".kuliner-post-body .kuliner-post-loading"));

    const toolbarOptions = [
      // [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote"],

      [{ align: [] }],
      [{ indent: "-1" }, { indent: "+1" }],

      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ color: [] }, { background: [] }],
      // [{ script: "sub" }, { script: "super" }],

      ["link", "image", "video"],
      ["clean"],
    ];
    const options = {
      debug: "info",
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Masukkan Deskripsimu disini...",
      theme: "snow",
    };
    const quill = new Quill("#deskripsi-lengkap-editor", options);
    $("#select-tools").selectize({
      maxItems: null,
      valueField: "id",
      labelField: "title",
      searchField: "title",
      options: [
        { id: 1, title: "Spectrometer", url: "http://en.wikipedia.org/wiki/Spectrometers" },
        { id: 2, title: "Star Chart", url: "http://en.wikipedia.org/wiki/Star_chart" },
        { id: 3, title: "Electrical Tape", url: "http://en.wikipedia.org/wiki/Electrical_tape" },
      ],
      create: false,
    });
  }

  renderCard() {
    const kulinerPostList = document.querySelector(".kuliner-post-list");
    if (this._articleLazyPage === 1) {
      kulinerPostList.innerHTML = "";
    }
    $.get(`${process.env.API_ENDPOINT}/api/articles/page/${this._articleLazyPage}`).done((response) => {
      const { results } = response;
      results.forEach((result) => {
        const resultStr = JSON.stringify(result);
        const topArticleCard = document.createElement("div", { is: "article-card" });
        topArticleCard.classList.add(..."article-card overflow-hidden rounded col p-1".split(" "));
        topArticleCard.setAttribute("json-data", resultStr);
        kulinerPostList.appendChild(topArticleCard);
      });
      if (results.length <= 0) {
        this._articleLazyPage = "last";

        document.querySelector(".kuliner-post-body .kuliner-post-loading").classList.add("d-none");
        document.querySelector(".kuliner-post-body .last-page-message").classList.remove("d-none");
      }
    });

    if (this._articleLazyPage !== "last") this._articleLazyPage += 1;
  }

  async detail() {
    this._articleLazyComment = 1;
    await this.view("/pages/kuliner-detail.html");

    document.querySelector(".hero-container").classList.add("d-none");

    $.get(`${process.env.API_ENDPOINT}/api/article/detail/${Controller.parameters.slug}`).done((response) => {
      const { results } = response;
      const {
        author, datepublished, category: { name: categoryName }, description,
        thumbnail, title, likeCount, commentCount,
      } = results;
      const heroTitle = document.querySelector(".hero-content-wrapper h2");
      const heroText = document.querySelector(".hero-content-wrapper p");
      heroTitle.innerHTML = "";
      heroText.innerHTML = "";

      const articleDetailContainer = document.querySelector(".article-detail-container");

      const thumbnailElem = articleDetailContainer.querySelector(".article-content picture img");
      thumbnailElem.setAttribute("src", thumbnail);
      thumbnailElem.addEventListener("error", () => {
        thumbnailElem.setAttribute("src", "/public/img/img-not-found.png");
      });
      articleDetailContainer.querySelector(".article-title").textContent = title;
      articleDetailContainer.querySelector(".author-name").textContent = author;
      articleDetailContainer.querySelector(".date-published").textContent = moment(datepublished).locale("id").format("dddd, DD MMM YYYY");
      articleDetailContainer.querySelector(".article-category").textContent = categoryName;
      articleDetailContainer.querySelector(".article-detail-body-description").innerHTML = description;
      articleDetailContainer.querySelector(".like-count").textContent = `${numberToNotation(likeCount)} Like`;
      articleDetailContainer.querySelector(".comment-count").textContent = numberToNotation(commentCount);
    });

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote"],

      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ color: [] }, { background: [] }],

      ["clean"],
    ];
    const options = {
      debug: "info",
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Bagaimana pendapatmu...",
      theme: "snow",
    };
    const quill = new Quill("#komentar-editor", options);
    this.renderComment();
  }

  renderComment() {
    const commentContainer = document.querySelector(".comment-container");
    const { slug } = Controller.parameters;
    if (this._articleLazyComment === 1) {
      commentContainer.innerHTML = "";
    }
    $.get(`${process.env.API_ENDPOINT}/api/recipe/comments/${slug}/${this._articleLazyComment}`).done((response) => {
      const { results } = response;
      results?.forEach((comment) => {
        const commentCard = document.createElement("div", { is: "comment-card" });
        commentCard.setAttribute("json-data", JSON.stringify(comment));
        commentContainer.appendChild(commentCard);
      });
      if (results.length <= 0) {
        this._articleLazyComment = "last";
      }
    });

    if (this._articleLazyComment !== "last") this._articleLazyComment += 1;
  }
}

export { KulinerController };
