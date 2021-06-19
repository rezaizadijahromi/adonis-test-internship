import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { TaskValidator } from "App/Validators/TaskValidator";
import Task from "../../Models/Task";

// Guide for comments
// desc => description (a little note about function)
// acc => access public | private if its public then mean user can access without authentication if its private then user must authenticate
// route => This is route we specifie in routes file

export default class TasksController {
  // desc Get all the tasks (search, pagination, sort are available)
  // acc Public
  // route api/tasks/all

  public async allTasks({ request, response }: HttpContextContract) {
    const query = request.qs();

    if (query["search"]) {
      const tasks = await Task.query().where(
        "name",
        "LIKE",
        "%" + query["search"] + "%"
      );

      response.json({
        status: "success",
        data: tasks,
      });
    } else if (query["page"]) {
      const limit = query["page_size"] || 1;
      const tasks = await Task.query()
        .from("tasks")
        .paginate(query["page"], limit);

      if (tasks.length > 0) {
        response.json({
          status: "success",
          data: tasks,
        });
      } else {
        response.notFound({
          status: "success",
          message: "No data found",
        });
      }
    } else if (query["sort"]) {
      const sort_type: any = query["sort_type"] || "asc";

      const tasks = await Task.query()
        .from("tasks")
        .orderBy(query["sort"], sort_type);

      response.json({
        status: "success",
        data: tasks,
      });
    } else {
      const tasks = await Task.all();

      if (tasks.length > 0) {
        response.json({
          status: "success",
          data: tasks,
        });
      } else {
        response.notFound({
          status: "success",
          message: "No data found",
        });
      }
    }
  }

  // desc Get a single tasks
  // acc Public
  // route api/tasks/:id

  public async getTask({ response, params }: HttpContextContract) {
    const task = await Task.find(params.id);

    if (task) {
      response.json({
        status: "success",
        data: task,
      });
    } else {
      response.notFound({
        status: "failed",
        message: `Task with id: ${params.id} not found`,
      });
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
      response.json({
        status: "success",
        data: task,
      });
    } else {
      response.unauthorized({
        status: "faield",
        message: "Not authorized",
      });
    }
  }

  // desc Edit a task
  // acc Private
  // route api/tasks/edit/:id

  public async editTask({
    request,
    response,
    auth,
    params,
  }: HttpContextContract) {
    const user = await auth.authenticate();
    const task = (await Task.find(params.id)) as Task;

    // this validator is not required

    const name = request.input("name");
    const piority = request.input("piority");

    if (user.id == task?.userId || user.isAdmin) {
      task.name = name || task.name;
      task.piority = piority || task.piority;

      await task.save();

      response.json({
        status: "success",
        data: task,
      });
    } else {
      response.badRequest({
        status: "failed",
        message: `Task with id: ${params.id} not found`,
      });
    }
  }

  // desc Delete a task
  // acc Private
  // route api/tasks/delete/:id

  public async deleteTask({ response, auth, params }: HttpContextContract) {
    const user = await auth.authenticate();

    const task = await Task.find(params.id);

    if (task) {
      if (user.id == task.userId || user.isAdmin) {
        await task.delete();

        response.json({
          status: true,
        });
      } else {
        response.unauthorized({
          status: false,
          message: "You cant delete this task",
        });
      }
    } else {
      response.notFound({
        status: "failed",
        message: "Task not found",
      });
    }
  }
}
