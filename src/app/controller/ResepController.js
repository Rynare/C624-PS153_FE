import $ from "jquery";
import Quill from "quill";
import moment from "moment";
import { Controller } from "./Controller.js";
import { LoginController } from "./LoginController.js";
import { numberToNotation } from "../../utils/helper/number-to-notation.js";

class ResepController extends Controller {
  constructor() {
    super();
    this._recipeLazyPage = 1;
    this._sortBy = "?sort=new";
    this._recipeLazyComment = 1;
  }

  async index() {
    await this.view("/pages/resep.html");
    this._recipeLazyPage = 1;

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Resep";
    heroText.innerHTML = "Bagikan resepmu disini agar mereka tahu nikmatnya masakanmu.";

    const lazyLoadObserver = new IntersectionObserver((theElements) => {
      const { isIntersecting } = theElements[0];
      if (isIntersecting && this._articleLazyPage !== "last") {
        this.renderCard();
      }
    });

    lazyLoadObserver.observe(document.querySelector(".recipe-container .loading-recipe"));
  }

  renderCard() {
    const recipeListElement = document.querySelector(".recipes-list");
    if (this._recipeLazyPage === 1) {
      recipeListElement.innerHTML = "";
    }
    $.get(`${process.env.API_ENDPOINT}/api/recipes/page/${this._recipeLazyPage}`).done((response) => {
      const { results } = response;

      results.forEach((result) => {
        const resultStr = JSON.stringify(result);
        const topRecipeCard = document.createElement("div", { is: "recipe-card" });
        topRecipeCard.classList.add(..."recipe-card position-relative rounded bg-white text-black px-0".split(" "));
        topRecipeCard.setAttribute("json-data", resultStr);
        recipeListElement.appendChild(topRecipeCard);
      });
      if (results.length <= 0) {
        this._recipeLazyPage = "last";

        document.querySelector(".recipe-container .loading-recipe").classList.add("d-none");
        document.querySelector(".recipe-container .last-recipe-message").classList.remove("d-none");
      }
    });

    if (this._recipeLazyPage !== "last") this._recipeLazyPage += 1;
  }

  async resepDetail() {
    this._recipeLazyComment = 1;
    let recipeID;
    moment.locale("id");
    await this.view("/pages/resep-detail.html");

    document.querySelector(".hero-container").classList.add("d-none");
    const recipeDetailContainer = document.querySelector(".recipe-detail-container");

    const commentOAuth = new LoginController();
    commentOAuth.setOnSigninAction(afterSignin);
    commentOAuth.setOnSignoutAction(afterSignout);
    commentOAuth.init();

    function loadCommentProfilePicture() {
      const { userData: { profilePicture, defaultProfilePicture } } = commentOAuth.getCurrentUser();
      recipeDetailContainer?.querySelector(".new-comment picture img").setAttribute("src", profilePicture || defaultProfilePicture || "public/img/img-not-found.png");
    }

    function afterSignin() {
      loadCommentProfilePicture();
    }
    function afterSignout() {
      recipeDetailContainer?.querySelector(".new-comment picture img").setAttribute("src", "public/img/defaultProfilePicture.png");
    }

    document.body.addEventListener("user-signed", () => {
      loadCommentProfilePicture();
    });
    $.get(`${process.env.API_ENDPOINT}/api/recipe/detail/${Controller.parameters.slug}?user=${commentOAuth?.getCurrentUser()?.userData?.id_user || JSON.parse(localStorage?.currentUser || "{}")?.userData?.id_user || ""}`).done((response) => {
      const { results } = response;
      const {
        _id, title, thumbnail, datePublished, description, duration, difficulty, calories, portion, ingredients, steps, tips, tags, likeCount, commentCount, authorName, isLiked,
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
        recipeDetailContainer.querySelector(".recipe-thumbnail-img img").setAttribute("src", "/public/img/img-not-found.png");
      });
      recipeDetailContainer.querySelector(".recipe-detail-body-description").innerHTML = `<p>${description}</p>`;
      recipeDetailContainer.querySelector(".comment-count").textContent = numberToNotation(commentCount || 0);
      const likeBtn = recipeDetailContainer.querySelector("span.like-button");
      likeBtn.querySelector(".like-count").textContent = numberToNotation(likeCount || 0);
      likeBtn.querySelector(".like-btn").setAttribute("is-active", isLiked);
      likeBtn.addEventListener("click", () => {
        const { isSignedIn, userData } = commentOAuth.getCurrentUser();
        if (isSignedIn) {
          const {
            id_user: userID, email, uid,
          } = userData;
          $.post(`${process.env.API_ENDPOINT}/api/recipe/like/${recipeID}`, {
            id_user: userID, email, uid,
          }).done((likeRes) => {
            likeBtn.querySelector("button.like-btn").setAttribute("is-active", likeRes.isLike);
            likeBtn.querySelector(".like-count").textContent = numberToNotation(likeRes?.likeCount || 0);
          });
        } else {
          commentOAuth.doSignin();
        }
      });
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

    document.querySelector(".new-comment-editor-container button.post-new-comment ").addEventListener("click", () => {
      const { isSignedIn, userData } = commentOAuth.getCurrentUser();
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
          })
            .fail((error) => {
              console.error("Error ketika mengirim komentar:", error);
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
    console.log(`${process.env.API_ENDPOINT}/api/recipe/comments/${recipeID}/${this._recipeLazyComment}${this._sortBy}`);
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
    });
  }
}

export { ResepController };
