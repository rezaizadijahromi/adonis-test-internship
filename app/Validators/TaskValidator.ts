import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

class TaskValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}, [rules.required()]),

    piority: schema.enum(["LOW", "MEDIUM", "HIGHT"], [rules.required()]),
  });

  public messages = {};
}

export { TaskValidator };
