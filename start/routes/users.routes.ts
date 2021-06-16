import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/upload", "AuthController.uploadImage");
  Route.group(() => {
    Route.get("profile/:id", "AuthController.profile");
    Route.get("/all", "AuthController.allProfile");
    Route.put("edit/:id", "AuthController.editProfile");
    Route.delete("delete/:id", "AuthController.deleteProfile");
    Route.get("download/:fileName", "AuthController.downloadImage");
  }).middleware("auth:api");
}).prefix("api/account");
