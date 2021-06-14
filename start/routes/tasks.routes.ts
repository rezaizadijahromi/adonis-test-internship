import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/add", "TasksController.createTaks").middleware("auth:api");
  Route.get("/all", "TasksController.allTasks");
  Route.get("/:id", "TasksController.getTask");
  Route.put("/edit/:id", "TasksController.editTask").middleware("auth:api");
  Route.delete("/delete/:id", "TasksController.deleteTask").middleware(
    "auth:api"
  );
}).prefix("api/tasks");
