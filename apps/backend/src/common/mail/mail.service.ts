import { Injectable } from '@nestjs/common';
import { Project, MoM, User } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { generateEmailContent } from './utils';
import { ProjectUtils } from 'src/projects/utils';

@Injectable()
export class MailService {
  constructor(private readonly projectUtils: ProjectUtils) {}

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
        text: `Your login details are: username: ${username}, password:  ${password}`,
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

  async sendMoMCreatedEmail(
    mom: MoM,
    attachments: any[],
    project: any,
    creator: User,
    usersToSend: any[],
  ): Promise<void> {
    try {
      const emailContent =
        mom && project && creator
          ? generateEmailContent(mom, project, creator)
          : `
          <div style="font-family: Arial, sans-serif;">
            <p>Please find the meeting minutes attached.</p>
          </div>
        `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: usersToSend,
        subject: 'New Project Created By Admin!',
        html: emailContent,
        attachments: attachments,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async notifyReviewers(mom: any, reviewers: any) {
    try {

      const emails = reviewers.map((user) => user.user.email);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: 'MoM Sent for Review',
        text: `A new MoM titled "${mom.title}" has been sent for review. Please review it at your earliest convenience.`,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send review notification email:', error);
      throw new Error('Failed to send review notification email');
    }
  }


  async notifyApprovers(mom: MoM, users: any) {
    try {
      const emails = users.map((user) => user.user.email);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: 'MoM Sent for Approval',
        text: `The MoM titled "${mom.title}" has been reviewed and is now awaiting approval.`,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send approval notification email:', error);
      throw new Error('Failed to send approval notification email');
    }
  }

  async notifyCreatorRejection(mom: MoM, users: any) {
    try {
      const emails = users.map((user) => user.user.email);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: 'MoM Rejected by Reviewer',
        text: `The MoM titled "${mom.title}" has been rejected by the reviewer. Please review and make necessary changes.`,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send rejection notification email:', error);
      throw new Error('Failed to send rejection notification email');
    }
  }

  async notifyApproval(mom: MoM, pdfBuffer: Buffer, project: any) {
    try {
      const users = project.user_roles.map((role) => role.user.email);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: users,
        subject: 'MoM Approved',
        text: `The MoM titled "${mom.title}" has been approved. Please find the attached PDF.`,
        attachments: [
          {
            filename: `MoM_${mom.id}.pdf`,
            content: pdfBuffer,
          },
        ],
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send approval notification email:', error);
      throw new Error('Failed to send approval notification email');
    }
  }

  async notifyRejectionByApprover(mom: MoM, users: any) {
    try {
      const emails = users.map((user) => user.user.email);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: 'MoM Rejected by Approver',
        text: `The MoM titled "${mom.title}" has been rejected by the approver. Please review and make necessary updates.`,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send rejection notification email:', error);
      throw new Error('Failed to send rejection notification email');
    }
  }
}
