import Quill from "quill";
import $ from "jquery";
import "@selectize/selectize";
import { Controller } from "./Controller.js";

class KulinerController extends Controller {
  constructor() {
    super();
    this._articleLazyPage = 1;
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
    await this.view("/pages/kuliner-detail.html");

    document.querySelector(".hero-container").classList.add("d-none");

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

    const commentContainer = document.querySelector(".comment-container");
    for (let amount = 1; amount <= 5; amount++) {
      const template = document.createElement("template");
      template.innerHTML = `
        <div class="comment-items row gx-0 mb-2">
            <picture class="bg-white placeholder-wave w-25 overflow-hidden rounded-circle col"
                style="aspect-ratio: 1/1; height: 100%;">
                <img alt="" class="placeholder w-25 " style="aspect-ratio: 1/1; height: 100%;">
            </picture>
            <div class="comment-body col-10 ms-2">
                <p class="mb-0" style="line-height: 1rem;">Name</p>
                <small class="text-secondary fw-bold ">Tanggal</small>
                <p class="mb-0">Comment</p>
            </div>
        </div>
      `;
      commentContainer.appendChild(template.content.cloneNode(true));
    }
  }
}

export { KulinerController };
