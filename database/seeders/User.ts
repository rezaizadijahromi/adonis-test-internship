import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import User from "App/Models/User";
import bcrypt from "bcryptjs";

export default class UserSeeder extends BaseSeeder {
  public static developmentOnly = true;

  public async run() {
    await User.createMany([
      {
        email: "john@example.com",
        password: bcrypt.hashSync("123456", 10),
      },
      {
        email: "jane@example.com",
        password: bcrypt.hashSync("123456", 10),
      },
    ]);
  }
}
