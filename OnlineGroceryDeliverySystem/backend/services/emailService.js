import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create reusable transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'FreshCart'}" <${process.env.FROM_EMAIL || 'no-reply@freshcart.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV === 'development') {
    console.log(`Email dispatched: ${info.messageId}`);
  }
};

export default sendEmail;
