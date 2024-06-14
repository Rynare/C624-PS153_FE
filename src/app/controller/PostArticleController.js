import Quill from "quill";
import $ from "jquery";
import "@selectize/selectize";
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
    const catArr = ["tips-masak", "inspirasi-dapur", "makanan-gaya-hidup", "resep-lezat-anti-sisa"];
    catArr.forEach((cat) => {
      const option = document.createElement("option");
      option.className = "text-capitalize";
      option.textContent = cat.replaceAll("-", " ");
      option.setAttribute("value", cat);
      categorySelection.appendChild(option);
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
      const isValidCategory = catArr.includes(theFormData.get("category"));
      if (!isValidCategory) {
        document.querySelector(".post-article .new-category-wrapper select").classList.add("is-invalid");
        document.querySelector(".post-article .new-category-wrapper select").classList.remove("is-valid");
        document.querySelector(".post-article .new-category-wrapper .invalid-feedback").textContent = "Harap pilih kategori artikel.";
      } else {
        document.querySelector(".post-article .new-category-wrapper select").classList.add("is-valid");
        document.querySelector(".post-article .new-category-wrapper select").classList.remove("is-invalid");
      }
      const isValidSlug = await isSlugAvailable(theFormData.get("slug"));
      const isValidDesc = quill.getText().trim().length >= 1;
      if (!isValidDesc) {
        document.querySelector(".post-article .new-description-wrapper #new-description").classList.add(["border", "border-danger"]);
      } else {
        document.querySelector(".post-article .new-description-wrapper #new-description").classList.remove(["border", "border-danger"]);
      }
      return isValidSlug && isValidTitle && isValidCategory && isValidDesc;
    }

    async function isSlugAvailable(slug) {
      const feedback = document.querySelector(".post-article .new-slug-wrapper .invalid-feedback");
      const slugElem = document.querySelector(".post-article .new-slug-wrapper input");
      if ((slug?.trim()?.length || 0) <= 0) {
        slugElem.classList.add("is-invalid");
        feedback.textContent = "Slug tidak boleh kosong.";
        return false;
      }
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        slugElem.classList.add("is-invalid");
        feedback.textContent = "Slug tidak valid. Aturan: tidak boleh mengandung huruf besar, tidak boleh diawali dan diakhiri tanda hubung(-), tidak mengandung underscore ( _ ), tidak boleh terdapat spasi, tidak boleh terdapat tanda hubung berturut (cara--memasak--ayam)";
        return false;
      }
      try {
        const response = await fetch(`${process.env.API_ENDPOINT}/api/article-check-slug/${slug}`);
        const data = await response.json();
        const { isValid, message } = data;
        if (!isValid) {
          slugElem.classList.add("is-invalid");
          feedback.textContent = message;
        } else {
          slugElem.classList.remove("is-invalid");
          slugElem.classList.add("is-valid");
          feedback.textContent = "";
        }
        return isValid;
      } catch (error) {
        slugElem.classList.add("is-invalid");
        feedback.textContent = "Slug tidak tersedia.";
        return false;
      }
    }

    document.getElementById("new-thumbnail").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewImage = document.getElementById("thumbnail-preview");
          previewImage.src = e.target.result;
          previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });

    const form = document.querySelector(".post-article form");
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      const formdata = new FormData(form);
      if (await isNewPostValid(formdata)) {
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
            const { status, results } = response;
            if (status) {
            }
          },
          error(jqXHR, textStatus, errorThrown) {
          },
        }).fail((error) => {
        });
      }
    });
  }
}

export { PostArticleController };
