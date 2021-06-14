import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { TaskValidator } from "App/Validators/TaskValidator";
import Task from "../../Models/Task";

export default class TasksController {
  // desc Get all the tasks (search, pagination, sort are available)
  // acc Public
  // route api/account/upload

  public async allTasks({ request, response }: HttpContextContract) {
    const query = request.qs();

    if (query["search"]) {
      const tasks = await Task.query().where(
        "name",
        "LIKE",
        "%" + query["search"] + "%"
      );

      response.json(tasks);
    } else if (query["page"]) {
      const limit = query["page_size"] || 1;
      const tasks = await Task.query()
        .from("tasks")
        .paginate(query["page"], limit);

      if (tasks.length > 0) {
        response.json(tasks);
      } else {
        response.notFound("No Tasks found");
      }
    } else if (query["sort"]) {
      const sort_type: any = query["sort_type"] || "asc";

      const tasks = await Task.query()
        .from("tasks")
        .orderBy(query["sort"], sort_type);

      response.json(tasks);
    } else {
      const tasks = await Task.all();

      if (tasks.length > 0) {
        response.json(tasks);
      } else {
        response.notFound("No Tasks found");
      }
    }
  }

  // desc Get a single tasks
  // acc Public
  // route api/tasks/:id

  public async getTask({ request, response, params }: HttpContextContract) {
    const task = await Task.find(params.id);

    if (task) {
      response.json(task);
    } else {
      response.notFound(`Task with id: ${params.id} not found`);
    }
  }

  // desc Create a task
  // acc Private
  // route api/tasks/add

  public async createTaks({ request, response, auth }: HttpContextContract) {
    const user = auth.authenticate();

    // add validator
    await request.validate(TaskValidator);

    const validateImageOptions = {
      types: ["image"],
      size: "2mb",
    };

    const imageFile = request.file("image", validateImageOptions);
    await imageFile?.move("tasks", {
      overwrite: true,
    });

    const name = request.input("name");
    const piority = request.input("piority");

    if (user) {
      const task = new Task();
      task.name = name;
      task.piority = piority;
      task.userId = (await user).id;
      task.image = imageFile?.filePath!;
      //   (await user).related("tasks").save(task);
      await task.save();
      response.json(task);
    } else {
      response.badRequest("Bad request");
    }
  }

  // desc Edit task
  // acc Private
  // route api/tasks/edit/:id

  public async editTask({
    request,
    response,
    auth,
    params,
  }: HttpContextContract) {
    const user = await auth.authenticate();
    const task = await Task.find(params.id);

    // this validator is not required

    const name = request.input("name");
    const piority = request.input("piority");

    if (user.id == task?.userId) {
      task.name = name || task.name;
      task.piority = piority || task.piority;

      await task.save();

      response.json(task);
    } else {
      response.badRequest("You cant access this route");
    }
  }

  // desc Delete task
  // acc Private
  // route api/tasks/delete/:id

  public async deleteTask({
    request,
    response,
    auth,
    params,
  }: HttpContextContract) {
    const user = await auth.authenticate();

    const task = await Task.find(params.id);

    if (task) {
      if (user.id == task.userId) {
        await task.delete();

        response.json("Task deleted successfully");
      } else {
        response.unauthorized();
        throw new Error("you cant access this route");
      }
    } else {
      response.notFound();
      throw new Error(`Task with id: ${params.id} not found`);
    }
  }
}
