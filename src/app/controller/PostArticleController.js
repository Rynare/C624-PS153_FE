import Quill from "quill";
import $ from "jquery";
import "@selectize/selectize";
import Swal from "sweetalert2";
import { Controller } from "./Controller.js";
import { LoginController } from "./LoginController.js";

class PostArticleController extends Controller {
  constructor() {
    super();
    this._loginState = new LoginController();
  }

  async index() {
    if (!(LoginController.currentUser.isSignedIn || JSON.parse(localStorage?.currentUser).isSignedIn)) {
      return;
    }
    await this.view("/pages/post-article.html");
    document.querySelector(".spinner-loader-container").classList.remove("d-none");

    const toolbarOptions = [
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote"],

      [{ align: [] }],
      [{ indent: "-1" }, { indent: "+1" }],

      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],

      ["link", "image", "video"],
      ["clean"],
    ];
    const options = {
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Masukkan Deskripsimu disini...",
      theme: "snow",
    };
    const quill = new Quill("#new-description", options);

    document.querySelector(".hero-container").classList.add("d-none");
    const categorySelection = document.querySelector("select#new-kategori");
    $.get(`${process.env.API_ENDPOINT}/api/articles/categories`).done((response) => {
      const { results, status } = response;
      if (status) {
        results.forEach((cat) => {
          const option = document.createElement("option");
          option.className = "text-capitalize";
          option.textContent = cat.name;
          option.setAttribute("value", cat.slug);
          categorySelection.appendChild(option);
        });
      }
      document.querySelector(".spinner-loader-container").classList.add("d-none");
    }).fail(() => {
      document.querySelector(".spinner-loader-container").classList.add("d-none");
      Swal.fire({
        title: "Error!",
        text: "Koneksi hilang, pastikan anda masih terhubung dengan internet. Jika tetap error mohon muat ulang halaman.",
        icon: "error",
        showConfirmButton: false,
        showDenyButton: true,
        denyButtonText: "Tutup",
      });
    });

    const checkSlugWrapper = document.querySelector(".post-article .new-slug-wrapper");
    checkSlugWrapper.querySelector("button.check-slug-btn").addEventListener("click", async () => {
      await isSlugAvailable(checkSlugWrapper.querySelector("input").value);
    });

    async function isNewPostValid(theFormData) {
      const isValidTitle = theFormData.get("title").trim().length >= 1;
      if (!isValidTitle) {
        document.querySelector(".post-article .new-title-wrapper input").classList.add("is-invalid");
        document.querySelector(".post-article .new-title-wrapper input").classList.remove("is-valid");
        document.querySelector(".post-article .new-title-wrapper .invalid-feedback").textContent = "Judul tidak boleh kosong.";
      } else {
        document.querySelector(".post-article .new-title-wrapper input").classList.add("is-valid");
        document.querySelector(".post-article .new-title-wrapper input").classList.remove("is-invalid");
      }
      const isValidSlug = await isSlugAvailable(theFormData.get("slug"));
      const isValidDesc = quill.getText().trim().length >= 1;
      if (!isValidDesc) {
        document.querySelector(".post-article .new-description-wrapper #new-description").classList.add(...["border-2", "border", "border-danger"]);
        document.querySelector(".post-article .new-description-wrapper #new-description").focus();
      } else {
        document.querySelector(".post-article .new-description-wrapper #new-description").classList.remove(...["border-2", "border", "border-danger"]);
      }
      return isValidSlug && isValidTitle && isValidDesc;
    }

    async function isSlugAvailable(slug) {
      const feedback = document.querySelector(".post-article .new-slug-wrapper .invalid-feedback");
      const slugElem = document.querySelector(".post-article .new-slug-wrapper input");
      if ((slug?.trim()?.length || 0) <= 0) {
        slugElem.classList.add("is-invalid");
        feedback.textContent = "Slug tidak boleh kosong.";
        slugElem.focus();
        return false;
      }
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        slugElem.classList.add("is-invalid");
        feedback.textContent = "Slug tidak valid. Aturan: tidak boleh mengandung huruf besar, tidak boleh diawali dan diakhiri tanda hubung(-), tidak mengandung underscore ( _ ), tidak boleh terdapat spasi, tidak boleh terdapat tanda hubung berturut (cara--memasak--ayam)";
        slugElem.focus();
        return false;
      }
      try {
        document.querySelector(".spinner-loader-container").classList.remove("d-none");
        const response = await fetch(`${process.env.API_ENDPOINT}/api/article-check-slug/${slug}`);
        const data = await response.json();
        const { isValid, message } = data;
        if (!isValid) {
          slugElem.classList.add("is-invalid");
          feedback.textContent = message;
          slugElem.focus();
        } else {
          slugElem.classList.remove("is-invalid");
          slugElem.classList.add("is-valid");
          feedback.textContent = "";
        }
        document.querySelector(".spinner-loader-container").classList.add("d-none");
        return isValid;
      } catch (error) {
        slugElem.classList.add("is-invalid");
        feedback.textContent = "Slug tidak tersedia.";
        slugElem.focus();
        document.querySelector(".spinner-loader-container").classList.add("d-none");
        return false;
      }
    }

    document.querySelector(".post-article .new-title-wrapper input").addEventListener("input", (evt) => {
      document.querySelector(".post-article .new-slug-wrapper input").value = evt.target.value.replaceAll(" ", "-").toLowerCase();
    });

    let isWaitingFormSubmit = false;
    const form = document.querySelector(".post-article form");
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      const formdata = new FormData(form);
      if (await isNewPostValid(formdata) && !isWaitingFormSubmit) {
        isWaitingFormSubmit = true;
        document.querySelector(".spinner-loader-container").classList.remove("d-none");
        const { userData: { id_user: userID, uid, email } } = LoginController.currentUser;
        formdata.append("description", quill.root.innerHTML);
        formdata.append("email", email);
        formdata.append("uid", uid);
        formdata.append("id_user", userID);
        $.ajax({
          url: `${process.env.API_ENDPOINT}/api/article`,
          type: "POST",
          data: formdata,
          processData: false,
          contentType: false,
          success(response) {
            const { status /* results */ } = response;
            if (status) {
              if (status) {
                Swal.fire({
                  icon: "success",
                  title: "Horeee...",
                  text: "Artikel berhasil diunggah.",
                  showConfirmButton: true,
                  confirmButtonText: "OK",
                });
              }
            }
            document.querySelector(".spinner-loader-container").classList.add("d-none");
            isWaitingFormSubmit = false;
          },
          // error(jqXHR, textStatus, errorThrown) {
          // },
        }).fail((errorResponse) => {
          document.querySelector(".spinner-loader-container").classList.add("d-none");
          isWaitingFormSubmit = false;
          Swal.fire({
            text: errorResponse?.error?.error_status || errorResponse.message || "Gagal mengunggah artikel. Periksa koneksi internet anda.",
            title: "Error",
            icon: "error",
            showConfirmButton: false,
            showDenyButton: true,
            denyButtonText: "Tutup",
          });
        });
      }
    });

    const previewImageContainer = form.querySelector(".thumbnail-preview-container");
    const previewImage = previewImageContainer.querySelector("#thumbnail-preview");
    const thumbnailAttention = form.querySelector(".thumbnail-attention");

    document.getElementById("new-thumbnail").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
          previewImageContainer.classList.remove("d-none");
          thumbnailAttention.classList.add("d-none");
        };
        reader.readAsDataURL(file);
      } else {
        previewImage.src = "./public/img/img-not-found.webp";
      }
    });

    document.querySelector("[name=thumbnail]").addEventListener("fileInvalid", (evt) => {
      const { detail } = evt;
      previewImageContainer.classList.add("d-none");
      thumbnailAttention.classList.remove("d-none");
      let elementStr = "";
      if (detail?.size) elementStr += `<p>${detail.size}</p>`;
      if (detail?.fileType) elementStr += `<p>${detail.fileType}</p>`;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        html: elementStr,
      });
    });
  }
}

export { PostArticleController };
