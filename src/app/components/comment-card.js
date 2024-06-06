import "./comment-card.css";

const template = document.createElement("template");
template.innerHTML = `
    <div class="comment-items row gx-0 mb-2">
        <picture class="bg-white placeholder-wave w-25 overflow-hidden rounded-circle col">
            <img alt="" class="placeholder w-25 ">
        </picture>
        <div class="comment-body col-10 ms-2">
            <p class="mb-0 comment-username">Name</p>
            <small class="text-secondary fw-bold comment-date">Tanggal</small>
            <p class="mb-0 comment-msg">Comment</p>
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

    const { name, datePosted, msg } = JSON.parse(this.getAttribute("json-data"));

    this.querySelector(".comment-username").textContent = name;
    this.querySelector(".comment-date").textContent = datePosted;
    this.querySelector(".comment-msg").innerHTML = msg;
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
