import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import $ from "jquery";
import Swal from "sweetalert2";
import { firebaseConfig } from "../Auth/FirebaseSetup.js";

function afterRenderAct() {
  document.querySelector(".pizza-loader-container").classList.add("d-none");
  document.querySelector(".pizza-loader-container").style.backgroundColor = "transparent";
  document.querySelector(".pizza-loader-container").style.backdropFilter = "brightness(0.5)";
}

class LoginController {
  static currentUser = { isSignedIn: false };

  constructor(isCore = false) {
    this.isCore = Boolean(isCore);
  }

  init() {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (this.isCore) {
        if (user) {
          const {
            displayName: authDisplayName, uid: authUID, email: authEmail, photoURL: authPhotoURL,
          } = user;
          if (this.isCore) {
            $.post(
              `${process.env.API_ENDPOINT}/api/auth`,
              {
                uid: authUID,
                email: authEmail,
                name: authDisplayName,
                profilePicture: authPhotoURL,
              },
              (response) => {
                const {
                  message,
                  details: {
                    id: responseID,
                    profilePicture: responseProfilePicture,
                    name: responseName,
                    uid: responseUID,
                    email: responseEmail,
                  },
                } = response;
                LoginController.currentUser = {
                  isSignedIn: true,
                  userData: {
                    defaultProfilePicture: authPhotoURL,
                    id_user: responseID,
                    profilePicture: responseProfilePicture,
                    displayName: responseName,
                    uid: responseUID,
                    email: responseEmail,
                  },
                };

                localStorage.setItem("currentUser", JSON.stringify(LoginController.currentUser));

                const signinEvent = new CustomEvent("user-signed-in", {
                  detail: LoginController.currentUser,
                });

                document.body.dispatchEvent(signinEvent);
                Swal.fire({
                  timer: 3000,
                  title: message,
                  icon: "success",
                  position: "top-end",
                  toast: true,
                  showConfirmButton: false,
                });
                afterRenderAct();
              },
            ).fail(() => {
              Swal.fire({
                timer: 3000,
                title: "Gagal melakukan otentikasi.",
                icon: "error",
                position: "top-end",
                toast: true,
                showConfirmButton: false,
              });
            });
          }
        } else {
          LoginController.currentUser = {
            isSignedIn: false,
            userData: null,
          };
          localStorage.setItem("currentUser", JSON.stringify(LoginController.currentUser));

          const signoutEvent = new CustomEvent("user-signed-out", {
            detail: LoginController.currentUser,
          });

          document.body.dispatchEvent(signoutEvent);
          afterRenderAct();
        }
      }
    });
  }

  async doSignin() {
    const auth = getAuth();
    const googleProvider = new GoogleAuthProvider();

    const isMobile = () => /android|iPad|iPhone|iPod/.test(navigator.userAgent || navigator.vendor || window.opera);

    try {
      if (isMobile()) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      const {
        code, message, /* email, credential, */
      } = error;
      console.error(code, message);
    }
  }

  async doSignout() {
    const auth = getAuth();
    try {
      await signOut(auth);
      Swal.fire({
        timer: 3000,
        title: "Anda telah berhasil logout.",
        icon: "success",
        position: "top-end",
        toast: true,
        showConfirmButton: false,
      });
    } catch (error) {
      const {
        code, message, /* email, credential, */
      } = error;
      console.error(code, message);
    }
  }
}

export { LoginController };
