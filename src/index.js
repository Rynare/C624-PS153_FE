// eslint-disable-next-line import/named
import $ from "jquery";
import { App } from "./app/App.js";
import { LoginController } from "./app/controller/LoginController.js";

document.addEventListener("DOMContentLoaded", () => {
  const googleOAuth = new LoginController(true);
  googleOAuth.setOnSigninAction(afterSignin);
  googleOAuth.setOnSignoutAction(afterSignout);
  googleOAuth.init();

  const app = new App();

  const loginBtns = document.querySelectorAll("nav :is(.nav-mobile,.nav-desktop) .login-btn");
  const logoutBtns = document.querySelectorAll("nav :is(.nav-mobile,.nav-desktop) .logout-btn");
  const userOptionBtns = document.querySelectorAll("nav :is(.nav-mobile,.nav-desktop) .user-option-btn");
  const profilePictureElems = document.querySelectorAll("nav :is(.nav-mobile,.nav-desktop) .sign-option .profile-picture");

  const mobileSignOption = document.querySelector(".nav-mobile .sign-option");

  loginBtns.forEach((loginBtn) => {
    loginBtn.addEventListener("click", googleOAuth.doSignin);
  });
  logoutBtns.forEach((logoutBtn) => {
    logoutBtn.addEventListener("click", googleOAuth.doSignout);
  });

  function afterSignin() {
    const {
      userData: {
        uid, displayName, email, defaultProfilePicture,
      },
    } = googleOAuth.getCurrentUser();

    $.post(
      `${process.env.API_ENDPOINT}/api/auth`,
      {
        uid,
        email,
        name: displayName,
        profilePicture: defaultProfilePicture,
      },
      (response) => {
        const { details: { id: signID, profilePicture } } = response;
        googleOAuth.setMoreUserDetails({ id_user: signID, profilePicture });

        const signinEvent = new CustomEvent("user-signed", {
          detail: {
            ...googleOAuth.getCurrentUser(),
          },
        });

        document.body.dispatchEvent(signinEvent);

        loginBtns.forEach((loginBtn) => {
          loginBtn.classList.add("d-none");
        });

        userOptionBtns.forEach((userOptionBtn) => {
          userOptionBtn.classList.remove("d-none");
        });

        mobileSignOption.querySelector(".short-info").classList.remove("d-none");
        mobileSignOption.querySelector(".short-info #signin-username").textContent = displayName;
        profilePictureElems.forEach((profilePictureElem) => {
          profilePictureElem.classList.remove("d-none");
          const img = profilePictureElem.querySelector("img");
          img.setAttribute("src", `${profilePicture}`);
          img.addEventListener("error", () => {
            img.setAttribute("src", "/public/img/defaultProfilePicture.png");
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
      const img = profilePictureElem.querySelector("img");
      profilePictureElem.classList.add("d-none");
      img.removeAttribute("src");
    });
  }

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

  let isScrollToTopVisible = false;
  document.addEventListener("scroll", () => {
    const scrollToTop = document.querySelector(".scrollToTop");
    const isTooMuchScroll = document.body.scrollTop > 70 || document.documentElement.scrollTop > 70;
    if (isTooMuchScroll) {
      if (isScrollToTopVisible === false) {
        scrollToTop.style.transform = "translateY(-60px)";
        isScrollToTopVisible = true;
      }
    } else if (!isTooMuchScroll) {
      scrollToTop.style.transform = "translateY(0)";
      if (isScrollToTopVisible === true) {
        isScrollToTopVisible = false;
      }
    }
  });
});
