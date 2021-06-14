import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/upload", "AuthController.uploadImage");
  Route.get("/all", "AuthController.allProfile");
  Route.group(() => {
    Route.get("profile/:id", "AuthController.profile");
    Route.put("edit/:id", "AuthController.editProfile");
    Route.delete("delete/:id", "AuthController.deleteProfile");
    Route.get("download/:fileName", "AuthController.downloadImage");
    Route.post("/test", "AuthController.addTaskToUser");
  }).middleware("auth:api");
}).prefix("api/account");
