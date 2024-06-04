import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { Controller } from "./Controller.js";
import { firebaseConfig } from "../Auth/FirebaseSetup.js";

class LoginController extends Controller {
  static allOAuthEntries = {};

  #moreUserDetails = {};

  #onSigninAction = () => console.log("Yeay! Kamu berhasil login.");

  #onSignoutAction = () => console.log("Yahh... Kamu telah keluar.");

  #entriesName = null;

  constructor({
    entriesName = `default-${new Date().getTime()}`,
    replaceEntriesWithSameName = false,
    extend = false,
  }) {
    super();
    this.setEntries(
      entriesName,
      (
        replaceEntriesWithSameName === true
        || replaceEntriesWithSameName === "true"
        || replaceEntriesWithSameName === 1
      ),
      extend,
    );
  }

  get onSigninAction() {
    return this.#onSigninAction;
  }

  get onSignoutAction() {
    return this.#onSignoutAction;
  }

  setEntries(name, replace, extend) {
    if (this.#entriesName === null) {
      if (LoginController.allOAuthEntries[name]) {
        if (replace) {
          LoginController.allOAuthEntries[name] = this;
        } else if (extend) {
          Object.assign(this, LoginController.allOAuthEntries[name]);
        } else {
          throw new Error(`Entry dengan nama "${name}" sudah ada.`);
        }
      } else {
        this.#entriesName = name;
        LoginController.allOAuthEntries[this.#entriesName] = this;
      }
    } else {
      throw new Error(`Tidak dapat menamai ulang! Entry sudah memiliki nama: "${this.#entriesName}".`);
    }
  }

  init() {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.onSigninAction();
      } else {
        this.onSignoutAction();
      }
    });
  }

  getCurrentUser() {
    const currentUser = getAuth().currentUser;
    const isSignedIn = !!currentUser;
    return {
      isSignedIn,
      userData: currentUser ? {
        ...this.#moreUserDetails,
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        profilePicture: currentUser.photoURL,
      } : null,
    };
  }

  setMoreUserDetails(details) {
    if (typeof details === "object") {
      Object.assign(this.#moreUserDetails, { ...details });
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
      this.#moreUserDetails = {};
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
