class InputFile extends HTMLInputElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (this.getAttribute("type") === "file") {
      this.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const maxSize = +this.getAttribute("max-size") || 0;
        const maxSizeInMB = maxSize * 1024 * 1024;
        const allowedTypes = this.accept || "";
        const errorDetail = {
          detail: {},
        };
        let isFalse = false;
        if (maxSize >= 1) {
          if (file.size > maxSizeInMB) {
            errorDetail.detail = {
              ...errorDetail.detail,
              size: `File tidak boleh lebih dari ${maxSize} MB`,
            };
            // eslint-disable-next-line no-param-reassign
            event.target.value = "";
            isFalse = true;
          }
        }
        if (allowedTypes.length >= 1) {
          const allowedTypesArr = allowedTypes.split(",").map((allowedType) => allowedType.trim());
          if (!allowedTypesArr.includes(file.type)) {
            errorDetail.detail = {
              ...errorDetail.detail,
              fileType: `Hanya files dengan format ${allowedTypes} yang diizinkan.`,
            };
            // eslint-disable-next-line no-param-reassign
            event.target.value = "";
            isFalse = true;
          }
        }
        if (isFalse) {
          const sizeExceededEvent = new CustomEvent("fileInvalid", errorDetail);
          event.target.dispatchEvent(sizeExceededEvent);
        }
      });
    }
  }
}

customElements.define("input-file", InputFile, { extends: "input" });

export { InputFile };
