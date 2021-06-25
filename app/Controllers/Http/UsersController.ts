import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";

export default class UsersController {
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
      overwrite: true,
    });

    if (profile) {
      if (user.id == params.id || user.isAdmin) {
        profile.email = email || profile.email;
        profile.password = password || profile.password;
        // storing the path of image
        profile.image = imageFile?.filePath!;

        console.log(profile.image);

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

  // desc Download the image
  // acc Private
  // route api/account/download/:filename

  public async downloadImage({ response, params, auth }: HttpContextContract) {
    const user = await auth.authenticate();

    const filePath = `uploads//${params.id}.jpg`;
    response.download(filePath);
    await user.save();
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
}
