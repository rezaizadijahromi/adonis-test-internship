import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import User from "App/Models/User";
import Hash from "@ioc:Adonis/Core/Hash";

export default class UserSeeder extends BaseSeeder {
  public static developmentOnly = true;

  public async run() {
    await User.createMany([
      {
        email: "john@gmail.com",
        password: "123456",
      },
      {
        email: "jane@gmail.com",
        password: "123456",
      },
    ]);
  }
}
