import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

class UserAuthValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [
      rules.email(),
      rules.required(),
      rules.unique({ table: "users", column: "email" }),
    ]),
    password: schema.string({}, [
      rules.required(),
      rules.minLength(3),
      rules.maxLength(255),
    ]),
  });

  public messages = {};
}

class ResetValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email(), rules.required()]),
  });
}

class passwordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    password: schema.string({}, [rules.minLength(3), rules.maxLength(255)]),
  });
}

class emailValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
  });
}

export { UserAuthValidator, ResetValidator, passwordValidator, emailValidator };

/*
 * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
 *
 * For example:
 * 1. The username must be of data type string. But then also, it should
 *    not contain special characters or numbers.
 *    ```
 *     schema.string({}, [ rules.alpha() ])
 *    ```
 *
 * 2. The email must be of data type string, formatted as a valid
 *    email. But also, not used by any other user.
 *    ```
 *     schema.string({}, [
 *       rules.email(),
 *       rules.unique({ table: 'users', column: 'email' }),
 *     ])
 *    ```
 */

/**
 * Custom messages for validation failures. You can make use of dot notation `(.)`
 * for targeting nested fields and array expressions `(*)` for targeting all
 * children of an array. For example:
 *
 * {
 *   'profile.username.required': 'Username is required',
 *   'scores.*.number': 'Define scores as valid numbers'
 * }
 *
 */
