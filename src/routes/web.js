/* eslint-disable import/named */
import { HomeController } from "../app/controller/HomeController.js";
import { KulinerController } from "../app/controller/KulinerController.js";
import { LikedController } from "../app/controller/LikedController.js";
import { PostArticleController } from "../app/controller/PostArticleController.js";
import { PostRecipeController } from "../app/controller/PostRecipeController.js";
import { ResepController } from "../app/controller/ResepController.js";
import { renderView } from "../utils/helper/view-helper.js";
import { router } from "./router.js";

const routes = [
  router(404, () => renderView("/pages/404.html")),
  router("/", [new HomeController(), "index"]),
  router("/home", [new HomeController(), "index"]),
  router("/artikel", [new KulinerController(), "index"]),
  router("/artikel-detail/:slug", [new KulinerController(), "detail"]),
  router("/post-article", [new PostArticleController(), "index"]),
  router("/liked-article", [new LikedController(), "article"]),
  router("/resep", [new ResepController(), "index"]),
  router("/resep-detail/:slug", [new ResepController(), "resepDetail"]),
  router("/post-recipe", [new PostRecipeController(), "index"]),
  router("/liked-recipe", [new LikedController(), "recipe"]),
];

export { routes };
