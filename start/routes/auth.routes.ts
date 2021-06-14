import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/register", "AuthController.register");
  Route.post("/login", "AuthController.login");
  Route.post("/reset", "AuthController.resetPasswordEmail");
  Route.put("/reset/:token", "AuthController.resetPassword");
}).middleware("auth:api");
