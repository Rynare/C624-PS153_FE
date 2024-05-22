class SwitchButton extends HTMLButtonElement {
  static get observedAttributes() {
    return ["is-active"];
  }

  constructor() {
    super();
  }

  hasChildren() {
    const hasChildren = ((this.querySelectorAll(":is(.active,.inactive)") || "").length === 2);
    if (!hasChildren) {
      throw new Error("Like button harus memiliki 2 children dengan class active dan inactive");
    }
    return true;
  }

  connectedCallback() {
    this.hasChildren();
    if (!this.hasAttribute("is-active")) {
      this.setAttribute("is-active", false);
    }
  }

  buttonSwitcher() {
    const isActive = this.getAttribute("is-active") === "true";
    if (this.hasChildren() && isActive) {
      this.querySelector(".active").style.display = "inline";
      this.querySelector(".inactive").style.display = "none";
    } else {
      this.querySelector(".active").style.display = "none";
      this.querySelector(".inactive").style.display = "inline";
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "is-active" && newValue !== oldValue) {
      this.buttonSwitcher();
    }
  }
}
customElements.define("switch-button", SwitchButton, { extends: "button" });
export default SwitchButton;
