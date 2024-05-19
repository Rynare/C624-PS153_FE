class LinkRouter extends HTMLAnchorElement {
  static get observedAttributes() {
    return ["href"];
  }

  constructor() {
    super();
  }

  // eslint-disable-next-line class-methods-use-this
  connectedCallback() {
    return true;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "href" && newValue && !newValue.startsWith("#") && !newValue.endsWith("/")) {
      this.setAttribute(name, `#${newValue}/`);
    }
  }
}

customElements.define("link-router", LinkRouter, { extends: "a" });
