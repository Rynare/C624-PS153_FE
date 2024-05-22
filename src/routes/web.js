/* eslint-disable import/named */
// import { HomeController } from "../app/controller/HomeController.js";
import { HomeController } from "../app/controller/HomeController.js";
import { KulinerController } from "../app/controller/KulinerController.js";
import { LoginController } from "../app/controller/LoginController.js";
import { renderView } from "../utils/helper/view-helper.js";
import { router } from "./router.js";

const routes = [
  router(404, () => renderView("/pages/404.html")),
  router("/", [new HomeController(), "index"]),
  router("/home", [new HomeController(), "index"]),
  router("/kuliner", [new KulinerController(), "index"]),
  router("/example", [new LoginController(), "index"]),
];

export { routes };
