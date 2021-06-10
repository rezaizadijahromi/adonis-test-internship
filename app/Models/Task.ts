import { DateTime } from "luxon";
import { BaseModel, belongsTo, column, hasMany } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import { BelongsTo, HasMany } from "@ioc:Adonis/Lucid/Relations";

export enum piorityStatus {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public userId: number;

  @column()
  public piority: piorityStatus;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
