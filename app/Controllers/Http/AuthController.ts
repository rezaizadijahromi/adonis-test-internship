import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import {
  UserAuthValidator,
  ResetValidator,
  passwordValidator,
  emailValidator,
} from "App/Validators/UserAuthValidator";
import Env from "@ioc:Adonis/Core/Env";

export default class AuthController {
  public async register({ request, auth }: HttpContextContract) {
    await request.validate(UserAuthValidator);

    const email = request.input("email");
    const password = request.input("password");

    const userExist = await User.findBy("email", email);

    if (!userExist) {
      const newUser = new User();
      newUser.email = email;
      newUser.password = password;

      await newUser.save();
      // do not verify the user credentials
      const token = await auth.use("api").login(newUser, {
        expiresIn: "1d",
      });

      return token.toJSON();
    } else {
      return "User already exists";
    }
  }

  public async login({ request, auth }: HttpContextContract) {
    await request.validate(passwordValidator);
    await request.validate(emailValidator);

    const email = request.input("email");
    const password = request.input("password");

    // verify the user credentials
    const token = await auth.use("api").attempt(email, password, {
      expiresIn: "1d",
    });

    return token.toJSON();
  }

  public async resetPasswordEmail({
    request,
    response,
    auth,
  }: HttpContextContract) {
    await request.validate(ResetValidator);

    const email = request.input("email");

    const user = await User.findBy("email", email);

    if (user) {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: Env.get("user"),
          pass: Env.get("pass"),
        },
      });

      const token = jwt.sign({ email: email }, Env.get("JWT_SECRET"), {
        expiresIn: "5m",
      });
      console.log(Env.get("EMAIL_FROM"));

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: Env.get("EMAIL_FROM"), // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `
            <h1>Please use the following to activate your account</h1>
            <p>${Env.get("CLIENT_URL")}/accounts/reset/${token}</p>
            <hr />
            <p>This email may containe sensetive information</p>
            <p>${Env.get("CLIENT_URL")}</p>
        `, // html body
      });

      return "Sent";
    } else {
      response.json("User not found");
    }
  }

  public async resetPassword({
    request,
    response,
    params,
    auth,
  }: HttpContextContract) {
    const token = params.token;
    await request.validate(passwordValidator);

    const newPassword = request.input("password");

    const jwtResult = jwt.verify(token, Env.get("JWT_SECRET"));

    if (jwtResult) {
      const { email } = jwt.decode(token) as any;

      if (newPassword && email) {
        const user = await User.findBy("email", email);

        if (user) {
          user.password = newPassword;
          await user.save();

          return user;
        } else {
          response.json("User not found");
        }
      }
    } else {
      response.json("Wrong data");
    }
  }

  public async profile({ request, response, params }: HttpContextContract) {
    const user = await User.find(params.id);

    if (user) {
      response.json(user);
    } else {
      response.status(404);
      throw new Error("User not found");
    }
  }

  public async allProfile({ request, response }: HttpContextContract) {
    const page = request.qs();

    if (page["page"]) {
      const limit = page["page_size"] | 1;
      const users = await User.query()
        .from("users")
        .paginate(page["page"], limit);

      if (users.length > 0) {
        response.json(users);
      } else {
        response.notFound("No users data");
      }
    } else {
      const user = await User.all();

      if (user) {
        return user;
      } else {
        response.status(404);
        response.json("No data find");
      }
    }
  }

  public async editProfile({
    request,
    response,
    auth,
    params,
  }: HttpContextContract) {
    const user = await auth.authenticate();

    await request.validate(emailValidator);
    await request.validate(passwordValidator);

    const validateOptions = {
      types: ["image"],
      size: "1mb",
    };

    const email = request.input("email");
    const password = request.input("password");

    const imageFile = request.file("image", validateOptions);
    await imageFile?.move("uploads", {
      // name: "name.jpg",
      overwrite: true,
    });

    const profile = (await User.find(params.id)) as User;

    if (user.id == params.id) {
      profile.email = email || profile.email;
      profile.password = password || profile.password;
      // storing the path of image
      profile.image = imageFile?.filePath!;

      console.log(imageFile?.filePath);

      await profile?.save();

      response.json("Profile updated");
    } else {
      response.status(400);
      throw new Error("You can't edit this user profile");
    }
  }

  public async deleteProfile({
    request,
    response,
    auth,
    params,
  }: HttpContextContract) {
    const user = await auth.authenticate();

    const profile = await User.find(params.id);

    if (user.id == params.id) {
      profile?.delete();

      // then must be logout as well
      response.json("Profile deleted");
    } else {
      response.status(400);
      throw new Error("You are not allow to delete this profile");
    }
  }

  public async uploadImage({ request, response, auth }: HttpContextContract) {
    try {
      const validateOptions = {
        types: ["image"],
        size: "1mb",
      };

      const imageFile = request.file("image", validateOptions);
      console.log(imageFile?.tmpPath);

      const name = request.only(["name"]);

      console.log(name);

      await imageFile?.move("uploads", {
        // name: "name.jpg",
        overwrite: true,
      });

      console.log(imageFile?.filePath);

      if (!imageFile) {
        return "Error accured";
      }

      return "Uploaded";
    } catch (error) {
      console.log(error);
    }
  }

  public async downloadImage({
    request,
    response,
    params,
    auth,
  }: HttpContextContract) {
    const user = await auth.authenticate();

    const filePath = `uploads/${params.fileName}`;
    const fileExist = response.download(filePath);
    // user.downloadedImages.push(filePath);
    await user.save();
  }
}

// Old tasks

//   public async createAccount({ request }: HttpContextContract) {
//     const email = request.input("email");
//     const password = request.input("password");

//     const newUSer = new User();
//     newUSer.email = email;
//     newUSer.password = password;

//     await newUSer.save();

//     return newUSer;
//   }

//   public async showAll({ request }: HttpContextContract) {
//     return await User.all();
//   }

//   public async editAccount({ request, params }: HttpContextContract) {
//     const account = await User.find(params.id);

//     if (account) {
//       account.email = request.input("email");
//       account.password = request.input("password");

//       await account.save();

//       return account;
//     }
//     return;
//   }

//   public async deleteAccount({ request, params }: HttpContextContract) {
//     const account = await User.find(params.id);

//     if (account) {
//       account.delete();

//       return "deleted";
//     }

//     return;
//   }
