import Quill from "quill";
import $ from "jquery";
import "@selectize/selectize";
import { Controller } from "./Controller.js";

class KulinerController extends Controller {
  constructor() {
    super();
  }

  async index() {
    await this.view("/pages/kuliner.html");

    document.querySelector(".hero-container").classList.remove("d-none");

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
                    <button is="switch-button" class="like-btn">
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
