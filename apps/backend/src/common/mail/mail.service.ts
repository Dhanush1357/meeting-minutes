import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  /**
   * Sends a password reset email to the specified email address.
   *
   * @param email - The recipient's email address.
   * @param resetToken - The token to include in the reset password link.
   * @throws Error if the email fails to send.
   */
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

  /**
   * Sends a welcome email with login details to the specified email address.
   *
   * @param to - The recipient's email address.
   * @param username - The username to include in the email.
   * @param password - The password to include in the email.
   * @throws Error if the email fails to send.
   */
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

  /**
   * Sends a project created notification email to the specified email address.
   *
   * @param email - The recipient's email address.
   * @param project - The project object containing the project title.
   * @throws Error if the email fails to send.
   */
  async sendProjectCreatedMail(email: string, project: Project) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'New Project Created!',
        text: `Project: "${project.title}" has been created by admin and you are assigned as a creator.`,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send project created email: ${error.message}`);
    }
  }
}
