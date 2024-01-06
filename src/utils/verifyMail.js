import { User } from "../models/userModel.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

async function verifyEmail(userEmail, emailType, userId) {
  try {
    console.log(userEmail, userId);
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(userId.toString(), salt);

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(
        userId,
        { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 },
        { new: true, runValidators: true }
      );
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(
        userId,
        {
          forgotPasswordToken: hashedToken,
          forgotPasswordTokenExpiry: Date.now() + 3600000,
        },
        { new: true, runValidators: true }
      );
    }

    // let transport1 = nodemailer.createTransport({
    //   service: process.env.NODEMAILER_HOST,
    //   port: process.env.NODEMAILER_PORT,
    //   // secure: true,
    //   logger: true,
    //   debug: true,
    //   // secureConnection: false,
    //   auth: {
    //     user: process.env.NODEMAILER_USER,
    //     pass: process.env.NODEMAILER_PASSWORD,
    //   },
    //   tls: {
    //     rejectUnauthorized: true,
    //   },
    // });

    const transport = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      service: "gmail",
      port: 485,
      secure: true,
      logger: true,
      debug: true,
      secureConnection: true,
      auth: {
        user: "updateusman06@gmail.com",
        pass: "ndkizjfhaxzvxtlx",
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    const mailOptions = {
      from: "updateusman06@gmail.com",
      to: userEmail,
      subject: "Email Verification",
      html: `<p> Click <a href="${
        process.env.DOMAIN
      }/verifyemail?token=${hashedToken}">here</a> to ${
        emailType === "VERIFY" ? "verify Your Email" : "Reset Your Password"
      } <br /> 
      Or "Copy and Past the following link into your browser <br />
      ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
      </p>`,
    };

    console.log(transport);

    try {
      const info = await transport.sendMail(mailOptions);

      console.log("Email sent Succefully ", info.response);
      return info;
    } catch (error) {
      console.error("Error while Sending Email: ", error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

// const verifyEmailToken = async (token) => {
//   try {
//     console.log("In Verify Email", token);
//     const user = await User.findOne({ verifyToken: token });

//     if (!user) {
//       throw new Error("Could not find verifaication token", error.message);
//     }

//     if (user.verifyTokenExpiry && user.verifyTokenExpiry < Date.now()) {
//       throw new Error("Token has been Expired");
//     }

//     user.isVerified = true;
//     user.verifyToken = undefined;
//     user.verifyTokenExpiry = undefined;

//     await user.save();
//   } catch (error) {
//     throw new Error("Could not find verification token", error.message);
//   }
// };

export { verifyEmail };
