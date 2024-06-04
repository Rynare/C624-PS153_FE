// eslint-disable-next-line import/named
import $ from "jquery";
import { App } from "./app/App.js";
import { LoginController } from "./app/controller/LoginController.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();

  function getBaseUrl(url) {
    let secondSlash = false;
    const indexOf2ndSlash = url.indexOf((el) => {
      if (el === "/") {
        if (secondSlash) {
          return true;
        }
        secondSlash = true;
        return false;
      }
    });
    if (parseInt(indexOf2ndSlash, 10) >= 0) {
      if (url.slice(0, parseInt(indexOf2ndSlash, 10)) === "#/") {
        return "#/home/";
      }
      return url.slice(0, parseInt(indexOf2ndSlash, 10));
    }
    return url || "#/home/";
  }

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
    disableActiveNav();

    const hrefForSearchingComponent = getBaseUrl(new URL(window.location.href).hash);
    document.querySelector(`.nav-desktop a[href*='${hrefForSearchingComponent}']`)?.classList.add("active");
  });

  window.addEventListener("load", async () => {
    await app.renderPage();
    const hrefForSearchingComponent = getBaseUrl(new URL(window.location.href).hash);
    document.querySelector(`.nav-desktop a[href*='${hrefForSearchingComponent}']`)?.classList.add("active");
  });

  function disableActiveNav() {
    const actives = document.querySelectorAll(".nav-desktop a.nav-link.active");
    if (actives) {
      actives.forEach((active) => {
        active.classList.remove("active");
      });
    }
  }

  let prevScrollpos = window.pageYOffset;
  let scrUpVal = 0;
  window.onscroll = () => {
    const minScroll = document.querySelector("nav").clientHeight;
    const currentScrollPos = window.pageYOffset;
    if (currentScrollPos >= minScroll) {
      if (prevScrollpos > currentScrollPos) {
        document.querySelector("nav").style.top = "0";
        scrUpVal = 0;
      } else {
        if (scrUpVal <= minScroll) {
          scrUpVal += minScroll * 0.1;
        }
        document.querySelector("nav").style.top = `-${scrUpVal}px`;
      }
      prevScrollpos = currentScrollPos;
    } else {
      document.querySelector("nav").style.top = "0";
    }
  };

  const offCanvasAnchorWrapper = document.querySelector("#nav-mobile-offcanvas .offcanvas-body .nav-mobile");
  offCanvasAnchorWrapper.addEventListener("click", (evt) => {
    const { target } = evt;
    if (target.tagName === "A" && target.getAttribute("is") === "link-router") {
      const offCanvasCloseBtn = document.querySelector("#nav-mobile-offcanvas .offcanvas-header .btn-close");
      offCanvasCloseBtn.click();
    }
  });

  const googleOAuth = new LoginController({
    entriesName: "main-oauth",
  });

  googleOAuth.setOnSigninAction(afterSignin);
  googleOAuth.setOnSignoutAction(afterSignout);
  googleOAuth.init();

  const loginBtns = document.querySelectorAll("nav :is(.nav-mobile,.nav-desktop) .login-btn");
  const logoutBtns = document.querySelectorAll("nav :is(.nav-mobile,.nav-desktop) .logout-btn");
  const userOptionBtns = document.querySelectorAll("nav :is(.nav-mobile,.nav-desktop) .user-option-btn");
  const profilePictureElems = document.querySelectorAll("nav :is(.nav-mobile,.nav-desktop) .sign-option .profile-picture img");

  const mobileSignOption = document.querySelector(".nav-mobile .sign-option");
  const desktopSignOption = document.querySelector(".nav-desktop .sign-option");

  loginBtns.forEach((loginBtn) => {
    loginBtn.addEventListener("click", googleOAuth.doSignin);
  });
  logoutBtns.forEach((logoutBtn) => {
    logoutBtn.addEventListener("click", googleOAuth.doSignout);
  });

  function afterSignin() {
    const { userData } = googleOAuth.getCurrentUser();
    const {
      uid, displayName, email, profilePicture,
    } = userData;

    $.post(
      `${process.env.API_ENDPOINT}/api/auth`,
      {
        uid,
        email,
        name: displayName,
        profilePicture,
      },
      (response) => {
        const { details: { id: signID } } = response;
        googleOAuth.setMoreUserDetails({ id: signID });

        console.log(response, googleOAuth.getCurrentUser());

        loginBtns.forEach((loginBtn) => {
          loginBtn.classList.add("d-none");
        });

        userOptionBtns.forEach((userOptionBtn) => {
          userOptionBtn.classList.remove("d-none");
        });

        mobileSignOption.querySelector(".short-info").classList.remove("d-none");
        mobileSignOption.querySelector(".short-info #signin-username").textContent = displayName;

        profilePictureElems.forEach((profilePictureElem) => {
          profilePictureElem.setAttribute("src", `${profilePicture}`);
          profilePictureElem.addEventListener("error", () => {
            profilePictureElem.setAttribute("src", "/public/img/defaultProfilePicture.png");
          });
        });
      },
    ).fail((jqXHR, textStatus, errorThrown) => {
      console.log("Error:", textStatus, errorThrown);
    });
  }

  function afterSignout() {
    loginBtns.forEach((loginBtn) => {
      loginBtn.classList.remove("d-none");
    });

    userOptionBtns.forEach((userOptionBtn) => {
      userOptionBtn.classList.add("d-none");
    });

    mobileSignOption.querySelector(".short-info").classList.add("d-none");
    mobileSignOption.querySelector(".short-info #signin-username").textContent = "";

    profilePictureElems.forEach((profilePictureElem) => {
      profilePictureElem.removeAttribute("src");
    });
  }
});
