import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/register", "AuthController.register");
  Route.post("/login", "AuthController.login");
  Route.post("/reset", "AuthController.resetPasswordEmail");
  Route.put("/reset/:token", "AuthController.resetPassword");
  Route.post("/upload", "AuthController.uploadImage");
  Route.get("/all", "AuthController.allProfile");
  Route.group(() => {
    Route.get("profile/:id", "AuthController.profile");
    Route.put("edit/:id", "AuthController.editProfile");
    Route.delete("delete/:id", "AuthController.deleteProfile");
    Route.get("download/:fileName", "AuthController.downloadImage");
  }).middleware("auth:api");
}).prefix("api/account");
