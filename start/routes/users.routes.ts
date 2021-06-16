import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("/all", "AuthController.allProfile");
  Route.get("profile/:id", "AuthController.profile");
  Route.group(() => {
    Route.put("edit/:id", "AuthController.editProfile");
    Route.get("download/:id", "AuthController.downloadImage");
    Route.delete("delete/:id", "AuthController.deleteProfile");
  }).middleware("auth:api");
}).prefix("api/account");
