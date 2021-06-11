import { JobContract } from "@ioc:Rocketseat/Bull";
import Env from "@ioc:Adonis/Core/Env";
import nodemailer from "nodemailer";

export default class UserRegisterEmail implements JobContract {
  public key = "UserRegisterEmail";

  public async handle(job) {
    const { data } = job; // the 'data' variable has user data

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: Env.get("user"),
        pass: Env.get("pass"),
      },
    });

    let info = await transporter.sendMail({
      from: Env.get("EMAIL_FROM"), // sender address
      to: email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `
            <h1>Please use the following to activate your account</h1>
            <p>${Env.get("CLIENT_URL")}</p>
            <hr />
            <p>This email may containe sensetive information</p>
            <p>${Env.get("CLIENT_URL")}</p>
        `, // html body
    });

    return data;
  }
}
