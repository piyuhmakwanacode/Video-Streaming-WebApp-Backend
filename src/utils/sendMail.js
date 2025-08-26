import nodemailer from "nodemailer";
const sendMail = async(to, sub, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SEND_EMAIL_USERNAME,
      pass: process.env.SEND_EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SEND_EMAIL_USERNAME,
    to: to,
    sub: sub,
    html: `<p>Your OTP is: <b>${otp}</b></p>`,
  };
  await transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("email sending Error :-", err);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

export { sendMail };
