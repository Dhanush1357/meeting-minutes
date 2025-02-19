import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendResetPasswordMail(email: string, resetToken: string) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request!',
        text: `Use this link to reset your password: ${process.env.SERVER_URL}${process.env.RESET_PASSWORD_LINK}?token=${resetToken}`,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send reset password email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(to: string, username: string, password: string) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Welcome to our platform!',
        text: `Your login details are: username - ${username}, password - ${password}`,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }
}
