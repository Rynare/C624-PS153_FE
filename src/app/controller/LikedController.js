import $ from "jquery";
import Swal from "sweetalert2";
import { Controller } from "./Controller.js";
import { LoginController } from "./LoginController.js";
import { App } from "../App.js";

class LikedController extends Controller {
  constructor() {
    super();
    this._currentPage = 1;
    this._currentQuery = `${process.env.API_ENDPOINT}/api/user/liked-recipe/${this._currentPage}`;
  }

  async recipe() {
    await this.view("/pages/recipe-liked.html");
    const recipeLikedContainer = document.querySelector(".recipe-liked-container");
    if (!LoginController.currentUser.isSignedIn) {
      const handleUserSignedIn = () => {
        if (recipeLikedContainer) {
          document.body.removeEventListener("user-signed-in", handleUserSignedIn);
          App.mainContent.innerHTML = "";
          this.recipe();
        }
      };
      document.body.addEventListener("user-signed-in", handleUserSignedIn);
      return;
    }

    this._currentPage = 1;
    this._currentQuery = `${process.env.API_ENDPOINT}/api/user/liked-recipe/${this._currentPage}`;

    const recipeListElement = recipeLikedContainer.querySelector(".recipes-list");

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Resep Disukai";
    heroText.innerHTML = "";

    const renderRecipes = () => {
      const { userData: { uid, id_user: signID, email } } = LoginController.currentUser;
      $.post(this._currentQuery, {
        uid, id_user: signID, email,
      }).done((response) => {
        if (this._currentPage === 1) {
          recipeListElement.innerHTML = "";
          document.querySelector(".recipe-liked-container .loading-recipe").classList.remove("d-none");
          document.querySelector(".recipe-liked-container .last-recipe-message").classList.add("d-none");
        }
        const { results } = response;
        if (results.length <= 0) {
          this._currentPage = "last";

          document.querySelector(".recipe-liked-container .loading-recipe").classList.add("d-none");
          document.querySelector(".recipe-liked-container .last-recipe-message").classList.remove("d-none");
        } else {
          this.renderRecipeCards(results);
          if (this._currentPage !== "last") this._currentPage += 1;
          this._currentQuery = `${process.env.API_ENDPOINT}/api/user/liked-recipe/${this._currentPage}`;
          //   if (!this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/page/${this._currentPage}`;
          //   if (this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/search/${this._keyword}/${this._currentPage}`;
        }
      }).fail((errorResponse) => {
        Swal.fire({
          title: "Error",
          showDenyButton: true,
          denyButtonText: "Tutup",
          icon: "error",
          text: errorResponse?.error?.error_status || "Gagal memuat daftar resep yang anda sukai. Periksa koneksi internet anda.",
        });
      });
    };

    renderRecipes();

    const lazyLoadObserver = new IntersectionObserver((theElements) => {
      const { isIntersecting } = theElements[0];
      if (isIntersecting && this._currentPage !== "last") {
        renderRecipes();
      }
    });

    lazyLoadObserver.observe(document.querySelector(".recipe-liked-container .loading-recipe"));
  }

  renderRecipeCards(recipes) {
    const recipeListElement = document.querySelector(".recipes-list");
    recipes.forEach((result) => {
      const recipeStr = JSON.stringify(result);
      const topRecipeCard = document.createElement("div", { is: "recipe-card" });
      topRecipeCard.classList.add(..."recipe-card position-relative rounded bg-white text-black px-0".split(" "));
      topRecipeCard.setAttribute("json-data", recipeStr);
      recipeListElement.appendChild(topRecipeCard);
    });
  }

  async article() {
    await this.view("/pages/article-liked.html");
    const articleLikedContainer = document.querySelector(".article-liked-container");
    if (!LoginController.currentUser.isSignedIn) {
      const handleUserSignedIn = () => {
        if (articleLikedContainer) {
          document.body.removeEventListener("user-signed-in", handleUserSignedIn);
          App.mainContent.innerHTML = "";
          this.article();
        }
      };
      document.body.addEventListener("user-signed-in", handleUserSignedIn);
      return;
    }

    this._currentPage = 1;
    this._currentQuery = `${process.env.API_ENDPOINT}/api/user/liked-article/${this._currentPage}`;

    const articleListElement = articleLikedContainer.querySelector(".article-post-list");

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Artikel disukai";
    heroText.innerHTML = "";

    const renderArticles = () => {
      const { userData: { uid, id_user: signID, email } } = LoginController.currentUser;
      $.post(this._currentQuery, {
        uid, id_user: signID, email,
      }).done((response) => {
        if (this._currentPage === 1) {
          articleListElement.innerHTML = "";
          document.querySelector(".article-liked-container .article-post-loading").classList.remove("d-none");
          document.querySelector(".article-liked-container .last-page-message").classList.add("d-none");
        }
        const { results } = response;
        if (results.length <= 0) {
          this._currentPage = "last";

          document.querySelector(".article-liked-container .article-post-loading").classList.add("d-none");
          document.querySelector(".article-liked-container .last-page-message").classList.remove("d-none");
        } else {
          this.renderArticleCards(results);
          if (this._currentPage !== "last") this._currentPage += 1;
          this._currentQuery = `${process.env.API_ENDPOINT}/api/user/liked-article/${this._currentPage}`;
          //   if (!this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/page/${this._currentPage}`;
          //   if (this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/recipes/search/${this._keyword}/${this._currentPage}`;
        }
      }).fail((errorResponse) => {
        Swal.fire({
          title: "Error",
          showDenyButton: true,
          denyButtonText: "Tutup",
          icon: "error",
          text: errorResponse?.error?.error_status || "Gagal memuat daftar artikel yang anda sukai. Periksa koneksi internet anda.",
        });
      });
    };

    renderArticles();

    const lazyLoadObserver = new IntersectionObserver((theElements) => {
      const { isIntersecting } = theElements[0];
      if (isIntersecting && this._currentPage !== "last") {
        renderArticles();
      }
    });

    lazyLoadObserver.observe(document.querySelector(".article-liked-container .article-post-loading"));
  }

  renderArticleCards(articles) {
    const kulinerPostList = document.querySelector(".article-post-list");
    articles.forEach((article) => {
      const articleStr = JSON.stringify(article);
      const topArticleCard = document.createElement("div", { is: "article-card" });
      topArticleCard.classList.add(..."article-card overflow-hidden rounded col p-1".split(" "));
      topArticleCard.setAttribute("json-data", articleStr);
      kulinerPostList.appendChild(topArticleCard);
    });
  }
}

export { LikedController };
