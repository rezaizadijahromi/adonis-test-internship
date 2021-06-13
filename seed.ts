import users from "./seed/users";
import User from "./app/Models/User";

const importData = async () => {
  try {
    await User.deleteMany();
  } catch (error) {}
};
