import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/add", "TasksController.createTaks").middleware("auth:api");
  Route.get("/all", "TasksController.allTasks").middleware("auth:api");
  Route.get("/:id", "TasksController.getTask").middleware("auth:api");
  Route.put("/edit/:id", "TasksController.editTask").middleware("auth:api");
  Route.delete("/delete/:id", "TasksController.deleteTask").middleware(
    "auth:api"
  );
}).prefix("api/tasks");
