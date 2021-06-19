import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("/all", "AuthController.allProfile");
  Route.get("profile/:id", "AuthController.profile");
  Route.put("edit/:id", "AuthController.editProfile");
  Route.get("download/:id", "AuthController.downloadImage");
  Route.delete("delete/:id", "AuthController.deleteProfile");
})
  .prefix("api/account")
  .middleware("auth:api");
