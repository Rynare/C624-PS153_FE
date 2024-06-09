import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "../Auth/FirebaseSetup.js";

class LoginController {
  static userLoginInformation = {};

  #onSigninAction = () => console.log("Yeay! Kamu berhasil login.");

  #onSignoutAction = () => console.log("Yahh... Kamu telah keluar.");

  constructor(isCore = false) {
    this.isCore = false;
    if ([false, true, 0, 1].includes(isCore)) {
      if (isCore === 1 || isCore === true) {
        this.isCore = true;
      } else {
        this.isCore = false;
      }
    } else {
      this.isCore = false;
    }
  }

  get onSigninAction() {
    return this.#onSigninAction;
  }

  get onSignoutAction() {
    return this.#onSignoutAction;
  }

  init() {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const {
          displayName, uid, email, photoURL,
        } = user;
        if (this.isCore) {
          Object.assign(LoginController.userLoginInformation, {
            displayName, uid, email, defaultProfilePicture: photoURL,
          });
        }
        await this.onSigninAction();
        localStorage.setItem("currentUser", JSON.stringify(this.getCurrentUser()));
      } else {
        if (this.isCore) {
          LoginController.userLoginInformation = {};
        }
        await this.onSignoutAction();
        localStorage.setItem("currentUser", JSON.stringify(this.getCurrentUser()));
      }
    });
  }

  getCurrentUser() {
    const currentUser = getAuth().currentUser;
    const isSignedIn = !!currentUser;
    return {
      isSignedIn,
      userData: isSignedIn ? {
        ...LoginController.userLoginInformation,
      } : null,
    };
  }

  setMoreUserDetails(details) {
    if (typeof details === "object") {
      Object.assign(LoginController.userLoginInformation, { ...details });
      localStorage.setItem("currentUser", JSON.stringify(this.getCurrentUser()));
    } else {
      throw new Error("Parameter harus berupa object");
    }
  }

  async doSignin() {
    const auth = getAuth();
    const googleProvider = new GoogleAuthProvider();

    function isMobile() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|iPad|iPhone|iPod/.test(userAgent);
    }
    try {
      if (isMobile()) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
      window.location.reload();
    } catch (error) {
      const {
        code, message, email, credential,
      } = error;
      console.error("Error ketika sign-in:", code, message, email, credential);
    }
  }

  async doSignout() {
    const auth = getAuth();
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error ketika sign-out:", error);
    }
  }

  setOnSigninAction(callback) {
    this.#onSigninAction = callback;
  }

  setOnSignoutAction(callback) {
    this.#onSignoutAction = callback;
  }
}

export { LoginController };
