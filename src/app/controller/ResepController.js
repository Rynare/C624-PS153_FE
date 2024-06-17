import $ from "jquery";
import Quill from "quill";
import moment from "moment";
import Swal from "sweetalert2";
import { Controller } from "./Controller.js";
import { LoginController } from "./LoginController.js";
import { numberToNotation } from "../../utils/helper/number-to-notation.js";
import { recipeCardSkelleton } from "../components/recipe-card-skelleton.js";

class ResepController extends Controller {
  constructor() {
    super();
    this._recipeLazyPage = 1;
    this._sortBy = "?sort=new";
    this._recipeLazyComment = 1;
    this._loginController = new LoginController();
    this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/page/${this._recipeLazyPage}`;
    this.currentQuery = () => this._currentQuery;
    this._isSearching = false;
    this._keyword = "";
  }

  async index() {
    await this.view("/pages/resep.html");
    this._recipeLazyPage = 1;
    this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/page/${this._recipeLazyPage}`;

    const recipeListElement = document.querySelector(".recipe-container .recipes-list");
    for (let amount = 1; amount <= 12; amount++) {
      recipeListElement.appendChild(recipeCardSkelleton.content.cloneNode(true));
    }

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Resep";
    heroText.innerHTML = "Bagikan resepmu disini agar mereka tahu nikmatnya masakanmu.";

    const renderRecipes = () => {
      $.get(this.currentQuery()).done((response) => {
        if (this._recipeLazyPage === 1) {
          recipeListElement.innerHTML = "";
          document.querySelector(".recipe-container .loading-recipe").classList.remove("d-none");
          document.querySelector(".recipe-container .last-recipe-message").classList.add("d-none");
        }
        const { results } = response;
        if (results.length <= 0) {
          this._recipeLazyPage = "last";

          document.querySelector(".recipe-container .loading-recipe").classList.add("d-none");
          document.querySelector(".recipe-container .last-recipe-message").classList.remove("d-none");
        } else {
          this.renderCards(results);
          if (this._recipeLazyPage !== "last") this._recipeLazyPage += 1;
          if (!this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/page/${this._recipeLazyPage}`;
          if (this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/search/${this._keyword}/${this._recipeLazyPage}`;
        }
      }).fail(() => {
        Swal.fire({
          title: "Error",
          showDenyButton: true,
          denyButtonText: "Tutup",
          icon: "error",
          text: "Gagal mendapatkan data. Periksa koneksi internet anda.",
        });
      });
    };

    renderRecipes();

    const lazyLoadObserver = new IntersectionObserver((theElements) => {
      const { isIntersecting } = theElements[0];
      if (isIntersecting && this._recipeLazyPage !== "last") {
        renderRecipes();
      }
    });

    lazyLoadObserver.observe(document.querySelector(".recipe-container .loading-recipe"));

    const makeNewPostBtn = document.querySelector(".new-post-btn");
    makeNewPostBtn.addEventListener("click", () => {
      if (LoginController.currentUser.isSignedIn) {
        makeNewPostBtn.querySelector("a").click();
      } else {
        this._loginController.doSignin();
      }
    });
    const searchBar = document.querySelector(".recipe-container form.search-bar");
    searchBar.addEventListener("submit", (evt) => {
      evt.preventDefault();
      this._recipeLazyPage = 1;
      const formdata = new FormData(searchBar);
      this._keyword = formdata.get("keyword");
      if (this._keyword.trim() === "") {
        this._isSearching = false;
      } else {
        this._isSearching = true;
      }
      if (!this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/page/${this._recipeLazyPage}`;
      if (this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/search/${this._keyword}/${this._recipeLazyPage}`;
      recipeListElement.innerHTML = "";

      document.querySelector(".recipe-container .loading-recipe").classList.remove("d-none");
      document.querySelector(".recipe-container .last-recipe-message").classList.add("d-none");
    });
  }

  renderCards(recipes) {
    const recipeListElement = document.querySelector(".recipes-list");
    recipes.forEach((result) => {
      const recipeStr = JSON.stringify(result);
      const topRecipeCard = document.createElement("div", { is: "recipe-card" });
      topRecipeCard.classList.add(..."recipe-card position-relative rounded bg-white text-black px-0".split(" "));
      topRecipeCard.setAttribute("json-data", recipeStr);
      recipeListElement.appendChild(topRecipeCard);
    });
  }

  async resepDetail() {
    this._recipeLazyComment = 1;
    let recipeID;
    moment.locale("id");
    await this.view("/pages/resep-detail.html");

    document.querySelector(".hero-container").classList.add("d-none");
    const recipeDetailContainer = document.querySelector(".recipe-detail-container");

    const commentOAuth = new LoginController();
    commentOAuth.init();

    loadCommentProfilePicture();

    function loadCommentProfilePicture(signinData = (LoginController.currentUser || JSON.parse(localStorage.currentUser) || { isSignedIn: false })) {
      const { isSignedIn, userData } = signinData;
      if (isSignedIn) {
        const { profilePicture, defaultProfilePicture } = userData;
        recipeDetailContainer?.querySelector(".new-comment picture img").setAttribute("src", profilePicture || defaultProfilePicture);
      } else {
        recipeDetailContainer?.querySelector(".new-comment picture img").setAttribute("src", "public/img/img-not-found.webp");
      }
    }

    document.body.addEventListener("user-signed-in", (evt) => {
      loadCommentProfilePicture(evt.detail);
    });

    document.body.addEventListener("user-signed-out", () => {
      recipeDetailContainer?.querySelector(".new-comment picture img").setAttribute("src", "public/img/defaultProfilePicture.webp");
    });

    $.get(`${process.env.API_ENDPOINT}/api/recipe/detail/${Controller.parameters.slug}?user=${LoginController?.currentUser?.userData?.id_user || JSON.parse(localStorage?.currentUser || "{}")?.userData?.id_user || ""}`).done((response) => {
      const { results } = response;
      const {
        _id, title, thumbnail, datePublished, description, duration, difficulty, calories, portion, ingredients, steps, tips, tags, likeCount, commentCount, authorName, isLiked, authorUID,
      } = results;
      recipeID = _id;
      const badgeClass = {
        easy: "badge text-bg-success",
        low: "badge text-bg-success",
        medium: "badge text-bg-warning",
        hard: "badge text-bg-danger",
        high: "badge text-bg-danger",
      };
      recipeDetailContainer.querySelector(".recipe-title").textContent = title;
      recipeDetailContainer.querySelector(".author-name").textContent = authorName;
      recipeDetailContainer.querySelector(".date-published").textContent = moment(datePublished).format("dddd, DD MMM YYYY");
      recipeDetailContainer.querySelector(".recipe-thumbnail-img img").setAttribute("src", thumbnail);
      recipeDetailContainer.querySelector(".recipe-thumbnail-img img").addEventListener("error", () => {
        recipeDetailContainer.querySelector(".recipe-thumbnail-img img").setAttribute("src", "/public/img/img-not-found.webp");
      });
      recipeDetailContainer.querySelector(".recipe-detail-body-description").innerHTML = `<p>${description}</p>`;
      recipeDetailContainer.querySelector(".comment-count").textContent = numberToNotation(commentCount || 0);
      const likeBtn = recipeDetailContainer.querySelector("span.like-button");
      likeBtn.querySelector(".like-count").textContent = numberToNotation(likeCount || 0);
      likeBtn.querySelector(".like-btn").setAttribute("is-active", isLiked);
      likeBtn.addEventListener("click", () => {
        const { isSignedIn, userData } = LoginController.currentUser;
        if (isSignedIn) {
          const {
            id_user: userID, email, uid,
          } = userData;
          $.post(`${process.env.API_ENDPOINT}/api/recipe/like/${recipeID}`, {
            id_user: userID, email, uid,
          }).done((likeRes) => {
            likeBtn.querySelector("button.like-btn").setAttribute("is-active", likeRes.isLike);
            likeBtn.querySelector(".like-count").textContent = numberToNotation(likeRes?.likeCount || 0);
          }).fail((errorResponse) => {
            Swal.fire({
              title: "Error",
              showDenyButton: true,
              denyButtonText: "Tutup",
              icon: "error",
              text: errorResponse?.error?.error_status || "Gagal memberikan like. Periksa koneksi internet anda.",
            });
          });
        } else {
          commentOAuth.doSignin();
        }
      });
      if (LoginController.currentUser.isSignedIn || JSON.parse(localStorage?.currentUser).isSignedIn) {
        if ([(LoginController?.currentUser?.userData?.uid || -1), JSON.parse(localStorage.currentUser).userData.uid].includes(authorUID)) {
          const deleteBtn = document.querySelector(".recipe-detail-container .delete-content");
          deleteBtn.classList.remove("d-none");
          deleteBtn.addEventListener("click", () => {
            Swal.fire({
              title: "Konfirmasi",
              text: `Apakah kamu ingin menghapus ${title}?`,
              showCancelButton: true,
              confirmButtonText: "Hapus",
              cancelButtonText: "Batal",
              cancelButtonColor: "#28a745",
              confirmButtonColor: "#dc3545",
            }).then((result) => {
              if (result.isConfirmed) {
                $.ajax({
                  url: `${process.env.API_ENDPOINT}/api/recipe`,
                  type: "DELETE",
                  data: JSON.stringify({
                    id_recipe: recipeID,
                    id_user: LoginController.currentUser.userData.id_user,
                    uid: LoginController.currentUser.userData.uid,
                    email: LoginController.currentUser.userData.email,
                  }),
                  contentType: "application/json",
                  success(deletedResponse) {
                    window.location.hash = "#/resep/";
                    Swal.fire({
                      showConfirmButton: false,
                      position: "top-end",
                      toast: true,
                      timer: 3000,
                      showCloseButton: true,
                      icon: "success",
                      title: deletedResponse?.message || "Resep berhasil dihapus.",
                    });
                  },
                }).fail((errorResponse) => {
                  Swal.fire({
                    title: "Error",
                    showDenyButton: true,
                    denyButtonText: "Tutup",
                    icon: "error",
                    text: errorResponse?.error?.error_status || errorResponse?.message || "Gagal menghapus resep. Periksa koneksi internet anda.",
                  });
                });
              }
            });
          });
        }
      }
      const durationArr = duration.split(":");
      recipeDetailContainer.querySelector("table .recipe-duration").innerHTML = `:&nbsp;<span>${moment.duration({ hours: durationArr[0], minutes: durationArr[1], seconds: durationArr[2] }).humanize(true)}</span>`;
      recipeDetailContainer.querySelector("table .recipe-calories").innerHTML = `
        :&nbsp;<span class="${badgeClass[calories[0]] || "text-bg-white"}">
          ${calories[1] || "N/A"}
        </span>
      `;
      function getDifficultyDescription(diff) {
        if (diff === "easy") return "Mudah";
        if (diff === "medium") return "Sedang";
        if (diff === "hard") return "Sulit";
        return "N/A";
      }
      recipeDetailContainer.querySelector("table .recipe-difficulty").innerHTML = `
        :&nbsp;<span class="${badgeClass[difficulty]}">
          ${getDifficultyDescription(difficulty)}
        </span>
      `;
      recipeDetailContainer.querySelector(".recipe-portion").textContent = portion;
      recipeDetailContainer.querySelector(".recipe-ingredients").innerHTML = `<li>${ingredients.join("</li><li>")}</li>`;
      recipeDetailContainer.querySelector(".recipe-steps").innerHTML = `<li>${steps.join("</li><li>")}</li>`;
      if (tips.length >= 1) {
        recipeDetailContainer.querySelector(".recipe-tips").innerHTML = `<ul><li>${tips.join("</li><li>")}</li></ul>`;
      } else {
        recipeDetailContainer.querySelector(".recipe-tips").innerHTML = "<p>Tips tidak tersedia.</p>";
      }
      recipeDetailContainer.querySelector(".recipe-tags").innerHTML = `
        <span class="badge text-bg-danger">${tags.join("</span><span class=\"badge text-bg-danger\">")}</span>
      `;
      this.renderComment(recipeID);
    }).fail(() => {
      Swal.fire({
        title: "Error",
        showDenyButton: true,
        denyButtonText: "Tutup",
        icon: "error",
        text: "Gagal mendapatkan detail resep. Periksa koneksi internet anda.",
      });
    });

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote"],

      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ color: [] }, { background: [] }],

      ["clean"],
    ];
    const options = {
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Bagaimana pendapatmu...",
      theme: "snow",
    };
    const quill = new Quill("#komentar-editor", options);

    document.querySelector(".new-comment-editor-container button.post-new-comment ").addEventListener("click", () => {
      const { isSignedIn, userData } = LoginController.currentUser;
      if (isSignedIn) {
        const {
          id_user: userID, email, uid, profilePicture, displayName,
        } = userData;
        if (quill.getText().trim().length >= 1) {
          const value = quill.root.innerHTML;
          $.post(`${process.env.API_ENDPOINT}/api/recipe/comments/${recipeID}`, {
            id_user: userID, uid, email, msg: value,
          }).done((/* response */) => {
            quill.setText("");
            const commentCard = document.createElement("div", { is: "comment-card" });
            commentCard.setAttribute("json-data", JSON.stringify({
              profilePicture,
              msg: value,
              name: displayName,
            }));
            document.querySelector(".comment-container").insertBefore(commentCard, document.querySelector(".comment-container>div:nth-child(1)"));
          }).fail((errorResponse) => {
            Swal.fire({
              title: "Error",
              showDenyButton: true,
              denyButtonText: "Tutup",
              icon: "error",
              text: errorResponse?.error?.error_status || "Gagal memberikan like. Periksa koneksi internet anda.",
            });
          });
        }
      } else {
        commentOAuth.doSignin();
      }
    });

    const form = document.querySelector(".comment-sub-header form");
    form.addEventListener("change", () => {
      const formdata = new FormData(form);
      this._sortBy = formdata.get("sort-by");
      this._recipeLazyComment = 1;
      this.renderComment(recipeID);
    });

    document.getElementById("load-more").addEventListener("click", () => {
      this.renderComment(recipeID);
    });
  }

  renderComment(recipeID) {
    $.get(`${process.env.API_ENDPOINT}/api/recipe/comments/${recipeID}/${this._recipeLazyComment}${this._sortBy}`).done((response) => {
      const commentContainer = document.querySelector(".comment-container");
      if (this._recipeLazyComment === 1) {
        commentContainer.innerHTML = "";
      }
      const { results } = response;
      results?.forEach((comment) => {
        const commentCard = document.createElement("div", { is: "comment-card" });
        commentCard.setAttribute("json-data", JSON.stringify(comment));
        commentContainer.appendChild(commentCard);
      });
      if (results.length <= 0) {
        this._recipeLazyComment = "last";
        document.getElementById("load-more").classList.add("d-none");
      } else {
        document.getElementById("load-more").classList.remove("d-none");
      }
      if (this._recipeLazyComment !== "last") this._recipeLazyComment += 1;
    }).fail(() => {
      Swal.fire({
        title: "Error",
        showDenyButton: true,
        denyButtonText: "Tutup",
        icon: "error",
        text: "Gagal mendapatkan komentar lainnya. Periksa koneksi internet anda.",
      });
    });
  }
}

export { ResepController };
