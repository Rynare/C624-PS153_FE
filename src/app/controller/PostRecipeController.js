import Quill from "quill";
import $ from "jquery";
import "@selectize/selectize";
import Tagify from "@yaireo/tagify";
import Sortable from "sortablejs";
import Swal from "sweetalert2";
import { Controller } from "./Controller.js";
import { LoginController } from "./LoginController.js";

class PostRecipeController extends Controller {
  constructor() {
    super();
    this._loginState = new LoginController();
  }

  async index() {
    if (!(this._loginState.getCurrentUser().isSignedIn || JSON.parse(localStorage?.currentUser).isSignedIn)) {
      return;
    }
    await this.view("/pages/post-recipe.html");

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

    const checkSlugWrapper = document.querySelector(".post-recipe .new-slug-wrapper");
    checkSlugWrapper.querySelector("button.check-slug-btn").addEventListener("click", async () => {
      await isSlugAvailable(checkSlugWrapper.querySelector("input").value);
    });

    async function isNewPostValid(theFormData) {
      const isValidTitle = theFormData.get("title").trim().length >= 1;
      if (!isValidTitle) {
        document.querySelector(".post-recipe .new-title-wrapper input").classList.add("is-invalid");
        document.querySelector(".post-recipe .new-title-wrapper input").classList.remove("is-valid");
        document.querySelector(".post-recipe .new-title-wrapper .invalid-feedback").textContent = "Judul tidak boleh kosong.";
      } else {
        document.querySelector(".post-recipe .new-title-wrapper input").classList.add("is-valid");
        document.querySelector(".post-recipe .new-title-wrapper input").classList.remove("is-invalid");
      }
      const isValidSlug = await isSlugAvailable(theFormData.get("slug"));
      const isValidDesc = quill.getText().trim().length >= 1;
      if (!isValidDesc) {
        document.querySelector(".post-recipe .new-description-wrapper #new-description").classList.add(["border", "border-danger"]);
      } else {
        document.querySelector(".post-recipe .new-description-wrapper #new-description").classList.remove(["border", "border-danger"]);
      }
      return isValidSlug && isValidTitle && isValidDesc;
    }

    async function isSlugAvailable(slug) {
      const feedback = document.querySelector(".post-recipe .new-slug-wrapper .invalid-feedback");
      const slugElem = document.querySelector(".post-recipe .new-slug-wrapper input");
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
        const response = await fetch(`${process.env.API_ENDPOINT}/api/recipe-check-slug/${slug}`);
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

    const form = document.querySelector(".post-recipe form");
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      const formdata = new FormData(form);
      if (await isNewPostValid(formdata)) {
        const { userData: { id_user: userID, uid, email } } = this._loginState.getCurrentUser();
        formdata.append("description", quill.root.innerHTML);
        formdata.append("email", email);
        formdata.append("uid", uid);
        formdata.append("id_user", userID);
        formdata.set("tips", makeStringifiedArrayFromFormData(formdata.get("tips")));
        formdata.set("tags", makeStringifiedArrayFromFormData(formdata.get("tags")));
        formdata.set("steps", makeStringifiedArrayFromFormData(formdata.get("steps")));
        formdata.set("ingredients", makeStringifiedArrayFromFormData(formdata.get("ingredients")));
        $.ajax({
          url: `${process.env.API_ENDPOINT}/api/recipe`,
          type: "POST",
          data: formdata,
          processData: false,
          contentType: false,
          success(response) {
            const { status, results } = response;
            if (status) {
              console.log(results);
            }
          },
          error(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
          },
        }).fail((error) => {
          console.log(error);
        });
      }
    });

    function makeStringifiedArrayFromFormData(field) {
      const fieldArrObj = JSON.parse(field);
      const valuesArray = fieldArrObj.map((item) => item.value);
      return JSON.stringify(valuesArray);
    }

    ["ingredients", "steps", "tips", "tags"].forEach((inputField) => {
      const inputFieldElem = document.querySelector(`input[name=${inputField}]`);
      const inputFieldTagify = new Tagify(inputFieldElem);
      const el = document.querySelector(`.new-${inputField}-wrapper tags.tagify`);
      Sortable.create(el, {
        onSort() {
          inputFieldTagify.updateValueByDOMTags();
        },
      });
    });

    document.querySelector("[name=thumbnail]").addEventListener("fileInvalid", (evt) => {
      const { detail } = evt;
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

export { PostRecipeController };
