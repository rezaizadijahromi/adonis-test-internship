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

  public async register({ request, response }: HttpContextContract) {
    await request.validate(UserAuthValidator);

    const email = request.input("email");
    const password = request.input("password");
    const isAdmin = request.input("isAdmin");

    const userExist = await User.findBy("email", email);

    if (!userExist) {
      const newUser = new User();
      newUser.email = email;
      newUser.password = password;
      newUser.isAdmin = isAdmin;

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

      response.json({
        status: "success",
        data: newUser,
      });
    } else {
      response.json({
        status: "failed",
        message: "User already exist",
      });
    }
  }

  // desc Login a user
  // acc public
  // route api/account/login

  public async login({ request, auth, response }: HttpContextContract) {
    await request.validate(passwordValidator);
    await request.validate(emailValidator);

    const email = request.input("email");
    const password = request.input("password");

    // verify the user credentials
    const token = await auth.use("api").attempt(email, password, {
      expiresIn: "1d",
    });

    if (token) {
      response.json({
        status: "success",
        data: {
          token: {
            type: token.type,
            token: token.token,
          },
        },
      });
    }
  }

  // desc Sending email with token in url
  // acc public
  // route api/account/reset

  public async resetPasswordEmail({ request, response }: HttpContextContract) {
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

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: Env.get("EMAIL_FROM"), // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `
            <h1>Please enter the link to navigate you for changing a password</h1>
            <p>${Env.get("CLIENT_URL")}/accounts/reset/${token}</p>
            <hr />
            <p>This email may containe sensetive information</p>
            <p>${Env.get("CLIENT_URL")}</p>
        `, // html body
      });

      response.json({
        status: "sucess",
        message: `Email send to ${email}`,
      });
    } else {
      response.json({
        status: "failed",
        message: "User not found",
      });
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

          response.json({
            status: "success",
            data: user,
          });
        } else {
          response.json({
            status: "failed",
            message: "User not found",
          });
        }
      }
    } else {
      response.json({
        status: "failed",
        message: "Token is expired",
      });
    }
  }

  // desc See users profile
  // acc public
  // route api/account/profile/:id

  public async profile({ response, params }: HttpContextContract) {
    const user = await User.find(params.id);

    if (user) {
      response.json({
        status: "sucess",
        data: user,
      });
    } else {
      response.status(404);
      response.json({
        status: "failed",
        message: `User with id ${params.id} not found`,
      });
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
        response.json({
          status: "success",
          data: users,
        });
      } else {
        response.notFound({
          status: "sucess",
          message: "No data found",
        });
      }
    } else {
      const users = await User.all();

      if (users) {
        response.json({
          status: "success",
          data: users,
        });
      } else {
        response.notFound({
          status: "sucess",
          message: "No data found",
        });
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
    const profile = (await User.find(params.id)) as User;

    const imageFile = request.file("image", validateOptions);
    await imageFile?.move("uploads", {
      name: `${profile.id}.jpg`,
    });

    if (profile) {
      if (user.id == params.id || user.isAdmin) {
        profile.email = email || profile.email;
        profile.password = password || profile.password;
        // storing the path of image
        profile.image = imageFile?.filePath!;

        const user = await profile?.save();

        response.json({
          status: "sucess",
          data: user,
        });
      } else {
        response.json({
          status: "failed",
          message: "You can't edit this user profile",
        });
      }
    } else {
      response.notFound({
        status: "failed",
        message: `User with id ${params.id} not found`,
      });
    }
  }

  // desc Delete profile
  // acc Private
  // route api/account/profile/delete/:id

  public async deleteProfile({ response, auth, params }: HttpContextContract) {
    const user = await auth.authenticate();

    const profile = await User.find(params.id);

    if (profile) {
      if (user.id == params.id || user.isAdmin) {
        profile?.delete();

        // then must be logout as well
        response.json({
          status: true,
          message: "Profile deleted",
        });
      } else {
        response.json({
          status: false,
          message: "You can't delete this user profile",
        });
      }
    } else {
      response.notFound({
        status: "failed",
        message: `User with id ${params.id} not found`,
      });
    }
  }

  // desc Download the image
  // acc Private
  // route api/account/download/:filename

  public async downloadImage({ response, params, auth }: HttpContextContract) {
    const user = await auth.authenticate();

    const filePath = `uploads//${params.id}.jpg`;
    response.download(filePath);
    await user.save();
  }
}
