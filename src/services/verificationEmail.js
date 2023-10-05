
const nodemailer = require("nodemailer");

const sendMail = (data, req) => {
  const { email, _id, name } = data;
  let verificationLink = `${req.protocol}://${req.headers.host}/verify/${_id}`;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const senderName = "Naya Game Studio";
  const mailOptions = {
    from: senderName,
    to: email,
    subject: "Email Confirmation",
    html: `
    <p>Hello ${name},</p>
    <p>Thank you for signing up! To complete your registration, please click the link below:</p>
    <p><a href="${verificationLink}">Link </a></p>
    <p>If you did not sign up for this account, you can ignore this email.</p>
    <p>Best regards,<br>${senderName}</p>
    `,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Mail Sent");
    }
  });
};

module.exports = sendMail;
