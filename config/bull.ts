import Env from "@ioc:Adonis/Core/Env";
import { BullConfig } from "@ioc:Rocketseat/Bull";

const bullConfig: BullConfig = {
  connection: Env.get("BULL_CONNECTION"),

  bull: {
    host: Env.get("BULL_REDIS_HOST"),
    port: Env.get("BULL_REDIS_PORT"),
    password: Env.get("BULL_REDIS_PASSWORD", ""),
    db: 0,
    keyPrefix: "",
  },
};

export default bullConfig;
