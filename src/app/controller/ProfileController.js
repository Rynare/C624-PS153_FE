import $ from "jquery";
import Swal from "sweetalert2";

class ProfileController {
  constructor(modal = document.querySelector(".modal#my-profile")) {
    this._modal = modal;
    this._modalBody = this._modal.querySelector(".modal-body");
    this._modal.addEventListener("hidden.bs.modal", () => {
      this.defaultState();
    });
  }

  init() {
    this.onOpenModal();

    const editableContent = this._modalBody.querySelector(".is-editable");
    const editableBtn = editableContent.querySelector("label");
    const editableElem = editableContent.querySelector("[contenteditable]");
    const realInput = editableContent.querySelector("input");

    const inputFile = this._modal.querySelector("input#personal-info-picture");

    editableBtn.addEventListener("click", () => {
      document.querySelector(".personal-info input.user-display-name").value = editableElem.textContent;
      editableElem.setAttribute("contenteditable", "true");
      editableElem.focus();
      this._modal.classList.add("edited");
    });

    editableElem.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        editableElem.blur();
      }
    });

    editableElem.addEventListener("input", () => {
      const value = editableElem.textContent;
      if (!(value.length > 30)) {
        realInput.value = editableElem.textContent.trim();
      } else {
        editableElem.textContent = realInput.value;
      }
    });

    const form = this._modal.querySelector("form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const { isSignedIn, userData } = JSON.parse(localStorage?.currentUser || { isSignedIn: false, userData: {} });
      if (isSignedIn) {
        const { id_user: userID, uid, email } = userData;
        const formData = new FormData(form);
        formData.append("id_user", userID);
        formData.append("uid", uid);
        formData.append("email", email);

        $.ajax({
          url: `${process.env.API_ENDPOINT}/api/my-profile/update`,
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success(response) {
            const { status, message } = response;
            if (status) {
              Swal.fire({
                timer: 3000,
                title: message,
                icon: "success",
                position: "top-end",
                toast: true,
                showConfirmButton: false,
              });
            }
          },
          // error(jqXHR, textStatus, errorThrown) {
          // },
        }).fail((errorResponse) => {
          Swal.fire({
            timer: 3000,
            title: errorResponse?.error?.error_status || errorResponse.message || "Gagal memberikan komentar. Periksa koneksi internet anda.",
            icon: "error",
            position: "top-end",
            toast: true,
            showConfirmButton: false,
          });
        });
      }
    });

    inputFile.addEventListener("change", (event) => {
      this._modal.classList.add("edited");
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewImage = document.querySelector(".profile-img img");
          previewImage.src = e.target.result;
          previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
    inputFile.addEventListener("fileInvalid", (evt) => {
      const { detail } = evt;
      let elementStr = "";
      if (detail?.size) elementStr += `<p>${detail.size}</p>`;
      if (detail?.fileType) elementStr += `<p>${detail.fileType}</p>`;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        html: elementStr,
      });
    });
  }

  showModalBodyContent(userData) {
    this._modal.classList.remove("skelleton");
    const {
      email, name, profilePicture, totalArticleLikes, totalArticles, totalRecipeLikes, totalRecipes, uid,
    } = userData;
    document.querySelector(".profile-img img").setAttribute("src", profilePicture);
    document.querySelector(".personal-info span.user-display-name").textContent = name;
    document.querySelector(".personal-info .user-email").textContent = email;
    document.querySelector(".personal-info .user-uid").textContent = uid;
    document.querySelector(".profile-info .contribution .user-article-posted").textContent = totalArticles;
    document.querySelector(".profile-info .contribution .user-recipe-posted").textContent = totalRecipes;
    document.querySelector(".profile-info .activities .user-liked-recipe").textContent = totalRecipeLikes;
    document.querySelector(".profile-info .activities .user-liked-article").textContent = totalArticleLikes;
    // document.querySelector(".profile-info .activities .user-saved-recipe").textContent = totalArticles
    // document.querySelector(".profile-info .activities .user-saved-article").textContent = totalRecipes
  }

  defaultState() {
    this._modal.classList.remove("edited");
    this._modal.classList.add("skelleton");

    const editableElem = this._modalBody.querySelector("[contenteditable]");
    editableElem.setAttribute("contenteditable", "false");
    this._modal.classList.remove("edited");
    document.querySelector(".personal-info input.user-display-name").value = "";
    document.querySelector(".profile-content input#personal-info-picture").value = "";
  }

  onOpenModal() {
    this._modal.addEventListener("shown.bs.modal", () => {
      const { isSignedIn, userData } = JSON.parse(localStorage?.currentUser || { isSignedIn: false, userData: {} });
      if (isSignedIn) {
        const { id_user: userID, uid, email } = userData;
        $.post(`${process.env.API_ENDPOINT}/api/my-profile`, {
          id_user: userID, uid, email,
        }).done((response) => {
          const { results } = response;
          this.showModalBodyContent(results);
        }).fail((errorResponse) => {
          Swal.fire({
            timer: 3000,
            title: errorResponse?.error?.error_status || "Gagal memuat profile. Periksa koneksi internet anda.",
            icon: "error",
            position: "top-end",
            toast: true,
            showConfirmButton: false,
          });
        });
      }
    });
  }
}
export { ProfileController };
