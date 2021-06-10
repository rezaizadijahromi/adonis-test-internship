/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  // Route.post("create", "AuthController.createAccount");
  // Route.get("all", "AuthController.showAll");
  // Route.put("edit/:id", "AuthController.editAccount");
  // Route.delete("delete/:id", "AuthController.deleteAccount");

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

Route.group(() => {
  Route.post("/add", "TasksController.createTaks").middleware("auth:api");
  Route.get("/all", "TasksController.allTasks");
  Route.get("/:id", "TasksController.getTask");
  Route.put("/edit/:id", "TasksController.editTask").middleware("auth:api");
  Route.delete("/delete/:id", "TasksController.deleteTask").middleware(
    "auth:api"
  );
}).prefix("api/tasks");
