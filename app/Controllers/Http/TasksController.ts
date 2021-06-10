import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Task from "../../Models/Task";

export default class TasksController {
  public async allTasks({ request, response }: HttpContextContract) {
    const tasks = await Task.all();

    if (tasks.length > 0) {
      response.json(tasks);
    } else {
      response.notFound("No Tasks found");
    }
  }

  public async createTaks({ request, response, auth }: HttpContextContract) {
    const user = auth.authenticate();

    // add validator

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
}
