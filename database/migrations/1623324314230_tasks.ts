import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Tasks extends BaseSchema {
  protected tableName = "tasks";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("name");
      table.enu("piority", ["HIGH", "MEDIUM", "LOW"]);
      table
        .integer("user_id")
        .unsigned()
        .references("users.id")
        .onDelete("CASCADE"); // delete task when user is deleted
      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
