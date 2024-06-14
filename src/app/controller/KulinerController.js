import Quill from "quill";
import $ from "jquery";
import moment from "moment";
import { Controller } from "./Controller.js";
import { numberToNotation } from "../../utils/helper/number-to-notation.js";
import { LoginController } from "./LoginController.js";
import { articleCardSkelleton } from "../components/article-card-skelleton.js";

class KulinerController extends Controller {
  constructor() {
    super();
    this._articleLazyPage = 1;
    this._articleLazyComment = 1;
    this._sortBy = "?sort=new";
    this._loginController = new LoginController();
    this._currentQuery = `${process.env.API_ENDPOINT}/api/articles/page/${this._articleLazyPage}`;
    this.currentQuery = () => this._currentQuery;
    this._isSearching = false;
    this._keyword = "";
  }

  async index() {
    await this.view("/pages/kuliner.html");
    this._articleLazyPage = 1;
    this._currentQuery = `${process.env.API_ENDPOINT}/api/articles/page/${this._articleLazyPage}`;
    const kulinerPostList = document.querySelector(".kuliner-container .kuliner-post-list");

    for (let amount = 1; amount <= 12; amount++) {
      kulinerPostList.appendChild(articleCardSkelleton.content.cloneNode(true));
    }

    document.querySelector(".hero-container").classList.remove("d-none");

    const heroTitle = document.querySelector(".hero-content-wrapper h2");
    const heroText = document.querySelector(".hero-content-wrapper p");
    heroTitle.innerHTML = "Qulinery/Post";
    heroText.innerHTML = "Bagikan cerita tentang pengalaman kulinermu disini.";

    const renderArticles = () => {
      $.get(this.currentQuery()).done((response) => {
        if (this._articleLazyPage === 1) {
          kulinerPostList.innerHTML = "";
          document.querySelector(".kuliner-post-body .kuliner-post-loading").classList.remove("d-none");
          document.querySelector(".kuliner-post-body .last-page-message").classList.add("d-none");
        }
        const { results } = response;
        if (results.length <= 0) {
          this._articleLazyPage = "last";

          document.querySelector(".kuliner-post-body .kuliner-post-loading").classList.add("d-none");
          document.querySelector(".kuliner-post-body .last-page-message").classList.remove("d-none");
        } else {
          this.renderCards(results);
          if (this._articleLazyPage !== "last") this._articleLazyPage += 1;
          if (!this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/articles/page/${this._articleLazyPage}`;
          if (this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/articles/search/${this._keyword}/${this._articleLazyPage}`;
        }
      });
    };

    renderArticles();

    const lazyLoadObserver = new IntersectionObserver((theElements) => {
      const { isIntersecting } = theElements[0];

      if (isIntersecting && this._articleLazyPage !== "last") {
        renderArticles();
      }
    });

    lazyLoadObserver.observe(document.querySelector(".kuliner-post-body .kuliner-post-loading"));

    const makeNewPostBtn = document.querySelector(".new-post-btn");
    makeNewPostBtn.addEventListener("click", () => {
      if (LoginController.currentUser.isSignedIn) {
        makeNewPostBtn.querySelector("a").click();
      } else {
        this._loginController.doSignin();
      }
    });

    const searchBar = document.querySelector(".kuliner-container form.search-bar");
    searchBar.addEventListener("submit", (evt) => {
      evt.preventDefault();
      this._articleLazyPage = 1;
      const formdata = new FormData(searchBar);
      this._keyword = formdata.get("keyword");
      if (this._keyword.trim() === "") {
        this._isSearching = false;
      } else {
        this._isSearching = true;
      }
      if (!this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/articles/page/${this._articleLazyPage}`;
      if (this._isSearching) this._currentQuery = `${process.env.API_ENDPOINT}/api/articles/search/${this._keyword}/${this._articleLazyPage}`;
      kulinerPostList.innerHTML = "";
      document.querySelector(".kuliner-post-body .kuliner-post-loading").classList.remove("d-none");
      document.querySelector(".kuliner-post-body .last-page-message").classList.add("d-none");
    });
  }

  renderCards(articles) {
    const kulinerPostList = document.querySelector(".kuliner-post-list");
    articles.forEach((article) => {
      const articleStr = JSON.stringify(article);
      const topArticleCard = document.createElement("div", { is: "article-card" });
      topArticleCard.classList.add(..."article-card overflow-hidden rounded col p-1".split(" "));
      topArticleCard.setAttribute("json-data", articleStr);
      kulinerPostList.appendChild(topArticleCard);
    });
  }

  async detail() {
    this._articleLazyComment = 1;
    let articleID;
    await this.view("/pages/kuliner-detail.html");

    document.querySelector(".hero-container").classList.add("d-none");
    const articleDetailContainer = document.querySelector(".article-detail-container");

    const commentOAuth = this._loginController;
    commentOAuth.init();

    $.get(`${process.env.API_ENDPOINT}/api/article/detail/${Controller.parameters.slug}?user=${LoginController?.currentUser?.userData?.id_user || JSON.parse(localStorage?.currentUser || "{}")?.userData?.id_user || ""}`).done((response) => {
      const { results } = response;
      const {
        authorName, datePublished, category: { name: categoryName }, description, _id,
        thumbnail, title, likeCount, commentCount, isLiked,
      } = results;
      articleID = _id;
      const heroTitle = document.querySelector(".hero-content-wrapper h2");
      const heroText = document.querySelector(".hero-content-wrapper p");
      heroTitle.innerHTML = "";
      heroText.innerHTML = "";

      const thumbnailElem = articleDetailContainer.querySelector(".article-content picture img");
      thumbnailElem.setAttribute("src", thumbnail);
      thumbnailElem.addEventListener("error", () => {
        thumbnailElem.setAttribute("src", "/public/img/img-not-found.png");
      });
      articleDetailContainer.querySelector(".article-title").textContent = title;
      articleDetailContainer.querySelector(".author-name").textContent = authorName;
      articleDetailContainer.querySelector(".date-published").textContent = moment(datePublished).locale("id").format("dddd, DD MMM YYYY");
      articleDetailContainer.querySelector(".article-category").textContent = categoryName;
      articleDetailContainer.querySelector(".article-detail-body-description").innerHTML = description;
      articleDetailContainer.querySelector(".like-count").textContent = `${numberToNotation(likeCount || 0)}`;
      articleDetailContainer.querySelector(".comment-count").textContent = numberToNotation(commentCount || 0);
      const likeBtn = document.querySelector("span.like-button");
      likeBtn.querySelector("button.like-btn").setAttribute("is-active", isLiked);

      likeBtn.addEventListener("click", () => {
        const { isSignedIn, userData } = LoginController.currentUser;
        if (isSignedIn) {
          const {
            id_user: userID, email, uid,
          } = userData;
          $.post(`${process.env.API_ENDPOINT}/api/article/like/${articleID}`, {
            id_user: userID, email, uid,
          }).done((likeRes) => {
            likeBtn.querySelector("button.like-btn").setAttribute("is-active", likeRes.isLike);
            likeBtn.querySelector(".like-count").textContent = numberToNotation(likeRes?.likeCount);
          });
        } else {
          commentOAuth.doSignin();
        }
      });

      this.renderComment(articleID);
    });

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote"],

      [{ list: "ordered" }, { list: "bullet" }],
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

    loadCommentProfilePicture();

    function loadCommentProfilePicture(signinData = (LoginController.currentUser || JSON.parse(localStorage.currentUser) || { isSignedIn: false })) {
      const { isSignedIn, userData } = signinData;
      if (isSignedIn) {
        const { profilePicture, defaultProfilePicture } = userData;
        articleDetailContainer?.querySelector(".new-comment picture img").setAttribute("src", profilePicture || defaultProfilePicture);
      } else {
        articleDetailContainer?.querySelector(".new-comment picture img").setAttribute("src", "public/img/img-not-found.png");
      }
    }

    document.body.addEventListener("user-signed-in", (evt) => {
      loadCommentProfilePicture(evt.detail);
    });

    document.body.addEventListener("user-signed-out", () => {
      articleDetailContainer?.querySelector(".new-comment picture img").setAttribute("src", "public/img/defaultProfilePicture.png");
    });

    document.querySelector(".new-comment-editor-container button.post-new-comment ").addEventListener("click", () => {
      const { isSignedIn, userData } = LoginController.currentUser;
      if (isSignedIn) {
        const {
          id_user: userID, email, uid, profilePicture, displayName,
        } = userData;
        if (quill.getText().trim().length >= 1) {
          const value = quill.root.innerHTML;
          $.post(`${process.env.API_ENDPOINT}/api/article/comments/${articleID}`, {
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
      this._articleLazyComment = 1;
      this.renderComment(articleID);
    });

    document.getElementById("load-more").addEventListener("click", () => {
      this.renderComment(articleID);
    });
  }

  renderComment(articleID) {
    $.get(`${process.env.API_ENDPOINT}/api/article/comments/${articleID}/${this._articleLazyComment}${this._sortBy}`).done((response) => {
      const commentContainer = document.querySelector(".comment-container");
      if (this._articleLazyComment === 1) {
        commentContainer.innerHTML = "";
      }
      const { results } = response;
      results?.forEach((comment) => {
        const commentCard = document.createElement("div", { is: "comment-card" });
        commentCard.setAttribute("json-data", JSON.stringify(comment));
        commentContainer.appendChild(commentCard);
      });
      if (results.length <= 0) {
        this._articleLazyComment = "last";
        document.getElementById("load-more").classList.add("d-none");
      } else {
        document.getElementById("load-more").classList.remove("d-none");
      }
      if (this._articleLazyComment !== "last") this._articleLazyComment += 1;
    });
  }
}

export { KulinerController };
