import moment from "moment";
import "./comment-card.css";

const template = document.createElement("template");
template.innerHTML = `
    <div class="comment-items d-flex p-2">
        <picture class="bg-white overflow-hidden rounded-circle ">
            <img alt="" class="">
        </picture>
        <div class="comment-body ms-3 ms-sm-4 mt-1">
            <p class="mb-0 comment-username fw-bold">Name</p>
            <small class="text-secondary comment-date small">Tanggal</small>
            <p class="mb-0 comment-msg ql-editor ql-editor-output">Comment</p>
        </div>
    </div>
`;

class CommentCard extends HTMLDivElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["json-data"];
  }

  renderComment() {
    this.innerHTML = "";
    this.appendChild(template.content.cloneNode(true));

    const {
      name, datePosted, msg, profilePicture,
    } = JSON.parse(this.getAttribute("json-data"));

    this.querySelector(".comment-username").textContent = name;
    this.querySelector(".comment-date").textContent = moment(datePosted).locale("id").fromNow();
    this.querySelector(".comment-msg").innerHTML = msg;
    this.querySelector("picture img").setAttribute("src", profilePicture);
    this.querySelector("picture img").addEventListener("error", () => {
      this.querySelector("picture img").setAttribute("src", "/public/img/defaultProfilePicture.webp");
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue && name === "json-data" && newValue !== "") {
      this.renderComment();
      this.removeAttribute("json-data");
    }
  }
}
customElements.define("comment-card", CommentCard, { extends: "div" });
export { CommentCard };
