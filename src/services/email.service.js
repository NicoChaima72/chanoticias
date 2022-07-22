const nodemailer = require("nodemailer");

const emailConfig = require("../config/email.config");

const transporter = nodemailer.createTransport(emailConfig);

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: '"Chaimanoticias" <noreply@chaimanoticias.com>',
    to: options.user.email,
    subject: `Chaimanoticias - ${options.subject}`,
    text: options.body,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);

      return resolve(true);
    });
  });
};
