import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, html, text, from }) => {
  const mailOptions = {
    from: from || process.env.EMAIL_FROM || 'noreply@aspira.com',
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
