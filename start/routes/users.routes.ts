import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("/all", "UsersController.allProfile");
  Route.get("profile/:id", "UsersController.profile");
  Route.put("edit/:id", "UsersController.editProfile");
  Route.get("download/:id", "UsersController.downloadImage");
  Route.delete("delete/:id", "UsersController.deleteProfile");
})
  .prefix("api/account")
  .middleware("auth:api");
