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
import Bull from "bull";

// Guide for comments
// desc => description (a little note about function)
// acc => access public | private if its public then mean user can access without authentication if its private then user must authenticate
// route => This is route we specifie in routes file

export default class AuthController {
  // desc Register a user
  // acc public
  // route api/account/register

  public async register({ request }: HttpContextContract) {
    await request.validate(UserAuthValidator);

    const email = request.input("email");
    const password = request.input("password");

    const userExist = await User.findBy("email", email);

    if (!userExist) {
      const newUser = new User();
      newUser.email = email;
      newUser.password = password;

      await newUser.save();

      const myFirstQueue = new Bull("send-email", {
        redis: {
          host: "127.0.0.1",
          port: 6379,
        },
      });

      const options = {
        delay: 100, // 10 sec in ms
        attempts: 2,
      };

      const data = {
        email: email,
      };

      myFirstQueue.add(data, options);

      myFirstQueue.process(async (job) => {
        return await sendMail(job.data.email);
      });

      function sendMail(email) {
        return new Promise((resolve, reject) => {
          let mailOptions = {
            from: "rezaizadij2000@gmail.com",
            to: email,
            subject: "Register",
            text: `Welcom user ${email}`,
          };
          let mailConfig = {
            service: "gmail",
            auth: {
              user: Env.get("user"),
              pass: Env.get("pass"),
            },
          };
          nodemailer
            .createTransport(mailConfig)
            .sendMail(mailOptions, (err, info) => {
              if (err) {
                reject(err);
              } else {
                resolve(info);
              }
            });
        });
      }

      return newUser;
    } else {
      return "User already exists";
    }
  }

  // desc Login a user
  // acc public
  // route api/account/login

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

  // desc Sending email with token in url
  // acc public
  // route api/account/reset

  public async resetPasswordEmail({ request, response }: HttpContextContract) {
    await request.validate(ResetValidator);

    const email = request.input("email");

    const user = await User.findBy("email", email);

    if (user) {
      nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: Env.get("user"),
          pass: Env.get("pass"),
        },
      });

      jwt.sign({ email: email }, Env.get("JWT_SECRET"), {
        expiresIn: "5m",
      });
      console.log(Env.get("EMAIL_FROM"));

      // send mail with defined transport object

      return "Sent";
    } else {
      response.json("User not found");
    }
  }

  // desc Reset password
  // acc public
  // route api/account/reset/:token

  public async resetPassword({
    request,
    response,
    params,
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

  // desc See users profile
  // acc public
  // route api/account/profile/:id

  public async profile({ response, params }: HttpContextContract) {
    const user = await User.find(params.id);

    if (user) {
      response.json(user);
    } else {
      response.status(404);
      throw new Error("User not found");
    }
  }

  // desc Get all users
  // acc public
  // route api/account/profile/:id

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

  // desc Edit profile
  // acc Private
  // route api/account/profile/edit/:id

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

  // desc Delete profile
  // acc Private
  // route api/account/profile/delete/:id

  public async deleteProfile({ response, auth, params }: HttpContextContract) {
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

  // desc Test for upload image
  // acc Public
  // route api/account/upload

  public async uploadImage({ request }: HttpContextContract) {
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

  // desc Download the image
  // acc Private
  // route api/account/download/:filename

  public async downloadImage({ response, params, auth }: HttpContextContract) {
    const user = await auth.authenticate();

    const filePath = `uploads/${params.fileName}`;
    response.download(filePath);
    await user.save();
  }
}
