import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { TaskValidator } from "App/Validators/TaskValidator";
import Task from "../../Models/Task";

export default class TasksController {
  public async allTasks({ request, response }: HttpContextContract) {
    const search = request.qs();
    const page = request.qs();

    if (search["search"]) {
      const tasks = await Task.query().where("name", search["search"]);

      response.json(tasks);
    } else if (page["page"]) {
      const limit = page["page_size"] | 1;
      const tasks = await Task.query()
        .from("tasks")
        .paginate(page["page"], limit);

      if (tasks.length > 0) {
        response.json(tasks);
      } else {
        response.notFound("No Tasks found");
      }
    } else {
      const tasks = await Task.all();

      if (tasks.length > 0) {
        response.json(tasks);
      } else {
        response.notFound("No Tasks found");
      }
    }
  }

  public async getTask({ request, response, params }: HttpContextContract) {
    const task = await Task.find(params.id);

    if (task) {
      response.json(task);
    } else {
      response.notFound(`Task with id: ${params.id} not found`);
    }
  }

  public async createTaks({ request, response, auth }: HttpContextContract) {
    const user = auth.authenticate();

    // add validator
    await request.validate(TaskValidator);

    const name = request.input("name");
    const piority = request.input("piority");

    if (user) {
      const task = new Task();
      task.name = name;
      task.piority = piority;
      task.userId = (await user).id;
      //   (await user).related("tasks").save(task);
      await task.save();
      response.json(task);
    } else {
      response.badRequest("Bad request");
    }
  }

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
