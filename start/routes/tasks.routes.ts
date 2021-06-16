import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/add", "TasksController.createTaks");
  Route.get("/all", "TasksController.allTasks");
  Route.get("/:id", "TasksController.getTask");
  Route.put("/edit/:id", "TasksController.editTask");
  Route.delete("/delete/:id", "TasksController.deleteTask");
})
  .prefix("api/tasks")
  .middleware("auth:api");
