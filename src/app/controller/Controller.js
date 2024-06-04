// eslint-disable-next-line import/named
import { renderView } from "../../utils/helper/view-helper.js";

class Controller {
  static request = { parameters: {} };

  static putRequestParameter(obj) {
    this.request.parameters = { ...this.request.parameters, ...obj };
  }

  static get parameters() {
    return Controller.request.parameters;
  }

  constructor() {
    if (this.constructor === Controller) {
      throw new TypeError(`Abstract class "${this.constructor.name}" cannot be instantiated directly.`);
    }
  }

  async view(viewUrl) {
    document.body.scrollIntoView({ behavior: "instant" });
    await renderView(viewUrl);
  }
}

export { Controller };
